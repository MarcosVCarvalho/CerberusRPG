<script setup>
import { ATRIBUTOS } from '../services/personagensStorage.js'
import SeletorMagias from './SeletorMagias.vue'

// A ficha é editada diretamente (v-model no componente pai).
const ficha = defineModel({ type: Object, required: true })

const identidade = [
  { chave: 'jogador', rotulo: 'Jogador' },
  { chave: 'nome', rotulo: 'Personagem' },
  { chave: 'raca', rotulo: 'Raça' },
  { chave: 'classe', rotulo: 'Classe' },
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
              />
            </div>
          </div>
        </section>

        <section class="caixa">
          <h3 class="caixa__titulo">Atributos</h3>
          <div class="atributos">
            <div v-for="atributo in ATRIBUTOS" :key="atributo.chave" class="atributo">
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
          <SeletorMagias v-model="ficha.magiasIds" />
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
.atributo input {
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
.texto-pautado:focus {
  outline: none;
  border-bottom-color: var(--destaque);
}

.atributos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.atributo {
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
