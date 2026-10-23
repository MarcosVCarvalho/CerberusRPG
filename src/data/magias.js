// Catálogo de magias separado por classe. Os dados ficam em magias-por-classe.json,
// no formato { classes: { <Classe>: { <nível>: [ { nome, efeito, usos_dia } ] } } }.
// Cada magia recebe um id "<classe>-<nome>" (ex.: "mago-bola-de-fogo"). As fichas guardam esse id,
// então renomear uma magia ou classe desfaz a associação nas fichas que já a tinham.

import dados from './magias-por-classe.json'
import { paraBusca } from '../utils/texto.js'

function slug(texto) {
  return paraBusca(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const classes = Object.keys(dados.classes)

export const magias = classes.flatMap((classe) =>
  Object.entries(dados.classes[classe]).flatMap(([nivel, lista]) =>
    lista.map((magia) => ({
      id: `${slug(classe)}-${slug(magia.nome)}`,
      classe,
      nivel: Number(nivel),
      nome: magia.nome,
      efeito: magia.efeito ?? '',
      usosDia: magia.usos_dia ?? null,
    })),
  ),
)

const porId = new Map(magias.map((m) => [m.id, m]))

export function obterMagia(id) {
  return porId.get(id) ?? null
}

// Encontra a classe do catálogo que corresponde ao texto digitado na ficha
// (sem diferenciar acentos e maiúsculas). Retorna null se não houver.
export function classeDoCatalogo(texto) {
  const alvo = paraBusca(texto)
  return classes.find((c) => paraBusca(c) === alvo) ?? null
}

// Agrupa uma lista de magias por nível, em ordem crescente.
export function agruparPorNivel(lista) {
  const grupos = new Map()
  for (const magia of lista) {
    if (!grupos.has(magia.nivel)) grupos.set(magia.nivel, [])
    grupos.get(magia.nivel).push(magia)
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => a - b)
    .map(([nivel, itens]) => ({ nivel, magias: itens }))
}
