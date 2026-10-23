<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ListaMagias from '../components/ListaMagias.vue'
import { agruparPorNivel, classeDoCatalogo, classes, magias } from '../data/magias.js'
import { adicionarMagia, ouvirFichas } from '../services/mesaOnline.js'
import { definirIdAberta, obterIdAberta } from '../services/preferencias.js'
import { paraBusca } from '../utils/texto.js'

const props = defineProps({
  // Sem mesa, o catálogo funciona só para consulta.
  mesaId: { type: String, default: null },
})

const TODAS = ''

// Fichas da mesa, para adicionar magias a uma delas.
const fichas = ref([])
const fichaAlvoId = ref(props.mesaId ? (obterIdAberta(props.mesaId) ?? '') : '')
const fichaAlvo = computed(() => fichas.value.find((f) => f.id === fichaAlvoId.value) ?? null)
const aviso = ref('')
let pararDeOuvir = null

onMounted(() => {
  if (!props.mesaId) return
  pararDeOuvir = ouvirFichas(
    props.mesaId,
    (lista) => {
      fichas.value = [...lista].sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'))
      if (!fichaAlvo.value) fichaAlvoId.value = fichas.value[0]?.id ?? ''
    },
    (erro) => {
      console.error(erro)
      aviso.value = 'Não foi possível carregar as fichas da mesa.'
    },
  )
})

onBeforeUnmount(() => pararDeOuvir?.())

const classe = ref(classes[0])
const busca = ref('')
const nivel = ref('')

// Mostra a classe da ficha alvo quando ela é escolhida (ou carregada).
watch(
  () => fichaAlvo.value?.id,
  () => {
    const daFicha = classeDoCatalogo(fichaAlvo.value?.classe)
    if (daFicha) classe.value = daFicha
    aviso.value = ''
  },
)

const niveis = [...new Set(magias.map((m) => m.nivel))].sort((a, b) => a - b)

const filtradas = computed(() => {
  const termo = paraBusca(busca.value)
  return magias.filter(
    (m) =>
      (classe.value === TODAS || m.classe === classe.value) &&
      (!nivel.value || String(m.nivel) === nivel.value) &&
      (!termo || paraBusca(m.nome).includes(termo) || paraBusca(m.efeito).includes(termo)),
  )
})

const grupos = computed(() => agruparPorNivel(filtradas.value))
const totalDaClasse = computed(() =>
  classe.value === TODAS ? magias.length : magias.filter((m) => m.classe === classe.value).length,
)

function limpar() {
  busca.value = ''
  nivel.value = ''
}

function adicionar(magiaId) {
  const ficha = fichaAlvo.value
  if (!ficha || ficha.magiasIds.includes(magiaId)) return
  definirIdAberta(props.mesaId, ficha.id)
  const nomeMagia = magias.find((m) => m.id === magiaId)?.nome
  aviso.value = `${nomeMagia} adicionada à ficha de ${ficha.nome || 'personagem sem nome'}.`
  adicionarMagia(props.mesaId, ficha.id, magiaId).catch((erro) => {
    console.error(erro)
    aviso.value = `Não foi possível adicionar ${nomeMagia}.`
  })
}
</script>

<template>
  <div class="grimorio">
    <nav class="classes" aria-label="Classes">
      <button
        v-for="c in classes"
        :key="c"
        type="button"
        class="classe"
        :aria-pressed="classe === c"
        @click="classe = c"
      >
        {{ c }}
      </button>
      <button
        type="button"
        class="classe"
        :aria-pressed="classe === TODAS"
        @click="classe = TODAS"
      >
        Todas
      </button>
    </nav>

    <section class="painel filtros" aria-label="Busca e filtros">
      <div class="filtros__busca">
        <label for="busca-magia">Buscar magia</label>
        <input
          id="busca-magia"
          v-model="busca"
          class="campo"
          type="search"
          placeholder="Nome ou efeito (ex.: cura, fogo, 2d6)…"
        />
      </div>
      <div>
        <label for="filtro-nivel">Nível</label>
        <select id="filtro-nivel" v-model="nivel" class="campo">
          <option value="">Todos</option>
          <option v-for="n in niveis" :key="n" :value="String(n)">{{ n }}</option>
        </select>
      </div>
      <div v-if="fichas.length" class="filtros__alvo">
        <label for="ficha-alvo">Adicionar magias à ficha de</label>
        <select id="ficha-alvo" v-model="fichaAlvoId" class="campo">
          <option v-for="f in fichas" :key="f.id" :value="f.id">
            {{ f.nome || 'Personagem sem nome' }}{{ f.classe ? ` (${f.classe})` : '' }}
          </option>
        </select>
      </div>
    </section>

    <div class="resultado">
      <h2 class="resultado__titulo">{{ classe || 'Todas as classes' }}</h2>
      <p class="aviso" aria-live="polite">
        {{ filtradas.length }} de {{ totalDaClasse }} magias
        <button
          v-if="busca || nivel"
          type="button"
          class="botao botao--pequeno"
          @click="limpar"
        >
          Limpar filtros
        </button>
      </p>
    </div>
    <p v-if="aviso" class="mensagem" role="status">{{ aviso }}</p>

    <ListaMagias
      v-if="grupos.length"
      :grupos="grupos"
      :mostrar-classe="classe === TODAS"
      :ids-na-ficha="fichaAlvo ? fichaAlvo.magiasIds : null"
      @adicionar="adicionar"
    />
    <div v-else class="painel vazio">Nenhuma magia encontrada com esses filtros.</div>
  </div>
</template>

<style scoped>
.classes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.classe {
  padding: 0.35em 0.9em;
  border: 2px solid var(--tinta);
  border-radius: 8px;
  background: var(--caixa);
  cursor: pointer;
  font-weight: bold;
}

.classe:hover {
  background: var(--pergaminho);
}

.classe[aria-pressed='true'] {
  background: var(--tinta);
  color: var(--pergaminho);
}

.classe:focus-visible {
  outline: 2px solid var(--destaque);
  outline-offset: 2px;
}

.filtros {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  gap: 0.75rem;
  align-items: end;
}

.filtros label {
  display: block;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.resultado {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 1rem 0 0.75rem;
}

.resultado__titulo {
  font-size: 1.5rem;
}

.resultado .aviso {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.vazio {
  text-align: center;
  color: var(--tinta-suave);
}

@media (max-width: 720px) {
  .filtros {
    grid-template-columns: 1fr 1fr;
  }

  .filtros__busca,
  .filtros__alvo {
    grid-column: 1 / -1;
  }
}
</style>
