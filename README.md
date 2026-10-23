# Grimório RPG

Site simples para RPG de mesa: fichas de personagem e catálogo de magias, com visual medieval.
Feito com Vue 3 + Vite e hospedado no GitHub Pages. As fichas ficam numa **mesa online**
(Firebase Firestore): todos que têm o link da mesa veem as mudanças em tempo real.

## Rodar no computador

Precisa do [Node.js](https://nodejs.org) instalado.

```bash
npm install      # só na primeira vez
npm run dev      # abre em http://localhost:5173 (usa o projeto Firebase configurado)
```

### Testar sem conta no Firebase (emulador)

O emulador roda um Firestore falso no seu computador, com as mesmas regras de acesso.
Os dados somem quando ele é fechado. Precisa de Java instalado. Use dois terminais:

```bash
npm run emulador       # terminal 1: Firestore local na porta 8080
npm run dev:emulador   # terminal 2: site em http://localhost:5173 ligado ao emulador
```

Para testar como dois jogadores, abra o site numa janela normal e noutra anônima, crie a mesa
numa e entre pelo link de convite na outra.

## Configurar a mesa online (uma vez só)

1. Acesse <https://console.firebase.google.com> com uma conta Google e clique em
   **Adicionar projeto** (ex.: `cerberus-rpg`). O Google Analytics pode ficar desativado.
2. No menu do projeto, abra **Firestore Database › Criar banco de dados**. Escolha um local
   próximo (ex.: `southamerica-east1`, São Paulo) e o **modo de produção**.
3. Na aba **Regras** do Firestore, apague o conteúdo, cole o arquivo
   [`firestore.rules`](firestore.rules) e clique em **Publicar**.
4. Na engrenagem **Configurações do projeto › Geral › Seus apps**, clique no ícone **Web** (`</>`),
   dê um apelido e registre o app (não precisa do Firebase Hosting).
5. Copie os valores do `firebaseConfig` mostrado para [`src/firebase.config.js`](src/firebase.config.js).
   Esses valores não são segredo: quem protege os dados são as regras do passo 3.

O plano gratuito (Spark) não pede cartão e sobra para um grupo de RPG.

## Publicar no GitHub Pages

Repositório: <https://github.com/MarcosVCarvalho/CerberusRPG>
Site: <https://marcosvcarvalho.github.io/CerberusRPG/>

Configuração (uma vez só): no GitHub, abra **Settings › Pages** e, em
**Build and deployment › Source**, escolha **GitHub Actions**.

Depois disso, todo `git push` na branch `main` publica a nova versão automaticamente.
O andamento aparece na aba **Actions** do repositório.

## Como funciona a mesa

- O mestre cria a mesa e clica em **Copiar link de convite** para mandar aos jogadores.
- **Quem tem o link vê e edita todas as fichas.** Não há login. Se o link vazar, crie uma mesa nova
  (exporte as fichas e importe na mesa nova) e mande o novo link só para o grupo.
- Cada campo é salvo cerca de 0,4 s depois de parar de digitar e aparece para os outros em cerca de
  1 s. Duas pessoas editando campos diferentes da mesma ficha não se atrapalham. No mesmo campo,
  vale a última gravação.
- Sem internet, a ficha continua editável e as mudanças são enviadas quando a conexão voltar
  (desde que a página não seja fechada antes).
- **Exportar** / **Exportar todas** geram arquivos `.json` de backup. **Importar JSON** os coloca
  na mesa atual.
- Fichas criadas na versão antiga (salvas só no navegador) podem ser enviadas para a mesa pelo aviso
  que aparece ao entrar nela.

## Editar o catálogo de magias

As magias ficam em [`src/data/magias-por-classe.json`](src/data/magias-por-classe.json), separadas
por classe e por nível:

```json
{ "classes": { "Mago": { "1": [ { "nome": "Seta de Fogo", "efeito": "1d6 Dano de Fogo", "usos_dia": 4 } ] } } }
```

- Para criar uma classe nova, adicione uma chave em `classes`. Ela aparece sozinha nas abas do
  Grimório e nas sugestões do campo Classe da ficha.
- Cada magia é identificada por classe + nome (ex.: `mago-seta-de-fogo`). **Renomear** uma magia ou
  classe faz com que as fichas que já a tinham deixem de mostrá-la.
- Na ficha, quando o campo **Classe** corresponde a uma classe do grimório, o seletor de magias
  mostra só as magias dela, agrupadas por nível.

Depois de editar, faça commit e push para publicar.

## Estrutura

```text
firestore.rules                 regras de acesso do banco (colar no Console do Firebase)
firebase.json                   configuração do emulador local
src/
├── App.vue                     cabeçalho, barra da mesa e navegação (#/personagens, #/grimorio, #/mesa/<código>)
├── firebase.config.js          configuração do projeto Firebase
├── style.css                   cores e estilos globais
├── components/
│   ├── MesaInicio.vue          criar mesa / entrar pelo link / mesas recentes
│   ├── FichaPersonagem.vue     a ficha (campos reativos)
│   ├── ListaPersonagens.vue    lista com busca
│   ├── ListaMagias.vue         magias de uma classe, por nível
│   └── SeletorMagias.vue       magias do grimório associadas à ficha
├── views/
│   ├── PersonagensView.vue     fichas da mesa em tempo real, importar/exportar
│   └── GrimorioView.vue        catálogo com abas por classe, busca e filtro de nível
├── data/
│   ├── magias-por-classe.json  catálogo de magias (classe › nível › magias)
│   └── magias.js               lê o catálogo e gera os ids
├── services/
│   ├── firebase.js             inicializa o Firestore (ou o emulador)
│   ├── mesaOnline.js           mesas e fichas no Firestore
│   ├── ficha.js                modelo da ficha e comparação campo a campo
│   ├── preferencias.js         mesa atual e mesas recentes (no navegador)
│   └── arquivoJson.js          exportar e importar JSON
└── utils/texto.js              busca sem acentos
```

As decisões do projeto estão em [`decisoes-grimorio-rpg.md`](decisoes-grimorio-rpg.md).
