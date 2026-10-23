<script setup>
import { computed, reactive, ref } from 'vue'
import ListaMagias from '../components/ListaMagias.vue'
import { magias } from '../data/magias.js'
import {
  definirIdAberta,
  listarFichas,
  obterIdAberta,
  salvarFicha,
} from '../services/personagensStorage.js'
import { paraBusca } from '../utils/texto.js'

const busca = ref('')
const filtros = reactive({ categoria: '', elemento: '', nivel: '' })

const valoresUnicos = (campo) =>
  [...new Set(magias.map((m) => m[campo]))].sort((a, b) =>
    typeof a === 'number' ? a - b : String(a).localeCompare(String(b), 'pt-BR'),
  )

const opcoes = {
  categoria: valoresUnicos('categoria'),
  elemento: valoresUnicos('elemento'),
  nivel: valoresUnicos('nivel'),
}

const filtradas = computed(() => {
  const termo = paraBusca(busca.value)
  return magias
    .filter(
      (m) =>
        (!termo || paraBusca(m.nome).includes(termo)) &&
        (!filtros.categoria || m.categoria === filtros.categoria) &&
        (!filtros.elemento || m.elemento === filtros.elemento) &&
        (!filtros.nivel || String(m.nivel) === filtros.nivel),
    )
    .sort((a, b) => a.nivel - b.nivel || a.nome.localeCompare(b.nome, 'pt-BR'))
})

const temFiltro = computed(
  () => busca.value || filtros.categoria || filtros.elemento || filtros.nivel,
)

function limpar() {
  busca.value = ''
  Object.assign(filtros, { categoria: '', elemento: '', nivel: '' })
}

// Associação de magias a uma ficha salva neste navegador.
const fichas = ref(listarFichas())
const idInicial = obterIdAberta()
const fichaAlvoId = ref(
  fichas.value.some((f) => f.id === idInicial) ? idInicial : (fichas.value[0]?.id ?? ''),
)
const fichaAlvo = computed(() => fichas.value.find((f) => f.id === fichaAlvoId.value) ?? null)
const aviso = ref('')

function adicionar(magiaId) {
  const ficha = fichaAlvo.value
  if (!ficha || ficha.magiasIds.includes(magiaId)) return
  const atualizada = { ...ficha, magiasIds: [...ficha.magiasIds, magiaId] }
  if (salvarFicha(atualizada)) {
    fichas.value = listarFichas()
    definirIdAberta(ficha.id)
    const nomeMagia = magias.find((m) => m.id === magiaId)?.nome
    aviso.value = `${nomeMagia} adicionada à ficha de ${ficha.nome || 'personagem sem nome'}.`
  } else {
    aviso.value = 'Não foi possível salvar no navegador.'
  }
}
</script>

<template>
  <div class="grimorio">
    <section class="painel filtros" aria-label="Busca e filtros">
      <div class="filtros__busca">
        <label for="busca-magia">Buscar magia</label>
        <input
          id="busca-magia"
          v-model="busca"
          class="campo"
          type="search"
          placeholder="Nome da magia…"
        />
      </div>
      <div class="filtros__grupo">
        <label for="filtro-categoria">Categoria</label>
        <select id="filtro-categoria" v-model="filtros.categoria" class="campo">
          <option value="">Todas</option>
          <option v-for="c in opcoes.categoria" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="filtros__grupo">
        <label for="filtro-elemento">Elemento</label>
        <select id="filtro-elemento" v-model="filtros.elemento" class="campo">
          <option value="">Todos</option>
          <option v-for="e in opcoes.elemento" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>
      <div class="filtros__grupo">
        <label for="filtro-nivel">Nível</label>
        <select id="filtro-nivel" v-model="filtros.nivel" class="campo">
          <option value="">Todos</option>
          <option v-for="n in opcoes.nivel" :key="n" :value="String(n)">{{ n }}</option>
        </select>
      </div>

      <div v-if="fichas.length" class="filtros__grupo filtros__alvo">
        <label for="ficha-alvo">Adicionar magias à ficha de</label>
        <select id="ficha-alvo" v-model="fichaAlvoId" class="campo">
          <option v-for="f in fichas" :key="f.id" :value="f.id">
            {{ f.nome || 'Personagem sem nome' }}
          </option>
        </select>
      </div>
    </section>

    <div class="resultado">
      <p class="aviso" aria-live="polite">
        {{ filtradas.length }} de {{ magias.length }} magias
        <button v-if="temFiltro" type="button" class="botao botao--pequeno" @click="limpar">
          Limpar filtros
        </button>
      </p>
      <p v-if="aviso" class="aviso" role="status">{{ aviso }}</p>
    </div>

    <ListaMagias
      v-if="filtradas.length"
      :magias="filtradas"
      :ids-na-ficha="fichaAlvo ? fichaAlvo.magiasIds : null"
      @adicionar="adicionar"
    />
    <div v-else class="painel vazio">Nenhuma magia encontrada com esses filtros.</div>
  </div>
</template>

<style scoped>
.filtros {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 0.75rem;
  align-items: end;
}

.filtros label {
  display: block;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.filtros__alvo {
  grid-column: 1 / -1;
  max-width: 420px;
}

.resultado {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.75rem 0;
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

  .filtros__busca {
    grid-column: 1 / -1;
  }
}
</style>
