// Acesso às fichas salvas no LocalStorage do navegador.
// Cada navegador/dispositivo tem o seu próprio armazenamento: use exportar/importar JSON para backup.

const CHAVE = 'grimorio-rpg:personagens'
const VERSAO = 1

export const ATRIBUTOS = [
  { chave: 'vida', rotulo: 'Vida' },
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

const CAMPOS_TEXTO = [
  'jogador', 'nome', 'raca', 'classe', 'nivel', 'dinheiro', 'idade', 'genero',
  'magiasHabilidades', 'personalidade', 'tracosPositivos', 'tracosNegativos', 'equipamentos',
]

function novoId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function fichaPadrao() {
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

// Mescla um objeto qualquer (salvo ou importado) com a ficha padrão,
// descartando campos desconhecidos e corrigindo tipos.
export function normalizarFicha(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new Error('Ficha inválida: o conteúdo não é um objeto.')
  }
  const base = fichaPadrao()
  const ficha = {
    ...base,
    id: typeof dados.id === 'string' && dados.id ? dados.id : base.id,
    criadoEm: typeof dados.criadoEm === 'string' ? dados.criadoEm : base.criadoEm,
    atualizadoEm: typeof dados.atualizadoEm === 'string' ? dados.atualizadoEm : base.atualizadoEm,
  }
  for (const campo of CAMPOS_TEXTO) ficha[campo] = comoTexto(dados[campo])
  const atributos = dados.atributos && typeof dados.atributos === 'object' ? dados.atributos : {}
  for (const { chave } of ATRIBUTOS) ficha.atributos[chave] = comoTexto(atributos[chave])
  ficha.magiasIds = Array.isArray(dados.magiasIds)
    ? [...new Set(dados.magiasIds.filter((id) => typeof id === 'string'))]
    : []
  return ficha
}

export function criarFicha() {
  return fichaPadrao()
}

export function novoIdFicha() {
  return novoId()
}

function lerTodas() {
  let bruto
  try {
    bruto = localStorage.getItem(CHAVE)
  } catch {
    return []
  }
  if (!bruto) return []
  try {
    const lista = JSON.parse(bruto)
    if (!Array.isArray(lista)) throw new Error('formato inesperado')
    return lista.flatMap((item) => {
      try {
        return [normalizarFicha(item)]
      } catch {
        return []
      }
    })
  } catch {
    // Dados corrompidos: guarda uma cópia em vez de apagar.
    try {
      localStorage.setItem(`${CHAVE}:corrompido:${Date.now()}`, bruto)
    } catch {
      /* sem espaço para a cópia */
    }
    return []
  }
}

function gravarTodas(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista))
    return true
  } catch {
    return false
  }
}

export function listarFichas() {
  return lerTodas()
}

export function obterFicha(id) {
  return lerTodas().find((f) => f.id === id) ?? null
}

// Cria ou atualiza. Retorna false se o navegador recusar a gravação.
export function salvarFicha(ficha) {
  const lista = lerTodas()
  const atual = { ...normalizarFicha(ficha), atualizadoEm: new Date().toISOString() }
  const indice = lista.findIndex((f) => f.id === atual.id)
  if (indice >= 0) lista[indice] = atual
  else lista.push(atual)
  return gravarTodas(lista)
}

export function excluirFicha(id) {
  return gravarTodas(lerTodas().filter((f) => f.id !== id))
}

// Última ficha aberta (usada para reabrir a ficha e como alvo padrão no Grimório).
const CHAVE_ABERTA = 'grimorio-rpg:aberta'

export function obterIdAberta() {
  try {
    return localStorage.getItem(CHAVE_ABERTA)
  } catch {
    return null
  }
}

export function definirIdAberta(id) {
  try {
    if (id) localStorage.setItem(CHAVE_ABERTA, id)
    else localStorage.removeItem(CHAVE_ABERTA)
  } catch {
    /* ignorado */
  }
}
