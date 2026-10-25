// Mesa online (Firestore): as fichas ficam em mesas/{mesaId}/fichas/{fichaId}
// e todos que abrem o link da mesa veem as mudanças em tempo real.
// O id da mesa é longo e aleatório: funciona como a "chave" de acesso do link.

import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { bancoDeDados } from './firebase.js'
import { normalizarFicha } from './ficha.js'

const ALFABETO = 'abcdefghijklmnopqrstuvwxyz0123456789'
const TAMANHO_ID = 20
const FORMATO_ID = new RegExp(`^[a-z0-9]{${TAMANHO_ID}}$`)

function gerarIdMesa() {
  const bytes = crypto.getRandomValues(new Uint8Array(TAMANHO_ID))
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('')
}

// Aceita o link completo de convite ou só o código da mesa.
export function extrairIdMesa(texto) {
  const limpo = (texto ?? '').trim()
  const doLink = limpo.match(/mesa\/([a-z0-9]+)/i)?.[1] ?? limpo
  const id = doLink.toLowerCase()
  return FORMATO_ID.test(id) ? id : null
}

export function linkDaMesa(mesaId) {
  return `${location.origin}${location.pathname}#/mesa/${mesaId}`
}

const refMesa = (mesaId) => doc(bancoDeDados(), 'mesas', mesaId)
const refFichas = (mesaId) => collection(bancoDeDados(), 'mesas', mesaId, 'fichas')
const refFicha = (mesaId, fichaId) => doc(refFichas(mesaId), fichaId)

export async function criarMesa(nome) {
  const id = gerarIdMesa()
  await setDoc(refMesa(id), { nome: nome.trim().slice(0, 80), criadoEm: serverTimestamp() })
  return id
}

export async function obterMesa(mesaId) {
  const snap = await getDoc(refMesa(mesaId))
  return snap.exists() ? { id: snap.id, nome: snap.data().nome ?? '' } : null
}

// Chama aoMudar(fichas, { offline }) a cada mudança. Retorna a função que para de ouvir.
export function ouvirFichas(mesaId, aoMudar, aoErro) {
  return onSnapshot(
    refFichas(mesaId),
    { includeMetadataChanges: true },
    (snap) => {
      const fichas = snap.docs.map((d) => normalizarFicha({ ...d.data(), id: d.id }))
      aoMudar(fichas, { offline: snap.metadata.fromCache })
    },
    aoErro,
  )
}

function paraBanco(ficha) {
  const { id, ...dados } = normalizarFicha(ficha)
  return dados
}

// Grava a ficha inteira (criação e importação).
export function salvarFichaCompleta(mesaId, ficha) {
  return setDoc(refFicha(mesaId, ficha.id), paraBanco(ficha))
}

// Atualiza só os campos alterados, ex.: { pvAtual: '14' }.
// Assim duas pessoas editando campos diferentes da mesma ficha não se sobrescrevem.
export function atualizarCampos(mesaId, fichaId, patch) {
  return updateDoc(refFicha(mesaId, fichaId), { ...patch, atualizadoEm: new Date().toISOString() })
}

export function adicionarMagia(mesaId, fichaId, magiaId) {
  return updateDoc(refFicha(mesaId, fichaId), {
    magiasIds: arrayUnion(magiaId),
    atualizadoEm: new Date().toISOString(),
  })
}

export function excluirFicha(mesaId, fichaId) {
  return deleteDoc(refFicha(mesaId, fichaId))
}
