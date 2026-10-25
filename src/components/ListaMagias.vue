<script setup>
import { textoUsos } from '../data/magias.js'

defineProps({
  // [{ nivel, magias: [...] }]
  grupos: { type: Array, required: true },
  // Mostra a classe ou afiliação de cada magia (quando a lista mistura grupos).
  mostrarGrupo: { type: Boolean, default: false },
  // ids das magias que a ficha alvo já possui; null quando não há ficha alvo
  idsNaFicha: { type: Array, default: null },
})

const emit = defineEmits(['adicionar'])
</script>

<template>
  <div class="niveis">
    <section v-for="grupo in grupos" :key="grupo.nivel" class="nivel">
      <h3 class="nivel__titulo">Nível {{ grupo.nivel }}</h3>
      <ul class="magias">
        <li v-for="magia in grupo.magias" :key="magia.id" class="magia">
          <div class="magia__principal">
            <span class="magia__nome">{{ magia.nome }}</span>
            <span v-if="mostrarGrupo" class="etiqueta">{{ magia.grupo }}</span>
          </div>
          <span class="magia__efeito">{{ magia.efeito }}</span>
          <span
            class="magia__usos"
            :title="magia.usosDia === null ? 'Sempre ativa' : `${magia.usosDia} uso(s) por dia`"
          >
            {{ textoUsos(magia) }}
          </span>
          <div v-if="idsNaFicha" class="magia__acao">
            <span v-if="idsNaFicha.includes(magia.id)" class="aviso">✓ Na ficha</span>
            <button
              v-else
              type="button"
              class="botao botao--pequeno"
              :aria-label="`Adicionar ${magia.nome} à ficha`"
              @click="emit('adicionar', magia.id)"
            >
              + Ficha
            </button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.niveis {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 520px), 1fr));
  gap: 1rem;
  align-items: start;
}

.nivel {
  background: var(--caixa);
  border: var(--borda);
  border-radius: var(--raio);
  padding: 0.75rem 1rem 0.5rem;
}

.nivel__titulo {
  font-size: 1.05rem;
  font-variant: small-caps;
  letter-spacing: 0.04em;
  padding-bottom: 0.35rem;
  border-bottom: 2px solid var(--tinta);
}

.magias {
  list-style: none;
  margin: 0;
  padding: 0;
}

.magia {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr) auto auto;
  align-items: center;
  gap: 0.25rem 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--linha);
}

.magia:last-child {
  border-bottom: none;
}

.magia__principal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.magia__nome {
  font-weight: bold;
}

.magia__efeito {
  font-size: 0.92rem;
}

.magia__usos {
  font-size: 0.82rem;
  color: var(--tinta-suave);
  white-space: nowrap;
}

.magia__acao {
  justify-self: end;
  white-space: nowrap;
}

.magia__acao .aviso {
  font-size: 0.8rem;
}

.etiqueta {
  font-size: 0.72rem;
  padding: 0.05em 0.55em;
  border: 1px solid var(--tinta);
  border-radius: 999px;
  background: var(--pergaminho);
}

@media (max-width: 560px) {
  .magia {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .magia__efeito {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .magia__usos {
    grid-column: 1;
    grid-row: 3;
  }

  .magia__acao {
    grid-column: 2;
    grid-row: 1;
  }
}
</style>
