// Preferências guardadas só neste navegador: mesa atual, mesas recentes e última ficha aberta.

import { ref } from 'vue'

const CHAVE_MESA = 'grimorio-rpg:mesa'
const CHAVE_RECENTES = 'grimorio-rpg:mesas-recentes'
const CHAVE_ABERTA = 'grimorio-rpg:aberta'
// Fichas da versão antiga (antes da mesa online), guardadas só no navegador.
const CHAVE_FICHAS_LOCAIS = 'grimorio-rpg:personagens'
const CHAVE_MIGRADAS = 'grimorio-rpg:personagens:enviadas'

function ler(chave) {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

function gravar(chave, valor) {
  try {
    if (valor === null) localStorage.removeItem(chave)
    else localStorage.setItem(chave, valor)
  } catch {
    /* armazenamento bloqueado: a preferência só não é lembrada */
  }
}

function lerJson(chave, padrao) {
  try {
    return JSON.parse(ler(chave)) ?? padrao
  } catch {
    return padrao
  }
}

export const mesaAtualId = ref(ler(CHAVE_MESA))

export function entrarNaMesa(id) {
  mesaAtualId.value = id
  gravar(CHAVE_MESA, id)
}

export function sairDaMesa() {
  mesaAtualId.value = null
  gravar(CHAVE_MESA, null)
}

export function mesasRecentes() {
  const lista = lerJson(CHAVE_RECENTES, [])
  return Array.isArray(lista) ? lista : []
}

export function lembrarMesa(id, nome) {
  const lista = mesasRecentes().filter((m) => m.id !== id)
  lista.unshift({ id, nome })
  gravar(CHAVE_RECENTES, JSON.stringify(lista.slice(0, 10)))
}

export function esquecerMesa(id) {
  gravar(CHAVE_RECENTES, JSON.stringify(mesasRecentes().filter((m) => m.id !== id)))
}

export function obterIdAberta(mesaId) {
  return ler(`${CHAVE_ABERTA}:${mesaId}`)
}

export function definirIdAberta(mesaId, fichaId) {
  gravar(`${CHAVE_ABERTA}:${mesaId}`, fichaId)
}

// Fichas salvas no navegador pela versão antiga, ainda não enviadas para nenhuma mesa.
export function fichasLocaisPendentes() {
  if (ler(CHAVE_MIGRADAS)) return []
  const lista = lerJson(CHAVE_FICHAS_LOCAIS, [])
  return Array.isArray(lista) ? lista : []
}

// Não apaga as fichas locais (continuam como backup); só deixa de oferecer o envio.
export function marcarFichasLocaisEnviadas() {
  gravar(CHAVE_MIGRADAS, new Date().toISOString())
}
