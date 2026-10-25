<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  FACES,
  expressao,
  historico,
  limparHistorico,
  modoD20,
  painelAberto,
  rolar,
} from '../services/dados.js'

const MODOS = [
  { valor: 'normal', rotulo: 'Normal' },
  { valor: 'vantagem', rotulo: 'Vantagem' },
  { valor: 'desvantagem', rotulo: 'Desvantagem' },
]

const quantidade = ref(1)
const faces = ref(20)
const modificador = ref(0)

const inteiro = (valor, min, max) => Math.min(Math.max(Math.trunc(Number(valor)) || 0, min), max)
const qtd = computed(() => inteiro(quantidade.value, 1, 20))
const mod = computed(() => inteiro(modificador.value, -99, 99))
const umD20 = computed(() => faces.value === 20 && qtd.value === 1)
const ultima = computed(() => historico.value[0] ?? null)

function rolarAgora() {
  rolar({ quantidade: qtd.value, faces: faces.value, modificador: mod.value, modo: modoD20.value })
}

function detalhe(r) {
  const dados = r.dados.length > 1 ? `[${r.dados.join(', ')}]` : `${r.dados[0]}`
  const extra = r.modificador > 0 ? ` + ${r.modificador}` : r.modificador < 0 ? ` − ${-r.modificador}` : ''
  return `${dados}${extra}`
}

function aoTeclar(evento) {
  if (evento.key === 'Escape' && painelAberto.value) painelAberto.value = false
}

onMounted(() => window.addEventListener('keydown', aoTeclar))
onBeforeUnmount(() => window.removeEventListener('keydown', aoTeclar))
</script>

<template>
  <div class="rolador">
    <section v-if="painelAberto" class="painel rolador__painel" aria-label="Rolador de dados">
      <header class="rolador__topo">
        <h2 class="rolador__titulo">Dados</h2>
        <button
          type="button"
          class="botao botao--pequeno"
          aria-label="Fechar rolador de dados"
          @click="painelAberto = false"
        >
          ×
        </button>
      </header>

      <div class="faces" role="group" aria-label="Tipo de dado">
        <button
          v-for="f in FACES"
          :key="f"
          type="button"
          class="face"
          :aria-pressed="faces === f"
          @click="faces = f"
        >
          d{{ f }}
        </button>
      </div>

      <div class="numeros">
        <label>
          Quantidade
          <input v-model="quantidade" class="campo" type="number" min="1" max="20" />
        </label>
        <label>
          Modificador
          <input v-model="modificador" class="campo" type="number" min="-99" max="99" />
        </label>
      </div>

      <fieldset class="modos" :disabled="!umD20">
        <legend>Um único d20</legend>
        <label v-for="m in MODOS" :key="m.valor" class="modo">
          <input v-model="modoD20" type="radio" name="modo-d20" :value="m.valor" />
          {{ m.rotulo }}
        </label>
      </fieldset>

      <button type="button" class="botao botao--primario rolador__rolar" @click="rolarAgora">
        Rolar {{ expressao(qtd, faces, mod) }}
      </button>

      <div v-if="ultima" class="resultado" aria-live="polite">
        <p v-if="ultima.rotulo" class="resultado__rotulo">{{ ultima.rotulo }}</p>
        <p class="resultado__total">{{ ultima.total }}</p>
        <p class="resultado__detalhe">
          {{ ultima.expressao }}: {{ detalhe(ultima) }}
          <template v-if="ultima.descartado !== null">
            ({{ ultima.modo }}; descartou <s>{{ ultima.descartado }}</s>)
          </template>
        </p>
        <p v-if="ultima.natural === 20" class="natural natural--20">20 natural!</p>
        <p v-else-if="ultima.natural === 1" class="natural natural--1">1 natural…</p>
      </div>

      <div v-if="historico.length > 1" class="historico">
        <div class="historico__topo">
          <h3 class="historico__titulo">Anteriores</h3>
          <button type="button" class="botao botao--pequeno" @click="limparHistorico">Limpar</button>
        </div>
        <ol class="historico__lista">
          <li v-for="r in historico.slice(1)" :key="r.id">
            <span class="historico__texto">
              <template v-if="r.rotulo">{{ r.rotulo }} · </template>{{ r.expressao }}
              <template v-if="r.modo !== 'normal'"> ({{ r.modo }})</template>
            </span>
            <strong>{{ r.total }}</strong>
          </li>
        </ol>
      </div>
    </section>

    <button
      type="button"
      class="botao botao--primario rolador__abrir"
      :aria-expanded="painelAberto"
      @click="painelAberto = !painelAberto"
    >
      🎲 Dados
    </button>
  </div>
</template>

<style scoped>
.rolador {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.rolador__abrir {
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
  font-size: 1rem;
}

.rolador__painel {
  width: min(340px, calc(100vw - 2rem));
  max-height: calc(100vh - 5rem);
  overflow-y: auto;
  padding: 0.85rem;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.rolador__topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rolador__titulo {
  font-size: 1.15rem;
  font-variant: small-caps;
  letter-spacing: 0.04em;
}

.faces {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
}

.face {
  padding: 0.35em 0;
  border: 2px solid var(--tinta);
  border-radius: 8px;
  background: var(--caixa);
  cursor: pointer;
  font-weight: bold;
}

.face[aria-pressed='true'] {
  background: var(--tinta);
  color: var(--pergaminho);
}

.face:focus-visible {
  outline: 2px solid var(--destaque);
  outline-offset: 2px;
}

.numeros {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.numeros label {
  font-size: 0.85rem;
  font-weight: bold;
}

.numeros input {
  margin-top: 0.15rem;
  padding: 0.3em 0.5em;
}

.modos {
  margin: 0;
  padding: 0.35rem 0.6rem 0.45rem;
  border: 1px solid var(--linha);
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  font-size: 0.88rem;
}

.modos:disabled {
  opacity: 0.5;
}

.modos legend {
  padding: 0 0.25rem;
  font-size: 0.78rem;
  color: var(--tinta-suave);
}

.modo {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.rolador__rolar {
  justify-content: center;
  font-size: 1.05rem;
}

.resultado {
  text-align: center;
  padding: 0.5rem;
  border: 2px solid var(--tinta);
  border-radius: 10px;
  background: var(--caixa);
}

.resultado p {
  margin: 0;
}

.resultado__rotulo {
  font-weight: bold;
  overflow-wrap: anywhere;
}

.resultado__total {
  font-size: 2.4rem;
  font-weight: bold;
  line-height: 1.1;
}

.resultado__detalhe {
  font-size: 0.88rem;
  color: var(--tinta-suave);
}

.natural {
  font-weight: bold;
}

.natural--20 {
  color: var(--destaque);
}

.natural--1 {
  color: var(--perigo);
}

.historico__topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.historico__titulo {
  font-size: 0.9rem;
}

.historico__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.85rem;
}

.historico__lista li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.2rem 0;
  border-bottom: 1px dashed var(--linha);
}

.historico__texto {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .rolador {
    right: 0.75rem;
    bottom: 0.75rem;
  }
}
</style>
