<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PersonagensView from './views/PersonagensView.vue'
import GrimorioView from './views/GrimorioView.vue'

// Navegação simples por hash (#/personagens, #/grimorio): funciona no GitHub Pages sem configuração.
const rotas = {
  personagens: { titulo: 'Personagens', componente: PersonagensView },
  grimorio: { titulo: 'Grimório de magias', componente: GrimorioView },
}

function rotaDoHash() {
  const nome = location.hash.replace(/^#\/?/, '')
  return nome in rotas ? nome : 'personagens'
}

const rotaAtual = ref(rotaDoHash())
const visao = computed(() => rotas[rotaAtual.value].componente)

function aoMudarHash() {
  rotaAtual.value = rotaDoHash()
}

onMounted(() => window.addEventListener('hashchange', aoMudarHash))
onBeforeUnmount(() => window.removeEventListener('hashchange', aoMudarHash))
</script>

<template>
  <div class="app">
    <header class="cabecalho">
      <p class="cabecalho__sobretitulo">Crônicas da campanha</p>
      <h1 class="cabecalho__titulo">Grimório RPG</h1>
      <p class="cabecalho__subtitulo">O registro das suas aventuras</p>

      <nav class="abas" aria-label="Seções">
        <a
          v-for="(rota, nome) in rotas"
          :key="nome"
          :href="`#/${nome}`"
          class="aba"
          :aria-current="rotaAtual === nome ? 'page' : undefined"
        >
          {{ rota.titulo }}
        </a>
      </nav>
    </header>

    <main>
      <component :is="visao" />
    </main>

    <footer class="rodape">
      Os dados ficam salvos apenas neste navegador. Use “Exportar” para fazer backup ou levar as
      fichas para outro dispositivo.
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
  margin-top: 2.5rem;
  text-align: center;
  font-size: 0.8rem;
  font-style: italic;
  color: var(--tinta-suave);
}
</style>
