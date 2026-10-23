<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import FichaPersonagem from '../components/FichaPersonagem.vue'
import ListaPersonagens from '../components/ListaPersonagens.vue'
import {
  criarFicha,
  definirIdAberta,
  excluirFicha,
  listarFichas,
  novoIdFicha,
  obterIdAberta,
  salvarFicha,
} from '../services/personagensStorage.js'
import { exportarFicha, exportarTodas, lerArquivoFichas } from '../services/arquivoJson.js'

const fichas = ref(listarFichas())
const fichaAberta = ref(null)
const estado = ref('') // '', 'pendente', 'salvo', 'erro'
const mensagem = ref(null) // { texto, erro }
const entradaArquivo = ref(null)

let temporizador = null
let pendente = false

function abrir(id) {
  salvarAgora()
  const ficha = fichas.value.find((f) => f.id === id)
  fichaAberta.value = ficha ? JSON.parse(JSON.stringify(ficha)) : null
  definirIdAberta(fichaAberta.value?.id ?? null)
  estado.value = ''
}

function recarregarLista() {
  fichas.value = listarFichas()
}

function descartarPendente() {
  clearTimeout(temporizador)
  pendente = false
}

function salvarAgora() {
  if (!pendente) return
  descartarPendente()
  if (!fichaAberta.value) return
  if (salvarFicha(fichaAberta.value)) {
    estado.value = 'salvo'
    recarregarLista()
  } else {
    estado.value = 'erro'
  }
}

// Salvamento automático: só reage a edições na ficha aberta, não à troca de ficha.
watch(
  fichaAberta,
  (nova, antiga) => {
    if (!nova || nova !== antiga) return
    estado.value = 'pendente'
    pendente = true
    clearTimeout(temporizador)
    temporizador = setTimeout(salvarAgora, 400)
  },
  { deep: true },
)

function nova() {
  salvarAgora()
  const ficha = criarFicha()
  if (!salvarFicha(ficha)) {
    mensagem.value = { texto: 'Não foi possível salvar no navegador.', erro: true }
    return
  }
  recarregarLista()
  abrir(ficha.id)
  mensagem.value = null
}

function excluir(ficha) {
  const nome = ficha.nome || 'Personagem sem nome'
  if (!confirm(`Excluir a ficha "${nome}"? Esta ação não pode ser desfeita.`)) return
  if (fichaAberta.value?.id === ficha.id) {
    descartarPendente()
    fichaAberta.value = null
  }
  excluirFicha(ficha.id)
  recarregarLista()
  if (!fichaAberta.value && fichas.value.length) abrir(fichas.value[0].id)
  if (!fichaAberta.value) definirIdAberta(null)
  mensagem.value = { texto: `Ficha "${nome}" excluída.` }
}

function exportar(ficha) {
  salvarAgora()
  exportarFicha(fichas.value.find((f) => f.id === ficha.id) ?? ficha)
}

function exportarBackup() {
  salvarAgora()
  exportarTodas(fichas.value)
}

async function importar(evento) {
  const arquivos = [...(evento.target.files ?? [])]
  evento.target.value = ''
  if (!arquivos.length) return
  salvarAgora()

  let importadas = 0
  try {
    for (const arquivo of arquivos) {
      for (const ficha of await lerArquivoFichas(arquivo)) {
        const existente = fichas.value.find((f) => f.id === ficha.id)
        if (existente) {
          const substituir = confirm(
            `Já existe a ficha "${existente.nome || 'sem nome'}".\n\n` +
              'OK = substituir pela versão importada\nCancelar = importar como cópia',
          )
          if (!substituir) {
            ficha.id = novoIdFicha()
            ficha.nome = `${ficha.nome || 'Personagem'} (cópia)`
          }
        }
        if (!salvarFicha(ficha)) throw new Error('Não foi possível salvar no navegador.')
        recarregarLista()
        importadas++
      }
    }
    mensagem.value = { texto: `${importadas} ficha(s) importada(s).` }
  } catch (erro) {
    const parcial = importadas ? ` (${importadas} ficha(s) importada(s) antes do erro.)` : ''
    mensagem.value = { texto: erro.message + parcial, erro: true }
  }

  // Recarrega a ficha aberta caso ela tenha sido substituída.
  const idAberta = fichaAberta.value?.id ?? fichas.value[0]?.id
  if (idAberta) abrir(idAberta)
}

function aoSairDaPagina() {
  salvarAgora()
}

onMounted(() => {
  const id = obterIdAberta()
  const inicial = fichas.value.find((f) => f.id === id) ?? fichas.value[0]
  if (inicial) abrir(inicial.id)
  window.addEventListener('pagehide', aoSairDaPagina)
})

onBeforeUnmount(() => {
  salvarAgora()
  window.removeEventListener('pagehide', aoSairDaPagina)
})
</script>

<template>
  <div class="personagens">
    <aside class="personagens__lateral">
      <ListaPersonagens
        :fichas="fichas"
        :selecionada-id="fichaAberta?.id ?? null"
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
          As fichas ficam salvas só neste navegador. Exporte um backup de vez em quando.
        </p>
      </div>
    </aside>

    <section class="personagens__principal">
      <div
        v-if="mensagem"
        class="mensagem"
        :class="{ 'mensagem--erro': mensagem.erro }"
        role="status"
      >
        {{ mensagem.texto }}
        <button type="button" class="botao botao--pequeno fechar" @click="mensagem = null">
          Fechar
        </button>
      </div>

      <template v-if="fichaAberta">
        <p class="estado" aria-live="polite">
          <span v-if="estado === 'pendente'">Salvando…</span>
          <span v-else-if="estado === 'salvo'">✓ Salvo neste navegador</span>
          <span v-else-if="estado === 'erro'" class="estado--erro">
            Não foi possível salvar (armazenamento cheio ou bloqueado).
          </span>
        </p>
        <FichaPersonagem :key="fichaAberta.id" v-model="fichaAberta" />
      </template>

      <div v-else class="painel vazio">
        <h2>Nenhuma ficha aberta</h2>
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
