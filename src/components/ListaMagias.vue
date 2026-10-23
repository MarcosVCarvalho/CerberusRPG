<script setup>
defineProps({
  magias: { type: Array, required: true },
  // ids das magias que a ficha alvo já possui; null quando não há ficha alvo
  idsNaFicha: { type: Array, default: null },
})

const emit = defineEmits(['adicionar'])
</script>

<template>
  <ul class="magias">
    <li v-for="magia in magias" :key="magia.id" class="magia">
      <header class="magia__topo">
        <h3 class="magia__nome">{{ magia.nome }}</h3>
        <span class="magia__nivel">Nível {{ magia.nivel }}</span>
      </header>
      <p class="magia__etiquetas">
        <span class="etiqueta">{{ magia.categoria }}</span>
        <span class="etiqueta">{{ magia.elemento }}</span>
      </p>
      <p class="magia__descricao">{{ magia.descricao }}</p>

      <details class="magia__detalhes">
        <summary>Detalhes</summary>
        <dl>
          <dt>Custo</dt>
          <dd>{{ magia.custo }}</dd>
          <dt>Alcance</dt>
          <dd>{{ magia.alcance }}</dd>
          <dt>Duração</dt>
          <dd>{{ magia.duracao }}</dd>
        </dl>
        <template v-if="magia.efeitos?.length">
          <p class="magia__subtitulo">Efeitos</p>
          <ul class="magia__efeitos">
            <li v-for="(efeito, i) in magia.efeitos" :key="i">{{ efeito }}</li>
          </ul>
        </template>
      </details>

      <div v-if="idsNaFicha" class="magia__acao">
        <span v-if="idsNaFicha.includes(magia.id)" class="aviso">✓ Já está na ficha</span>
        <button
          v-else
          type="button"
          class="botao botao--pequeno"
          @click="emit('adicionar', magia.id)"
        >
          + Adicionar à ficha
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.magias {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 1rem;
}

.magia {
  display: flex;
  flex-direction: column;
  background: var(--caixa);
  border: var(--borda);
  border-radius: var(--raio);
  padding: 0.9rem 1rem;
}

.magia__topo {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.magia__nome {
  font-size: 1.15rem;
}

.magia__nivel {
  font-size: 0.8rem;
  white-space: nowrap;
  color: var(--tinta-suave);
}

.magia__etiquetas {
  display: flex;
  gap: 0.35rem;
  margin: 0.4rem 0;
}

.etiqueta {
  font-size: 0.75rem;
  padding: 0.05em 0.6em;
  border: 1px solid var(--tinta);
  border-radius: 999px;
  background: var(--pergaminho);
}

.magia__descricao {
  margin: 0 0 0.5rem;
  flex: 1;
}

.magia__detalhes summary {
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
}

.magia__detalhes dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.15rem 0.75rem;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.magia__detalhes dt {
  font-weight: bold;
}

.magia__detalhes dd {
  margin: 0;
}

.magia__subtitulo {
  margin: 0.25rem 0 0;
  font-weight: bold;
  font-size: 0.9rem;
}

.magia__efeitos {
  margin: 0.25rem 0 0;
  padding-left: 1.2rem;
  font-size: 0.9rem;
}

.magia__acao {
  margin-top: 0.75rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--linha);
}
</style>
