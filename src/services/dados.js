// Rolador de dados. As rolagens ficam só neste navegador (não vão para a mesa online)
// e o histórico dura até a página ser recarregada.

import { ref } from 'vue'

export const FACES = [4, 6, 8, 10, 12, 20, 100]
const LIMITE_HISTORICO = 30

export const historico = ref([]) // mais recente primeiro
export const painelAberto = ref(false)
// Vale para rolagens de um único d20, inclusive as feitas pela ficha.
export const modoD20 = ref('normal') // 'normal' | 'vantagem' | 'desvantagem'

let contador = 0

// Inteiro uniforme de 1 a faces, sem o viés de "aleatório % faces".
function rolarDado(faces) {
  const limite = Math.floor(2 ** 32 / faces) * faces
  const valor = new Uint32Array(1)
  do crypto.getRandomValues(valor)
  while (valor[0] >= limite)
  return (valor[0] % faces) + 1
}

export function expressao(quantidade, faces, modificador) {
  const sinal = modificador > 0 ? `+${modificador}` : modificador < 0 ? `${modificador}` : ''
  return `${quantidade}d${faces}${sinal}`
}

// Rola quantidade × d<faces> + modificador e registra no histórico.
// Vantagem e desvantagem só se aplicam a um único d20 (rola 2 e fica com o maior ou o menor).
export function rolar({ quantidade = 1, faces = 20, modificador = 0, modo = 'normal', rotulo = '' }) {
  const umD20 = faces === 20 && quantidade === 1
  const modoAplicado = umD20 ? modo : 'normal'
  let dados
  let descartado = null
  if (modoAplicado === 'normal') {
    dados = Array.from({ length: quantidade }, () => rolarDado(faces))
  } else {
    const [a, b] = [rolarDado(20), rolarDado(20)]
    const fica = modoAplicado === 'vantagem' ? Math.max(a, b) : Math.min(a, b)
    dados = [fica]
    descartado = fica === a ? b : a
  }
  const rolagem = {
    id: ++contador,
    rotulo,
    expressao: expressao(quantidade, faces, modificador),
    modo: modoAplicado,
    dados,
    descartado,
    modificador,
    total: dados.reduce((soma, d) => soma + d, 0) + modificador,
    natural: umD20 ? dados[0] : null,
  }
  historico.value = [rolagem, ...historico.value].slice(0, LIMITE_HISTORICO)
  return rolagem
}

// Teste de atributo pela ficha: 1d20 + valor do atributo, no modo de d20 escolhido no painel.
export function rolarAtributo(personagem, atributo, valor) {
  painelAberto.value = true
  return rolar({
    modificador: parseInt(valor, 10) || 0,
    modo: modoD20.value,
    rotulo: `${personagem || 'Personagem sem nome'}: ${atributo}`,
  })
}

export function limparHistorico() {
  historico.value = []
}
