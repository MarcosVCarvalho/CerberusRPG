<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PersonagensView from './views/PersonagensView.vue'
import GrimorioView from './views/GrimorioView.vue'
import RegrasView from './views/RegrasView.vue'
import MesaInicio from './components/MesaInicio.vue'
import RoladorDados from './components/RoladorDados.vue'
import { firebaseConfigurado } from './services/firebase.js'
import { linkDaMesa, obterMesa } from './services/mesaOnline.js'
import {
  entrarNaMesa,
  esquecerMesa,
  lembrarMesa,
  mesaAtualId,
  sairDaMesa,
} from './services/preferencias.js'

// Navegação por hash: #/personagens, #/grimorio, #/regras e #/mesa/<código> (link de convite).
const rotas = {
  personagens: 'Personagens',
  grimorio: 'Grimório de magias',
  regras: 'Regras',
}

const rotaAtual = ref('personagens')
const mesa = ref(null) // { id, nome }
const avisoMesa = ref('')
const linkCopiado = ref(false)

function lerHash() {
  const caminho = location.hash.replace(/^#\/?/, '')
  const convite = caminho.match(/^mesa\/([a-z0-9]+)/i)
  if (convite) {
    entrarNaMesa(convite[1].toLowerCase())
    history.replaceState(null, '', '#/personagens')
    rotaAtual.value = 'personagens'
    return
  }
  rotaAtual.value = caminho in rotas ? caminho : 'personagens'
}

watch(
  mesaAtualId,
  async (id) => {
    mesa.value = null
    linkCopiado.value = false
    if (!id || !firebaseConfigurado) return
    try {
      const encontrada = await obterMesa(id)
      if (mesaAtualId.value !== id) return
      if (encontrada) {
        mesa.value = encontrada
        avisoMesa.value = ''
        lembrarMesa(encontrada.id, encontrada.nome)
      } else {
        esquecerMesa(id)
        sairDaMesa()
        avisoMesa.value = 'Mesa não encontrada. Confira o link de convite.'
      }
    } catch (erro) {
      // Sem internet: continua na mesa; as fichas aparecem quando a conexão voltar.
      console.error(erro)
      if (mesaAtualId.value === id) mesa.value = { id, nome: '' }
    }
  },
  { immediate: true },
)

function entrar(id) {
  avisoMesa.value = ''
  entrarNaMesa(id)
  location.hash = '#/personagens'
}

function trocarDeMesa() {
  sairDaMesa()
  location.hash = '#/personagens'
}

async function copiarLink() {
  const link = linkDaMesa(mesaAtualId.value)
  try {
    await navigator.clipboard.writeText(link)
    linkCopiado.value = true
    setTimeout(() => (linkCopiado.value = false), 2500)
  } catch {
    prompt('Copie o link de convite da mesa:', link)
  }
}

lerHash()
onMounted(() => window.addEventListener('hashchange', lerHash))
onBeforeUnmount(() => window.removeEventListener('hashchange', lerHash))
</script>

<template>
  <div class="app">
    <header class="cabecalho">
      <p class="cabecalho__sobretitulo">Crônicas da campanha</p>
      <h1 class="cabecalho__titulo">Grimório RPG</h1>
      <p class="cabecalho__subtitulo">O registro das suas aventuras</p>

      <div v-if="mesaAtualId && firebaseConfigurado" class="mesa">
        <span class="mesa__nome">
          Mesa: <strong>{{ mesa ? mesa.nome || 'sem nome' : '…' }}</strong>
        </span>
        <button type="button" class="botao botao--pequeno" @click="copiarLink">
          {{ linkCopiado ? '✓ Link copiado' : 'Copiar link de convite' }}
        </button>
        <button type="button" class="botao botao--pequeno" @click="trocarDeMesa">
          Trocar de mesa
        </button>
      </div>

      <nav class="abas" aria-label="Seções">
        <a
          v-for="(titulo, nome) in rotas"
          :key="nome"
          :href="`#/${nome}`"
          class="aba"
          :aria-current="rotaAtual === nome ? 'page' : undefined"
        >
          {{ titulo }}
        </a>
      </nav>
    </header>

    <main>
      <template v-if="rotaAtual === 'personagens'">
        <PersonagensView
          v-if="mesaAtualId && firebaseConfigurado"
          :key="mesaAtualId"
          :mesa-id="mesaAtualId"
        />
        <MesaInicio v-else :aviso="avisoMesa" @entrar="entrar" />
      </template>
      <GrimorioView
        v-else-if="rotaAtual === 'grimorio'"
        :key="mesaAtualId ?? 'sem-mesa'"
        :mesa-id="firebaseConfigurado ? mesaAtualId : null"
      />
      <RegrasView v-else />
    </main>

    <RoladorDados />

    <footer class="rodape">
      As fichas ficam na mesa online e todos com o link de convite podem ver e editar. Use
      “Exportar” para guardar uma cópia de segurança.
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
}

.cabecalho {
  text-align: center;
  margin-bottom: 1.5rem;
}

.cabecalho__sobretitulo {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--tinta-suave);
}

.cabecalho__titulo {
  font-size: clamp(2rem, 6vw, 3rem);
  margin: 0.15rem 0;
}

.cabecalho__subtitulo {
  margin: 0;
  font-style: italic;
  color: var(--tinta-suave);
}

.mesa {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.mesa__nome {
  overflow-wrap: anywhere;
}

.abas {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.aba {
  padding: 0.45em 1.1em;
  border: 2px solid var(--tinta);
  border-radius: 999px;
  background: var(--pergaminho);
  color: var(--tinta);
  text-decoration: none;
  font-weight: bold;
}

.aba:hover {
  background: var(--caixa);
}

.aba[aria-current='page'] {
  background: var(--tinta);
  color: var(--pergaminho);
}

.rodape {
  /* Espaço extra para o botão flutuante de dados não cobrir o texto. */
  margin: 2.5rem 0 3rem;
  text-align: center;
  font-size: 0.8rem;
  font-style: italic;
  color: var(--tinta-suave);
}
</style>
