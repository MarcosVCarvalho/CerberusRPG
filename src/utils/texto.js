// Normaliza texto para buscas: sem acentos, minúsculo e sem espaços nas pontas.
export function paraBusca(texto) {
  return (texto ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
