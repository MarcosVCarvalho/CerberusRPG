<script setup>
import { computed, ref } from 'vue'
import {
  afiliacaoDoCatalogo,
  afiliacoes,
  agruparPorNivel,
  classeDoCatalogo,
  classes,
  magias,
  obterMagia,
  textoUsos,
} from '../data/magias.js'

// Lista de ids de magias do catálogo associadas à ficha.
const ids = defineModel({ type: Array, required: true })

const props = defineProps({
  // Textos dos campos "Classe" e "Afiliação" da ficha; filtram as opções quando correspondem ao catálogo.
  classe: { type: String, default: '' },
  afiliacao: { type: String, default: '' },
})

const escolhida = ref('')

const classeAtual = computed(() => classeDoCatalogo(props.classe))
const afiliacaoAtual = computed(() => afiliacaoDoCatalogo(props.afiliacao))

// Ids que não existem mais no catálogo são ignorados na exibição.
const associadas = computed(() =>
  ids.value
    .map(obterMagia)
    .filter(Boolean)
    .sort((a, b) => a.nivel - b.nivel || a.nome.localeCompare(b.nome, 'pt-BR')),
)

// Opções agrupadas: por nível da classe da ficha (ou por classe, se ela não for reconhecida),
// seguidas da afiliação da ficha (ou de todas, se ela não for reconhecida).
const grupos = computed(() => {
  const disponiveis = magias.filter((m) => !ids.value.includes(m.id))
  const doGrupo = (grupo) => disponiveis.filter((m) => m.grupo === grupo)
  const daClasse = classeAtual.value
    ? agruparPorNivel(doGrupo(classeAtual.value)).map((g) => ({
        rotulo: `Nível ${g.nivel}`,
        magias: g.magias,
        mostrarNivel: false,
      }))
    : classes.map((c) => ({ rotulo: c, magias: doGrupo(c), mostrarNivel: true }))
  const daAfiliacao = (afiliacaoAtual.value ? [afiliacaoAtual.value] : afiliacoes).map((a) => ({
    rotulo: `Afiliação: ${a}`,
    magias: doGrupo(a),
    mostrarNivel: true,
  }))
  return [...daClasse, ...daAfiliacao].filter((g) => g.magias.length)
})

function adicionar() {
  if (!escolhida.value || ids.value.includes(escolhida.value)) return
  ids.value.push(escolhida.value)
  escolhida.value = ''
}

function remover(id) {
  const indice = ids.value.indexOf(id)
  if (indice >= 0) ids.value.splice(indice, 1)
}
</script>

<template>
  <div class="seletor">
    <ul v-if="associadas.length" class="seletor__lista">
      <li v-for="magia in associadas" :key="magia.id" class="seletor__item">
        <div class="seletor__texto">
          <strong>{{ magia.nome }}</strong>
          <span class="seletor__efeito">{{ magia.efeito }}</span>
          <span class="seletor__meta">
            <template v-if="magia.grupo !== classeAtual">{{ magia.grupo }} · </template>
            Nv. {{ magia.nivel }} · {{ textoUsos(magia) }}
          </span>
        </div>
        <button
          type="button"
          class="botao botao--pequeno botao--perigo"
          :aria-label="`Remover ${magia.nome}`"
          @click="remover(magia.id)"
        >
          ×
        </button>
      </li>
    </ul>

    <div v-if="grupos.length" class="seletor__adicionar">
      <label class="visualmente-oculto" for="seletor-magia">Magia do grimório</label>
      <select id="seletor-magia" v-model="escolhida" class="campo">
        <option value="">
          {{ classeAtual ? `Adicionar magia de ${classeAtual}…` : 'Adicionar magia do grimório…' }}
        </option>
        <optgroup v-for="grupo in grupos" :key="grupo.rotulo" :label="grupo.rotulo">
          <option v-for="magia in grupo.magias" :key="magia.id" :value="magia.id">
            <template v-if="grupo.mostrarNivel">Nv. {{ magia.nivel }} · </template>{{ magia.nome }} —
            {{ magia.efeito }}
          </option>
        </optgroup>
      </select>
      <button type="button" class="botao botao--pequeno" :disabled="!escolhida" @click="adicionar">
        Adicionar
      </button>
    </div>
    <p v-if="!classeAtual" class="aviso seletor__dica">
      Dica: preencha a Classe com uma das classes do grimório ({{ classes.join(', ') }}) e a
      Afiliação para ver só as habilidades delas.
    </p>
  </div>
</template>

<style scoped>
.seletor {
  margin-bottom: 0.75rem;
}

.seletor__lista {
  list-style: none;
  margin: 0 0 0.5rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.seletor__item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--linha);
  border-radius: 8px;
  background: var(--pergaminho);
}

.seletor__texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.seletor__efeito {
  font-size: 0.9rem;
}

.seletor__meta {
  font-size: 0.78rem;
  color: var(--tinta-suave);
}

.seletor__adicionar {
  display: flex;
  gap: 0.5rem;
}

.seletor__adicionar select {
  flex: 1;
  min-width: 0;
  padding: 0.25em 0.5em;
  font-size: 0.9rem;
}

.seletor__dica {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
}
</style>
