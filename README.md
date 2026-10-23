# Grimório RPG

Site simples para RPG de mesa: fichas de personagem e catálogo de magias, com visual medieval.
Feito com Vue 3 + Vite e hospedado no GitHub Pages. Não tem backend: os dados ficam no navegador.

## Rodar no computador

Precisa do [Node.js](https://nodejs.org) instalado.

```bash
npm install      # só na primeira vez
npm run dev      # abre em http://localhost:5173
```

Para testar a versão final: `npm run build` e depois `npm run preview`.

## Publicar no GitHub Pages

Repositório: <https://github.com/MarcosVCarvalho/CerberusRPG>
Site: <https://marcosvcarvalho.github.io/CerberusRPG/>

Configuração (uma vez só): no GitHub, abra **Settings › Pages** e, em
**Build and deployment › Source**, escolha **GitHub Actions**.

Depois disso, todo `git push` na branch `main` publica a nova versão automaticamente.
O andamento aparece na aba **Actions** do repositório.

## Onde ficam os dados

- As fichas são salvas no **LocalStorage** do navegador. Cada pessoa e cada dispositivo têm as suas.
  Nada é sincronizado entre os jogadores.
- Use **Exportar** (uma ficha) ou **Exportar todas** (backup) para gerar um arquivo `.json`.
  Use **Importar JSON** para carregar esse arquivo em outro navegador ou dispositivo.
- Limpar os dados do navegador apaga as fichas que não tiverem backup.

## Editar o catálogo de magias

As magias ficam em [`src/data/magias.js`](src/data/magias.js). As atuais são exemplos e podem ser
substituídas pelas da campanha. Cada magia precisa de um `id` único, que não deve mudar depois de
publicado, porque as fichas guardam esse id. Depois de editar, faça commit e push para publicar.

## Estrutura

```text
src/
├── App.vue                     cabeçalho e navegação (#/personagens, #/grimorio)
├── style.css                   cores e estilos globais
├── components/
│   ├── FichaPersonagem.vue     a ficha (campos reativos)
│   ├── ListaPersonagens.vue    lista com busca
│   ├── ListaMagias.vue         cartões de magia
│   └── SeletorMagias.vue       magias do grimório associadas à ficha
├── views/
│   ├── PersonagensView.vue     gerenciar fichas, salvar automático, importar/exportar
│   └── GrimorioView.vue        catálogo com busca e filtros
├── data/magias.js              catálogo de magias
├── services/
│   ├── personagensStorage.js   leitura/gravação no LocalStorage
│   └── arquivoJson.js          exportar e importar JSON
└── utils/texto.js              busca sem acentos
```

As decisões do projeto estão em [`decisoes-grimorio-rpg.md`](decisoes-grimorio-rpg.md).
