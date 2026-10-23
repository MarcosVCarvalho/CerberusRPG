<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import FichaPersonagem from '../components/FichaPersonagem.vue'
import ListaPersonagens from '../components/ListaPersonagens.vue'
import {
  aplicarCampo,
  criarFicha,
  diferencas,
  normalizarFicha,
  novoId,
  planificar,
} from '../services/ficha.js'
import {
  atualizarCampos,
  excluirFicha,
  ouvirFichas,
  salvarFichaCompleta,
} from '../services/mesaOnline.js'
import {
  definirIdAberta,
  fichasLocaisPendentes,
  marcarFichasLocaisEnviadas,
  obterIdAberta,
} from '../services/preferencias.js'
import { exportarFicha, exportarTodas, lerArquivoFichas } from '../services/arquivoJson.js'

const props = defineProps({
  mesaId: { type: String, required: true },
})

const fichas = ref([])
const carregando = ref(true)
const offline = ref(false)
const selecionadaId = ref(obterIdAberta(props.mesaId))
// Cópia editável da ficha aberta. "base" guarda o último estado conhecido do banco
// (planificado); a diferença entre os dois são as edições locais ainda não enviadas.
const rascunho = ref(null)
let base = null
const estado = ref('') // '', 'pendente', 'salvo', 'erro'
const mensagem = ref(null) // { texto, erro }
const entradaArquivo = ref(null)
const fichasLocais = ref(fichasLocaisPendentes())

let temporizador = null
let gravacoesEmAndamento = 0
let excluindoId = null
let criandoId = null
let pararDeOuvir = null

function mostrarErro(erro, contexto) {
  console.error(erro)
  const texto =
    erro?.code === 'permission-denied'
      ? 'Sem permissão para acessar esta mesa. Confira as regras do Firestore.'
      : `${contexto}: ${erro?.message ?? erro}`
  mensagem.value = { texto, erro: true }
}

function clonar(ficha) {
  return JSON.parse(JSON.stringify(ficha))
}

// Aplica o estado do banco na ficha aberta, preservando os campos com edição local pendente.
function sincronizarAberta() {
  const remota = fichas.value.find((f) => f.id === selecionadaId.value)
  if (!remota) {
    clearTimeout(temporizador)
    temporizador = null
    rascunho.value = null
    base = null
    return
  }
  const plano = planificar(remota)
  if (!rascunho.value || rascunho.value.id !== remota.id || !base) {
    rascunho.value = clonar(remota)
    base = plano
    return
  }
  const pendentes = diferencas(planificar(rascunho.value), base)
  for (const [chave, valor] of Object.entries(plano)) {
    if (!(chave in pendentes)) aplicarCampo(rascunho.value, chave, valor)
  }
  base = plano
}

function enviarAgora() {
  clearTimeout(temporizador)
  temporizador = null
  if (!rascunho.value || !base) return
  const patch = diferencas(planificar(rascunho.value), base)
  if (!Object.keys(patch).length) return
  const fichaId = rascunho.value.id
  base = { ...base, ...patch }
  gravacoesEmAndamento++
  // A promessa só termina quando o servidor confirma (fica pendente se estiver sem internet).
  atualizarCampos(props.mesaId, fichaId, patch)
    .then(() => {
      gravacoesEmAndamento--
      if (!gravacoesEmAndamento && !temporizador && estado.value !== 'erro') estado.value = 'salvo'
    })
    .catch((erro) => {
      gravacoesEmAndamento--
      estado.value = 'erro'
      console.error(erro)
    })
}

watch(
  rascunho,
  () => {
    if (!rascunho.value || !base) return
    if (!Object.keys(diferencas(planificar(rascunho.value), base)).length) return
    estado.value = 'pendente'
    clearTimeout(temporizador)
    temporizador = setTimeout(enviarAgora, 400)
  },
  { deep: true },
)

function ordenadas(lista) {
  return [...lista].sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'))
}

function abrir(id) {
  enviarAgora()
  selecionadaId.value = id
  definirIdAberta(props.mesaId, id)
  rascunho.value = null
  base = null
  estado.value = ''
  sincronizarAberta()
}

