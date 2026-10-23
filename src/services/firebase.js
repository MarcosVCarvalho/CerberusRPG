// Inicialização do Firebase/Firestore.
// Em desenvolvimento, VITE_FIRESTORE_EMULADOR=localhost:8080 usa o emulador local em vez do projeto real.

import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { firebaseConfig } from '../firebase.config.js'

const emulador = import.meta.env.VITE_FIRESTORE_EMULADOR

export const firebaseConfigurado = Boolean(emulador || firebaseConfig.projectId)

let db = null

export function bancoDeDados() {
  if (!firebaseConfigurado) throw new Error('O Firebase ainda não foi configurado.')
  if (!db) {
    const config = emulador ? { ...firebaseConfig, projectId: 'demo-grimorio' } : firebaseConfig
    db = getFirestore(initializeApp(config))
    if (emulador) {
      const [host, porta] = emulador.split(':')
      connectFirestoreEmulator(db, host, Number(porta))
    }
  }
  return db
}
