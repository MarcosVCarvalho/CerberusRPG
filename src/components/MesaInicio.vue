<script setup>
import { ref } from 'vue'
import { firebaseConfigurado } from '../services/firebase.js'
import { criarMesa, extrairIdMesa, obterMesa } from '../services/mesaOnline.js'
import { esquecerMesa, mesasRecentes } from '../services/preferencias.js'

defineProps({
  aviso: { type: String, default: '' },
})

const emit = defineEmits(['entrar'])

const nomeNova = ref('')
const convite = ref('')
const erro = ref('')
const ocupado = ref(false)
const recentes = ref(mesasRecentes())

async function criar() {
  if (!nomeNova.value.trim()) return
  erro.value = ''
  ocupado.value = true
  try {
    emit('entrar', await criarMesa(nomeNova.value))
  } catch (e) {
    console.error(e)
    erro.value = 'Não foi possível criar a mesa. Verifique a conexão e as regras do Firestore.'
  } finally {
    ocupado.value = false
  }
}

async function entrar() {
  erro.value = ''
  const id = extrairIdMesa(convite.value)
  if (!id) {
    erro.value = 'Link ou código inválido. Cole o link de convite completo que recebeu.'
    return
  }
  ocupado.value = true
  try {
    if (await obterMesa(id)) emit('entrar', id)
    else erro.value = 'Mesa não encontrada. Confira o link.'
  } catch (e) {
    console.error(e)
    erro.value = 'Não foi possível acessar a mesa. Verifique a conexão.'
  } finally {
    ocupado.value = false
  }
}

function esquecer(id) {
  esquecerMesa(id)
  recentes.value = mesasRecentes()
}
</script>

<template>
  <div v-if="!firebaseConfigurado" class="painel inicio">
    <h2>Mesa online ainda não configurada</h2>
    <p>
      Para as fichas ficarem compartilhadas em tempo real, o site precisa de um projeto gratuito no
      Firebase. Siga os passos da seção <strong>“Configurar a mesa online”</strong> do README e
      preencha o arquivo <code>src/firebase.config.js</code>.
    </p>
  </div>

  <div v-else class="inicio">
    <p v-if="aviso" class="mensagem mensagem--erro" role="status">{{ aviso }}</p>
    <p v-if="erro" class="mensagem mensagem--erro" role="alert">{{ erro }}</p>

    <div class="inicio__opcoes">
      <form class="painel" @submit.prevent="criar">
        <h2>Criar uma mesa</h2>
        <p class="aviso">Para o mestre: cria a mesa da campanha e gera o link para os jogadores.</p>
        <label for="nome-mesa">Nome da campanha</label>
        <input
          id="nome-mesa"
          v-model="nomeNova"
          class="campo"
          maxlength="80"
          placeholder="Ex.: A Maldição de Cerberus"
          required
        />
        <button type="submit" class="botao botao--primario" :disabled="ocupado">Criar mesa</button>
      </form>

      <form class="painel" @submit.prevent="entrar">
        <h2>Entrar numa mesa</h2>
        <p class="aviso">Para os jogadores: cole o link de convite que o mestre enviou.</p>
        <label for="convite-mesa">Link de convite</label>
        <input
          id="convite-mesa"
          v-model="convite"
          class="campo"
          placeholder="https://…/#/mesa/…"
          required
        />
        <button type="submit" class="botao botao--primario" :disabled="ocupado">Entrar</button>
      </form>
    </div>

    <section v-if="recentes.length" class="painel recentes">
      <h2>Mesas recentes</h2>
      <ul>
        <li v-for="mesa in recentes" :key="mesa.id">
          <button type="button" class="botao" @click="emit('entrar', mesa.id)">
            {{ mesa.nome || 'Mesa sem nome' }}
          </button>
          <button
            type="button"
            class="botao botao--pequeno"
            :aria-label="`Esquecer ${mesa.nome || 'mesa'} neste navegador`"
            title="Esquecer neste navegador"
            @click="esquecer(mesa.id)"
          >
            ×
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.inicio {
  max-width: 860px;
  margin: 0 auto;
}

.inicio h2 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.inicio__opcoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 1rem;
}

.inicio__opcoes form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.inicio__opcoes label {
  font-weight: bold;
  font-size: 0.9rem;
}

.inicio__opcoes .botao {
  align-self: flex-start;
  margin-top: 0.25rem;
}

.recentes {
  margin-top: 1rem;
}

.recentes ul {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.recentes li {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

code {
  background: var(--caixa);
  padding: 0.05em 0.35em;
  border-radius: 4px;
}
</style>