function aoReceberFichas(lista, { offline: semConexao }) {
  fichas.value = lista
  offline.value = semConexao
  carregando.value = false
  const presente = lista.some((f) => f.id === selecionadaId.value)
  if (presente && selecionadaId.value === criandoId) criandoId = null
  if (!presente && selecionadaId.value !== criandoId) {
    if (rascunho.value && selecionadaId.value !== excluindoId) {
      mensagem.value = { texto: 'A ficha que estava aberta foi excluída por outra pessoa.' }
    }
    excluindoId = null
    selecionadaId.value = ordenadas(lista)[0]?.id ?? null
    estado.value = ''
  }
  sincronizarAberta()
}

function nova() {
  enviarAgora()
  const ficha = criarFicha()
  criandoId = ficha.id
  selecionadaId.value = ficha.id
  definirIdAberta(props.mesaId, ficha.id)
  estado.value = ''
  mensagem.value = null
  salvarFichaCompleta(props.mesaId, ficha).catch((e) => mostrarErro(e, 'Não foi possível criar'))
}

function excluir(ficha) {
  const nome = ficha.nome || 'Personagem sem nome'
  if (!confirm(`Excluir a ficha "${nome}" para todos da mesa? Esta ação não pode ser desfeita.`)) {
    return
  }
  if (ficha.id === selecionadaId.value) {
    clearTimeout(temporizador)
    temporizador = null
    excluindoId = ficha.id
  }
  excluirFicha(props.mesaId, ficha.id).catch((e) => mostrarErro(e, 'Não foi possível excluir'))
  mensagem.value = { texto: `Ficha "${nome}" excluída.` }
}

function exportar(ficha) {
  enviarAgora()
  exportarFicha(rascunho.value?.id === ficha.id ? rascunho.value : ficha)
}

function exportarBackup() {
  enviarAgora()
  exportarTodas(fichas.value)
}

function enviarParaMesa(lista) {
  for (const ficha of lista) {
    salvarFichaCompleta(props.mesaId, ficha).catch((e) => mostrarErro(e, 'Não foi possível salvar'))
  }
}

async function importar(evento) {
  const arquivos = [...(evento.target.files ?? [])]
  evento.target.value = ''
  if (!arquivos.length) return
  enviarAgora()

  const paraEnviar = []
  try {
    for (const arquivo of arquivos) {
      for (const ficha of await lerArquivoFichas(arquivo)) {
        const existente = fichas.value.find((f) => f.id === ficha.id)
        if (existente) {
          const substituir = confirm(
            `Já existe a ficha "${existente.nome || 'sem nome'}" nesta mesa.\n\n` +
              'OK = substituir pela versão importada\nCancelar = importar como cópia',
          )
          if (!substituir) {
            ficha.id = novoId()
            ficha.nome = `${ficha.nome || 'Personagem'} (cópia)`
          }
        }
        paraEnviar.push(ficha)
      }
    }
  } catch (erro) {
    mensagem.value = { texto: erro.message, erro: true }
    return
  }
  // Uma ficha substituída que esteja aberta é recarregada inteira do banco.
  if (paraEnviar.some((f) => f.id === selecionadaId.value)) {
    clearTimeout(temporizador)
    temporizador = null
    base = null
  }
  enviarParaMesa(paraEnviar)
  mensagem.value = { texto: `${paraEnviar.length} ficha(s) importada(s).` }
}

function enviarFichasLocais() {
  const lista = fichasLocais.value.flatMap((item) => {
    try {
      return [normalizarFicha(item)]
    } catch {
      return []
    }
  })
  enviarParaMesa(lista)
  marcarFichasLocaisEnviadas()
  fichasLocais.value = []
  mensagem.value = { texto: `${lista.length} ficha(s) deste navegador enviada(s) para a mesa.` }
}

function aoSairDaPagina() {
  enviarAgora()
}

onMounted(() => {
  pararDeOuvir = ouvirFichas(props.mesaId, aoReceberFichas, (erro) => {
    carregando.value = false
    mostrarErro(erro, 'Não foi possível carregar a mesa')
  })
  window.addEventListener('pagehide', aoSairDaPagina)
})

