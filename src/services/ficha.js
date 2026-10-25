// Modelo da ficha de personagem: campos, criação, normalização e comparação campo a campo.

const VERSAO = 2

export const ATRIBUTOS = [
  { chave: 'ataque', rotulo: 'Ataque' },
  { chave: 'defesa', rotulo: 'Defesa' },
  { chave: 'agilidade', rotulo: 'Agilidade' },
  { chave: 'furtividade', rotulo: 'Furtividade' },
  { chave: 'inteligencia', rotulo: 'Inteligência' },
  { chave: 'misticismo', rotulo: 'Misticismo' },
  { chave: 'precisao', rotulo: 'Precisão' },
  { chave: 'percepcao', rotulo: 'Percepção' },
  { chave: 'carisma', rotulo: 'Carisma' },
  { chave: 'enganacao', rotulo: 'Enganação' },
  { chave: 'sorte', rotulo: 'Sorte' },
]

export const CAMPOS_TEXTO = [
  'jogador', 'nome', 'raca', 'classe', 'afiliacao', 'nivel', 'dinheiro', 'idade', 'genero', 'pvAtual',
  'magiasHabilidades', 'personalidade', 'tracosPositivos', 'tracosNegativos', 'equipamentos',
]

export function novoId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function criarFicha() {
  const agora = new Date().toISOString()
  return {
    id: novoId(),
    versao: VERSAO,
    criadoEm: agora,
    atualizadoEm: agora,
    ...Object.fromEntries(CAMPOS_TEXTO.map((c) => [c, ''])),
    atributos: Object.fromEntries(ATRIBUTOS.map((a) => [a.chave, ''])),
    magiasIds: [],
  }
}

function comoTexto(valor) {
  if (valor === null || valor === undefined) return ''
  return typeof valor === 'string' ? valor : String(valor)
}

// Mescla um objeto qualquer (do banco ou importado) com a ficha padrão,
// descartando campos desconhecidos e corrigindo tipos.
export function normalizarFicha(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new Error('Ficha inválida: o conteúdo não é um objeto.')
  }
  const base = criarFicha()
  const ficha = {
    ...base,
    id: typeof dados.id === 'string' && dados.id ? dados.id : base.id,
    criadoEm: typeof dados.criadoEm === 'string' ? dados.criadoEm : base.criadoEm,
    atualizadoEm: typeof dados.atualizadoEm === 'string' ? dados.atualizadoEm : base.atualizadoEm,
  }
  for (const campo of CAMPOS_TEXTO) ficha[campo] = comoTexto(dados[campo])
  const atributos = dados.atributos && typeof dados.atributos === 'object' ? dados.atributos : {}
  for (const { chave } of ATRIBUTOS) ficha.atributos[chave] = comoTexto(atributos[chave])
  // Versão 1 marcava os PV no atributo "vida"; ele passa para o PV atual.
  if (dados.pvAtual === undefined) ficha.pvAtual = comoTexto(atributos.vida)
  ficha.magiasIds = Array.isArray(dados.magiasIds)
    ? [...new Set(dados.magiasIds.filter((id) => typeof id === 'string'))]
    : []
  return ficha
}

// Representação "plana" dos campos editáveis: { nome, 'atributos.ataque', magiasIds, ... }.
// As chaves são os caminhos usados nas atualizações parciais do banco.
export function planificar(ficha) {
  const plano = {}
  for (const campo of CAMPOS_TEXTO) plano[campo] = ficha[campo]
  for (const { chave } of ATRIBUTOS) plano[`atributos.${chave}`] = ficha.atributos[chave]
  plano.magiasIds = [...ficha.magiasIds]
  return plano
}

function iguais(a, b) {
  return Array.isArray(a) ? JSON.stringify(a) === JSON.stringify(b) : a === b
}

// Campos de "atual" que diferem de "base" (ambos planificados).
export function diferencas(atual, base) {
  const patch = {}
  for (const [chave, valor] of Object.entries(atual)) {
    if (!iguais(valor, base[chave])) patch[chave] = valor
  }
  return patch
}

// Escreve um campo planificado de volta na ficha.
export function aplicarCampo(ficha, chave, valor) {
  if (chave.startsWith('atributos.')) ficha.atributos[chave.slice('atributos.'.length)] = valor
  else if (chave === 'magiasIds') ficha.magiasIds = [...valor]
  else ficha[chave] = valor
}
