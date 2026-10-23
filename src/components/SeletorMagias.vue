<script setup>
import { computed, ref } from 'vue'
import { magias, obterMagia } from '../data/magias.js'

// Lista de ids de magias do catálogo associadas à ficha.
const ids = defineModel({ type: Array, required: true })

const escolhida = ref('')

// Ids que não existem mais no catálogo são ignorados na exibição.
const associadas = computed(() => ids.value.map(obterMagia).filter(Boolean))
const disponiveis = computed(() => magias.filter((m) => !ids.value.includes(m.id)))

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
        <details>
          <summary>
            <strong>{{ magia.nome }}</strong>
            <span class="seletor__meta">{{ magia.elemento }} · Nv. {{ magia.nivel }}</span>
          </summary>
          <p>{{ magia.descricao }}</p>
          <p class="seletor__meta">
            Custo: {{ magia.custo }} · Alcance: {{ magia.alcance }} · Duração: {{ magia.duracao }}
          </p>
        </details>
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

    <div v-if="disponiveis.length" class="seletor__adicionar">
      <label class="visualmente-oculto" for="seletor-magia">Magia do grimório</label>
      <select id="seletor-magia" v-model="escolhida" class="campo">
        <option value="">Adicionar magia do grimório…</option>
        <option v-for="magia in disponiveis" :key="magia.id" :value="magia.id">
          {{ magia.nome }} ({{ magia.elemento }}, nv. {{ magia.nivel }})
        </option>
      </select>
      <button type="button" class="botao botao--pequeno" :disabled="!escolhida" @click="adicionar">
        Adicionar
      </button>
    </div>
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

.seletor__item details {
  flex: 1;
  min-width: 0;
}

.seletor__item summary {
  cursor: pointer;
}

.seletor__item p {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
}

.seletor__meta {
  font-size: 0.8rem;
  color: var(--tinta-suave);
  margin-left: 0.4em;
}

p.seletor__meta {
  margin-left: 0;
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
</style>
