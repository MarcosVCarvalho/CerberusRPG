// Exportação e importação de fichas em arquivos JSON (backup e troca entre dispositivos).

import { normalizarFicha } from './personagensStorage.js'

function baixar(nomeArquivo, conteudo) {
  const blob = new Blob([JSON.stringify(conteudo, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function nomeSeguro(texto) {
  const limpo = (texto || 'ficha')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return limpo || 'ficha'
}

export function exportarFicha(ficha) {
  baixar(`${nomeSeguro(ficha.nome)}.json`, ficha)
}

export function exportarTodas(fichas) {
  const data = new Date().toISOString().slice(0, 10)
  baixar(`grimorio-backup-${data}.json`, fichas)
}

// Lê um arquivo .json com uma ficha ou uma lista de fichas.
// Retorna as fichas normalizadas ou lança um Error com mensagem amigável.
export async function lerArquivoFichas(arquivo) {
  let dados
  try {
    dados = JSON.parse(await arquivo.text())
  } catch {
    throw new Error(`"${arquivo.name}" não é um arquivo JSON válido.`)
  }
  const itens = Array.isArray(dados) ? dados : [dados]
  if (itens.length === 0) throw new Error(`"${arquivo.name}" não contém nenhuma ficha.`)
  const fichas = itens.map((item, i) => {
    try {
      if (!item || typeof item !== 'object' || !('nome' in item || 'atributos' in item)) {
        throw new Error()
      }
      return normalizarFicha(item)
    } catch {
      throw new Error(`O item ${i + 1} de "${arquivo.name}" não é uma ficha válida.`)
    }
  })
  return fichas
}
