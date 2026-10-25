<script setup>
import { marked } from 'marked'
import texto from '../data/livro-de-regras.md?raw'

// O livro é uma cópia em Markdown do documento "Livro de Regras"; atualize este arquivo quando ele mudar.
// O conteúdo é do próprio projeto, então o HTML gerado é confiável.

// Seções (## ...) para o índice, na mesma ordem em que aparecem no texto.
const secoes = [...texto.matchAll(/^## (.+)$/gm)].map((m, i) => ({ id: `regra-${i}`, titulo: m[1] }))

let indice = 0
const html = marked
  .parse(texto)
  .replace(/<h2>/g, () => `<h2 id="regra-${indice++}">`)
  .replace(/<table>/g, '<div class="tabela"><table>')
  .replace(/<\/table>/g, '</table></div>')

// A navegação usa o hash (#/regras), então o índice rola até a seção em vez de usar âncoras.
function irPara(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="regras">
    <nav class="painel indice" aria-label="Seções do livro">
      <h2 class="indice__titulo">Livro de Regras</h2>
      <ol class="indice__lista">
        <li v-for="secao in secoes" :key="secao.id">
          <button type="button" class="indice__item" @click="irPara(secao.id)">
            {{ secao.titulo }}
          </button>
        </li>
      </ol>
    </nav>

    <article class="painel livro" v-html="html"></article>
  </div>
</template>

<style scoped>
.regras {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.indice {
  position: sticky;
  top: 1rem;
  padding: 0.75rem;
}

.indice__titulo {
  font-size: 1.05rem;
  font-variant: small-caps;
  letter-spacing: 0.04em;
  padding-bottom: 0.35rem;
  margin-bottom: 0.35rem;
  border-bottom: 2px solid var(--tinta);
}

.indice__lista {
  list-style: none;
  margin: 0;
  padding: 0;
}

.indice__item {
  display: block;
  width: 100%;
  padding: 0.3em 0.4em;
  border: none;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: 0.92rem;
}

.indice__item:hover {
  background: var(--caixa);
}

.indice__item:focus-visible {
  outline: 2px solid var(--destaque);
}

.livro {
  padding: 1rem 1.5rem 1.5rem;
  overflow-wrap: anywhere;
}

.livro :deep(h2) {
  font-size: 1.5rem;
  margin: 1.75rem 0 0.75rem;
  padding-bottom: 0.35rem;
  border-bottom: 2px solid var(--tinta);
  scroll-margin-top: 1rem;
}

.livro :deep(h2:first-child) {
  margin-top: 0.25rem;
}

.livro :deep(h3) {
  font-size: 1.15rem;
  font-variant: small-caps;
  letter-spacing: 0.03em;
  margin: 1.25rem 0 0.5rem;
}

.livro :deep(p),
.livro :deep(ul),
.livro :deep(ol) {
  margin: 0 0 0.75rem;
}

.livro :deep(li) {
  margin-bottom: 0.25rem;
}

/* Fórmulas */
.livro :deep(blockquote) {
  margin: 0 0 0.75rem;
  padding: 0.5em 1em;
  border: 2px solid var(--tinta);
  border-radius: 8px;
  background: var(--caixa);
  font-weight: bold;
  text-align: center;
}

.livro :deep(blockquote p) {
  margin: 0;
}

.livro :deep(.tabela) {
  overflow-x: auto;
  margin: 0 0 1rem;
}

.livro :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
  background: var(--caixa);
}

.livro :deep(th),
.livro :deep(td) {
  padding: 0.4em 0.6em;
  border: 1px solid var(--linha);
  text-align: left;
  vertical-align: top;
  overflow-wrap: normal;
}

.livro :deep(th) {
  background: var(--tinta);
  color: var(--pergaminho);
  border-color: var(--tinta);
}

@media (max-width: 860px) {
  .regras {
    grid-template-columns: 1fr;
  }

  .indice {
    position: static;
  }

  .indice__lista {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .indice__item {
    width: auto;
    border: 1px solid var(--linha);
    font-size: 0.85rem;
  }

  .livro {
    padding: 0.85rem;
  }
}
</style>
