<script setup>
import { computed, ref } from 'vue'
import { paraBusca } from '../utils/texto.js'

const props = defineProps({
  fichas: { type: Array, required: true },
  selecionadaId: { type: String, default: null },
})

const emit = defineEmits(['abrir', 'nova', 'excluir', 'exportar'])

const busca = ref('')

const filtradas = computed(() => {
  const termo = paraBusca(busca.value)
  const ordenadas = [...props.fichas].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR'),
  )
  if (!termo) return ordenadas
  return ordenadas.filter(
    (f) => paraBusca(f.nome).includes(termo) || paraBusca(f.jogador).includes(termo),
  )
})
</script>

<template>
  <nav class="lista painel" aria-label="Personagens">
    <div class="lista__topo">
      <h2 class="lista__titulo">Personagens</h2>
      <button type="button" class="botao botao--primario botao--pequeno" @click="emit('nova')">
        + Nova ficha
      </button>
    </div>

    <template v-if="fichas.length">
      <label class="visualmente-oculto" for="busca-personagens">Buscar personagem</label>
      <input
        id="busca-personagens"
        v-model="busca"
        class="campo lista__busca"
        type="search"
        placeholder="Buscar por personagem ou jogador…"
      />

      <ul class="lista__itens">
        <li
          v-for="ficha in filtradas"
          :key="ficha.id"
          class="lista__item"
          :class="{ 'lista__item--ativo': ficha.id === selecionadaId }"
        >
          <button
            type="button"
            class="lista__abrir"
            :aria-current="ficha.id === selecionadaId ? 'true' : undefined"
            @click="emit('abrir', ficha.id)"
          >
            <span class="lista__nome">{{ ficha.nome || 'Personagem sem nome' }}</span>
            <span class="lista__detalhe">
              {{ [ficha.raca, ficha.classe].filter(Boolean).join(' · ') || '—' }}
              <template v-if="ficha.jogador"> · {{ ficha.jogador }}</template>
            </span>
          </button>
          <div class="lista__acoes">
            <button
              type="button"
              class="botao botao--pequeno"
              :aria-label="`Exportar ${ficha.nome || 'ficha'}`"
              title="Exportar JSON"
              @click="emit('exportar', ficha)"
            >
              ⤓
            </button>
            <button
              type="button"
              class="botao botao--pequeno botao--perigo"
              :aria-label="`Excluir ${ficha.nome || 'ficha'}`"
              title="Excluir"
              @click="emit('excluir', ficha)"
            >
              ×
            </button>
          </div>
        </li>
      </ul>
      <p v-if="!filtradas.length" class="aviso">Nenhum personagem encontrado.</p>
    </template>

    <p v-else class="aviso">Nenhuma ficha ainda — crie a primeira.</p>
  </nav>
</template>

<style scoped>
.lista__topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.lista__titulo {
  font-size: 1.2rem;
}

.lista__busca {
  margin-bottom: 0.75rem;
}

.lista__itens {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lista__item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border: 2px solid var(--tinta);
  border-radius: 10px;
  background: var(--caixa);
  padding: 0.25rem 0.35rem 0.25rem 0;
}

.lista__item--ativo {
  background: var(--tinta);
  color: var(--pergaminho);
}

.lista__abrir {
  flex: 1;
  min-width: 0;
  text-align: left;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  display: flex;
  flex-direction: column;
}

.lista__nome {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lista__detalhe {
  font-size: 0.8rem;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lista__acoes {
  display: flex;
  gap: 0.25rem;
}

/* Mantém os ícones legíveis também no item selecionado (fundo escuro). */
.lista__acoes .botao:not(.botao--perigo) {
  color: var(--tinta);
}
</style>
