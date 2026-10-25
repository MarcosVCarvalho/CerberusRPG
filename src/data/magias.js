// Catálogo de magias e habilidades, separado por grupo (classe ou afiliação).
// Classes: magias-por-classe.json, no formato { classes: { <Classe>: { <nível>: [ { nome, efeito, usos_dia } ] } } }.
// Afiliações: afiliacoes.json, no formato { afiliacoes: { <Afiliação>: { tema, atributo, habilidades: { <nível>: [...] } } } }.
// Cada item recebe um id "<grupo>-<nome>" (ex.: "mago-bola-de-fogo"). As fichas guardam esse id,
// então renomear uma magia, classe ou afiliação desfaz a associação nas fichas que já a tinham.
// usos_dia nulo indica habilidade passiva.

import dadosClasses from './magias-por-classe.json'
import dadosAfiliacoes from './afiliacoes.json'
import { paraBusca } from '../utils/texto.js'

function slug(texto) {
  return paraBusca(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const classes = Object.keys(dadosClasses.classes)
export const afiliacoes = Object.keys(dadosAfiliacoes.afiliacoes)

function listar(tipo, grupo, porNivel) {
  return Object.entries(porNivel).flatMap(([nivel, lista]) =>
    lista.map((magia) => ({
      id: `${slug(grupo)}-${slug(magia.nome)}`,
      tipo,
      grupo,
      nivel: Number(nivel),
      nome: magia.nome,
      efeito: magia.efeito ?? '',
      usosDia: magia.usos_dia ?? null,
    })),
  )
}

export const magias = [
  ...classes.flatMap((c) => listar('classe', c, dadosClasses.classes[c])),
  ...afiliacoes.flatMap((a) => listar('afiliacao', a, dadosAfiliacoes.afiliacoes[a].habilidades)),
]

const porId = new Map(magias.map((m) => [m.id, m]))

export function obterMagia(id) {
  return porId.get(id) ?? null
}

export function textoUsos(magia) {
  return magia.usosDia === null ? 'Passiva' : `${magia.usosDia}×/dia`
}

function doCatalogo(nomes, texto) {
  const alvo = paraBusca(texto)
  return nomes.find((n) => paraBusca(n) === alvo) ?? null
}

// Encontram a classe ou afiliação do catálogo que corresponde ao texto digitado na ficha
// (sem diferenciar acentos e maiúsculas). Retornam null se não houver.
export const classeDoCatalogo = (texto) => doCatalogo(classes, texto)
export const afiliacaoDoCatalogo = (texto) => doCatalogo(afiliacoes, texto)

// { tema, atributo } da afiliação, ou null.
export function dadosDaAfiliacao(nome) {
  const dados = dadosAfiliacoes.afiliacoes[nome]
  return dados ? { tema: dados.tema, atributo: dados.atributo } : null
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
