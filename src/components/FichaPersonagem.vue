<script setup>
import { computed } from 'vue'
import { ATRIBUTOS } from '../services/ficha.js'
import {
  afiliacaoDoCatalogo,
  afiliacoes,
  classeDoCatalogo,
  classes,
  dadosDaAfiliacao,
} from '../data/magias.js'
import { nomesDasRacas, pvMaximo, racaDaFicha } from '../data/regras.js'
import { rolarAtributo } from '../services/dados.js'
import SeletorMagias from './SeletorMagias.vue'

// A ficha é editada diretamente (v-model no componente pai).
const ficha = defineModel({ type: Object, required: true })

const identidade = [
  { chave: 'jogador', rotulo: 'Jogador' },
  { chave: 'nome', rotulo: 'Personagem' },
  { chave: 'raca', rotulo: 'Raça' },
  { chave: 'classe', rotulo: 'Classe' },
  { chave: 'afiliacao', rotulo: 'Afiliação' },
  { chave: 'nivel', rotulo: 'Nível', curto: true },
  { chave: 'dinheiro', rotulo: 'Dinheiro', curto: true },
  { chave: 'idade', rotulo: 'Idade', curto: true },
  { chave: 'genero', rotulo: 'Gênero', curto: true },
]

const textos = [
  { chave: 'personalidade', rotulo: 'Traço de personalidade', linhas: 3 },
  { chave: 'tracosPositivos', rotulo: 'Traços positivos', linhas: 3 },
  { chave: 'tracosNegativos', rotulo: 'Traços negativos', linhas: 3 },
  { chave: 'equipamentos', rotulo: 'Equipamentos', linhas: 6 },
]

// Sugestões (datalist) dos campos de texto livre.
const sugestoes = { raca: nomesDasRacas, classe: classes, afiliacao: afiliacoes }

const raca = computed(() => racaDaFicha(ficha.value.raca))
const afiliacao = computed(() => {
  const nome = afiliacaoDoCatalogo(ficha.value.afiliacao)
  return nome ? { nome, ...dadosDaAfiliacao(nome) } : null
})
const pvMax = computed(() =>
  pvMaximo(ficha.value.raca, classeDoCatalogo(ficha.value.classe), ficha.value.nivel),
)

const idCampo = (chave) => `ficha-${ficha.value.id}-${chave}`
</script>

<template>
  <article class="ficha">
    <header class="ficha__topo">
      <p class="ficha__sobretitulo">Ficha de personagem</p>
      <h2 class="ficha__titulo">{{ ficha.nome || 'Personagem sem nome' }}</h2>
    </header>

    <div class="ficha__colunas">
      <div class="ficha__coluna">
        <section class="caixa">
          <h3 class="caixa__titulo">Identidade</h3>
          <div class="identidade">
            <div
              v-for="campo in identidade"
              :key="campo.chave"
              class="linha-campo"
              :class="{ 'linha-campo--curto': campo.curto }"
            >
              <label :for="idCampo(campo.chave)">{{ campo.rotulo }}</label>
              <input
                :id="idCampo(campo.chave)"
                v-model="ficha[campo.chave]"
                type="text"
                autocomplete="off"
                :list="sugestoes[campo.chave] ? idCampo(`${campo.chave}-opcoes`) : undefined"
              />
            </div>
          </div>
          <datalist v-for="(opcoes, chave) in sugestoes" :id="idCampo(`${chave}-opcoes`)" :key="chave">
            <option v-for="opcao in opcoes" :key="opcao" :value="opcao" />
          </datalist>
        </section>

        <section class="caixa">
          <h3 class="caixa__titulo">Vida e origem</h3>
          <div class="vida">
            <label :for="idCampo('pvAtual')">PV</label>
            <input
              :id="idCampo('pvAtual')"
              v-model="ficha.pvAtual"
              type="text"
              inputmode="numeric"
              autocomplete="off"
            />
            <span class="vida__maximo">/ {{ pvMax ?? '—' }}</span>
          </div>
          <p v-if="pvMax === null" class="aviso origem__dica">
            Preencha Raça, Classe e Nível para calcular o PV máximo.
          </p>
          <dl v-if="raca || afiliacao" class="origem">
            <template v-if="raca">
              <dt>{{ raca.nome }}</dt>
              <dd>{{ raca.tamanho }} · {{ raca.movimento }} Quadrados de movimento</dd>
              <dt>{{ raca.traco.nome }}</dt>
              <dd>{{ raca.traco.efeito }}</dd>
            </template>
            <template v-if="afiliacao">
              <dt>{{ afiliacao.nome }}</dt>
              <dd>{{ afiliacao.tema }} · atributo {{ afiliacao.atributo }}</dd>
            </template>
          </dl>
        </section>

        <section class="caixa">
          <h3 class="caixa__titulo">Atributos</h3>
          <div class="atributos">
            <div v-for="atributo in ATRIBUTOS" :key="atributo.chave" class="atributo">
              <button
                type="button"
                class="atributo__rolar"
                :aria-label="`Rolar 1d20 + ${atributo.rotulo}`"
                :title="`Rolar 1d20 + ${atributo.rotulo}`"
                @click="rolarAtributo(ficha.nome, atributo.rotulo, ficha.atributos[atributo.chave])"
              >
                🎲
              </button>
              <label :for="idCampo(atributo.chave)">{{ atributo.rotulo }}</label>
              <input
                :id="idCampo(atributo.chave)"
                v-model="ficha.atributos[atributo.chave]"
                type="text"
                inputmode="numeric"
                autocomplete="off"
              />
            </div>
          </div>
        </section>
      </div>

      <div class="ficha__coluna">
        <section class="caixa">
          <h3 class="caixa__titulo">
            <label :for="idCampo('magiasHabilidades')">Magias e habilidades</label>
          </h3>
          <SeletorMagias
            v-model="ficha.magiasIds"
            :classe="ficha.classe"
            :afiliacao="ficha.afiliacao"
          />
          <textarea
            :id="idCampo('magiasHabilidades')"
            v-model="ficha.magiasHabilidades"
            class="texto-pautado"
            rows="4"
            placeholder="Habilidades e anotações livres…"
          ></textarea>
        </section>

        <section v-for="campo in textos" :key="campo.chave" class="caixa">
          <h3 class="caixa__titulo">
            <label :for="idCampo(campo.chave)">{{ campo.rotulo }}</label>
          </h3>
          <textarea
            :id="idCampo(campo.chave)"
            v-model="ficha[campo.chave]"
            class="texto-pautado"
            :rows="campo.linhas"
          ></textarea>
        </section>
      </div>
    </div>
  </article>
