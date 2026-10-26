// Regras do Livro de Regras usadas pela ficha: raças, ganho de PV por classe e PV máximo.

import { paraBusca } from '../utils/texto.js'

const ORC = {
  pv: 60,
  tamanho: 'Médio',
  movimento: 6,
  traco: { nome: 'Teimosia Brutal', efeito: 'Uma vez por Descanso Longo, ao chegar a 0 PV, fica com 1 PV.' },
}

const PEQUENO = {
  pv: 25,
  tamanho: 'Pequeno',
  movimento: 5,
  traco: {
    nome: 'Escapadiço',
    efeito: 'Pode atravessar o quadrado de criaturas Médias ou maiores, inclusive inimigos.',
  },
}

export const RACAS = [
  { nome: 'Orc', ...ORC },
  { nome: 'Meio-Orc', ...ORC },
  {
    nome: 'Anão',
    pv: 50,
    tamanho: 'Médio',
    movimento: 5,
    traco: { nome: 'Forjado em Pedra', efeito: 'Ignora a penalidade de movimento da Armadura Pesada.' },
  },
  {
    nome: 'Humano',
    pv: 40,
    tamanho: 'Médio',
    movimento: 6,
    traco: { nome: 'Versátil', efeito: '+1 ponto de atributo na criação.' },
  },
  {
    nome: 'Tiefling',
    pv: 40,
    tamanho: 'Médio',
    movimento: 6,
    traco: { nome: 'Sangue Infernal', efeito: 'Sofre metade do dano de fogo.' },
  },
  {
    nome: 'Aasimar',
    pv: 40,
    tamanho: 'Médio',
    movimento: 6,
    traco: { nome: 'Centelha Celestial', efeito: 'Sofre metade do dano sombrio.' },
  },
  {
    nome: 'Draconato',
    pv: 40,
    tamanho: 'Médio',
    movimento: 6,
    traco: {
      nome: 'Sopro de Dragão',
      efeito: 'Uma vez por Descanso Longo, 2d6 de dano de fogo numa linha de 4 Quadrados.',
    },
  },
  {
    nome: 'Dhampir',
    pv: 35,
    tamanho: 'Médio',
    movimento: 7,
    traco: {
      nome: 'Sede de Sangue',
      efeito: 'Uma vez por Descanso Longo, ao acertar um ataque corpo a corpo, recupera PV igual ao dano causado.',
    },
  },
  {
    nome: 'Elfo',
    pv: 30,
    tamanho: 'Médio',
    movimento: 7,
    traco: { nome: 'Olhos da Floresta', efeito: 'Ignora a desvantagem de Percepção na penumbra.' },
  },
  { nome: 'Halfling', ...PEQUENO },
  { nome: 'Gnomo', ...PEQUENO },
]

export const nomesDasRacas = RACAS.map((r) => r.nome)

// Linha de Frente +15, Híbridos +10, Conjuradores Puros +5. As chaves são os nomes do catálogo.
const GANHO_PV_POR_NIVEL = {
  Guerreiro: 15,
  Paladino: 15,
  Bárbaro: 15,
  Clérigo: 10,
  Druida: 10,
  Bardo: 10,
  Ladino: 10,
  Patrulheiro: 10,
  Mago: 5,
  Necromante: 5,
}

const NIVEL_MAXIMO = 10

// Encontra a raça correspondente ao texto da ficha (sem diferenciar acentos e maiúsculas).
export function racaDaFicha(texto) {
  const alvo = paraBusca(texto)
  return RACAS.find((r) => paraBusca(r.nome) === alvo) ?? null
}

// PV da raça + ganho da classe × (nível − 1). Retorna null se a raça ou a classe não forem reconhecidas.
// Nível vazio ou inválido conta como 1.
export function pvMaximo(raca, classe, nivel) {
  const dadosRaca = racaDaFicha(raca)
  const ganho = GANHO_PV_POR_NIVEL[classe]
  if (!dadosRaca || ganho === undefined) return null
  const n = Math.min(Math.max(parseInt(nivel, 10) || 1, 1), NIVEL_MAXIMO)
  return dadosRaca.pv + ganho * (n - 1)
}