onBeforeUnmount(() => {
  enviarAgora()
  pararDeOuvir?.()
  window.removeEventListener('pagehide', aoSairDaPagina)
})
</script>

<template>
  <div class="personagens">
    <aside class="personagens__lateral">
      <ListaPersonagens
        :fichas="fichas"
        :selecionada-id="selecionadaId"
        @abrir="abrir"
        @nova="nova"
        @excluir="excluir"
        @exportar="exportar"
      />

      <div class="painel backup">
        <h2 class="backup__titulo">Backup</h2>
        <div class="backup__acoes">
          <button type="button" class="botao botao--pequeno" @click="entradaArquivo.click()">
            Importar JSON
          </button>
          <button
            type="button"
            class="botao botao--pequeno"
            :disabled="!fichas.length"
            @click="exportarBackup"
          >
            Exportar todas
          </button>
        </div>
        <input
          ref="entradaArquivo"
          class="visualmente-oculto"
          type="file"
          accept=".json,application/json"
          multiple
          tabindex="-1"
          aria-hidden="true"
          @change="importar"
        />
        <p class="aviso">
          As fichas ficam online, na mesa, e todos com o link veem as mudanças na hora. Exportar
          gera uma cópia de segurança em arquivo.
        </p>
      </div>
    </aside>

    <section class="personagens__principal">
      <div v-if="offline && !carregando" class="mensagem mensagem--erro" role="status">
        Sem conexão com a mesa. Suas mudanças serão enviadas quando a internet voltar.
      </div>

      <div v-if="fichasLocais.length" class="mensagem migracao" role="status">
        <span>
          Este navegador tem {{ fichasLocais.length }} ficha(s) da versão anterior, salvas só aqui.
        </span>
        <span class="migracao__acoes">
          <button type="button" class="botao botao--primario botao--pequeno" @click="enviarFichasLocais">
            Enviar para esta mesa
          </button>
          <button type="button" class="botao botao--pequeno" @click="fichasLocais = []">
            Agora não
          </button>
        </span>
      </div>

      <div
        v-if="mensagem"
        class="mensagem"
        :class="{ 'mensagem--erro': mensagem.erro }"
        role="status"
      >
        {{ mensagem.texto }}
        <button type="button" class="botao botao--pequeno" @click="mensagem = null">Fechar</button>
      </div>

      <div v-if="carregando" class="painel vazio">Carregando a mesa…</div>

      <template v-else-if="rascunho">
        <p class="estado" aria-live="polite">
          <span v-if="estado === 'pendente'">Salvando…</span>
          <span v-else-if="estado === 'salvo'">✓ Salvo na mesa</span>
          <span v-else-if="estado === 'erro'" class="estado--erro">
            Não foi possível salvar a última mudança.
          </span>
        </p>
        <FichaPersonagem :key="rascunho.id" v-model="rascunho" />
      </template>

      <div v-else class="painel vazio">
        <h2>Nenhuma ficha na mesa</h2>
        <p>Crie uma nova ficha ou importe um arquivo JSON para começar.</p>
        <button type="button" class="botao botao--primario" @click="nova">+ Nova ficha</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.personagens {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.25rem;
  align-items: start;
}

.personagens__lateral {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.personagens__principal {
  min-width: 0;
}

.backup__titulo {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.backup__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.backup .aviso {
  margin: 0.6rem 0 0;
}

.estado {
  min-height: 1.5em;
  margin: 0 0 0.4rem;
  text-align: right;
  font-size: 0.85rem;
  color: var(--tinta-suave);
}

.estado--erro {
  color: var(--perigo);
}

.mensagem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.migracao {
  flex-wrap: wrap;
}

.migracao__acoes {
  display: flex;
  gap: 0.5rem;
}

.vazio {
  text-align: center;
  padding: 2.5rem 1rem;
}

.vazio p {
  color: var(--tinta-suave);
}

@media (max-width: 900px) {
  .personagens {
    grid-template-columns: 1fr;
  }

  .personagens__lateral {
    position: static;
  }
}
</style>