</template>

<style scoped>
.ficha {
  background: var(--pergaminho);
  border: 4px solid var(--tinta);
  border-radius: 18px;
  padding: 1.25rem;
}

.ficha__topo {
  text-align: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--tinta);
}

.ficha__sobretitulo {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--tinta-suave);
}

.ficha__titulo {
  font-size: 1.6rem;
  overflow-wrap: anywhere;
}

.ficha__colunas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.ficha__coluna {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.caixa {
  background: var(--caixa);
  border: var(--borda);
  border-radius: var(--raio);
  padding: 0.75rem 1rem 1rem;
}

.caixa__titulo {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  font-variant: small-caps;
  letter-spacing: 0.04em;
}

.identidade {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 1rem;
}

.linha-campo {
  grid-column: 1 / -1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.linha-campo--curto {
  grid-column: auto;
}

.linha-campo label {
  font-weight: bold;
  white-space: nowrap;
}

.linha-campo input,
.atributo input,
.vida input {
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  border-bottom: 2px dashed var(--linha);
  background: transparent;
  padding: 0.15em 0.1em;
}

.linha-campo input:focus,
.atributo input:focus,
.vida input:focus,
.texto-pautado:focus {
  outline: none;
  border-bottom-color: var(--destaque);
}

.vida {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 1.3rem;
}

.vida label {
  font-weight: bold;
}

.vida input {
  flex: 0 1 5ch;
  text-align: center;
}

.vida__maximo {
  font-weight: bold;
}

.origem__dica {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
}

.origem {
  margin: 0.6rem 0 0;
}

.origem dt {
  font-weight: bold;
}

.origem dd {
  margin: 0 0 0.35rem;
  font-size: 0.92rem;
}

.atributos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.atributo {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid var(--tinta);
  border-radius: 10px;
  padding: 0.35rem 0.4rem 0.5rem;
  background: var(--caixa);
}

.atributo label {
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  /* Não passa por baixo do botão de rolar. */
  padding: 0 1.1rem;
}

.atributo__rolar {
  position: absolute;
  top: 0.15rem;
  right: 0.15rem;
  padding: 0 0.15rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1.2;
}

.atributo__rolar:hover {
  background: var(--pergaminho);
}

.atributo__rolar:focus-visible {
  outline: 2px solid var(--destaque);
}

.atributo input {
  width: 100%;
  text-align: center;
  font-size: 1.3rem;
}

.texto-pautado {
  display: block;
  width: 100%;
  border: none;
  border-bottom: 2px dashed var(--linha);
  resize: vertical;
  line-height: 1.75em;
  padding: 0 0.1em;
  background-color: transparent;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(1.75em - 1px),
    var(--linha) calc(1.75em - 1px),
    var(--linha) 1.75em
  );
  background-attachment: local;
}

@media (max-width: 720px) {
  .ficha {
    padding: 0.85rem;
    border-radius: 14px;
  }

  .ficha__colunas {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 380px) {
  .identidade {
    grid-template-columns: 1fr;
  }

  .atributos {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
