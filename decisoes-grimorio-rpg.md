# Grimório RPG — Decisões do Projeto

## 1. Objetivo

Desenvolver um site simples para RPG de mesa, com visual medieval, onde seja possível gerenciar fichas de personagens e consultar um catálogo de magias.

O site será publicado gratuitamente pelo GitHub Pages.

## 2. Tecnologias escolhidas

- **Vue 3** para a interface.
- **Vite** para criação, execução e compilação do projeto.
- **JavaScript** para a lógica da aplicação.
- **HTML e CSS** para estrutura e apresentação.
- **Firebase Firestore** (plano gratuito) para guardar as fichas online e sincronizá-las em tempo real.
- **LocalStorage** apenas para preferências do navegador (mesa atual, mesas recentes).
- **JSON** para importar e exportar fichas e realizar backups.
- **GitHub Pages** para hospedar a interface estática.

Não usaremos Laravel, PHP nem um servidor próprio. O Firestore é acessado diretamente pelo navegador, e as regras de segurança ficam em `firestore.rules`.

O Firestore foi escolhido em vez do Supabase porque tem tempo real nativo e o projeto gratuito não é pausado por inatividade. No Supabase gratuito, o projeto é pausado depois de cerca de uma semana sem uso, o que atrapalharia mesas semanais ou quinzenais.

## 3. Usuários e compartilhamento

O site será acessado pelo criador da campanha e pelos jogadores.

- As fichas ficam numa **mesa online**. O mestre cria a mesa e compartilha o **link de convite** (`#/mesa/<código>`).
- **Quem tem o link vê e edita todas as fichas da mesa**, sem login. O código tem 20 caracteres aleatórios e as mesas não podem ser listadas. Se o link vazar, cria-se uma mesa nova.
- As mudanças aparecem para todos em tempo real, por exemplo o PV reduzido durante o combate. Cada campo é gravado separadamente, então edições em campos diferentes não se sobrescrevem.
- Exportar/importar JSON continua disponível para backup e para mover fichas entre mesas.
- O catálogo de magias é parte estática do site e pode ser consultado por todos, com ou sem mesa.

Se no futuro for necessário restringir quem edita cada ficha (por exemplo, o jogador só edita a própria e o mestre edita todas), dá para adicionar login com Firebase Authentication e ajustar as regras.

## 4. Ficha de personagem

O componente da ficha deverá preservar o estilo do HTML fornecido.

### Identidade e informações básicas
- Jogador
- Nome do personagem
- Raça
- Classe
- Afiliação
- Nível
- Dinheiro
- Idade
- Gênero

### Vida e origem
- PV atual, editável, e PV máximo, calculado pela raça, classe e nível (regras do Livro de Regras em `src/data/regras.js`).
- Tamanho, movimento e traço da raça, e tema e atributo da afiliação, quando o texto do campo corresponde ao catálogo.
- Fichas da versão 1 guardavam os PV no atributo "Vida"; ao abrir, esse valor passa para o PV atual.

### Atributos
- Ataque
- Defesa
- Agilidade
- Furtividade
- Inteligência
- Misticismo
- Precisão
- Percepção
- Carisma
- Enganação
- Sorte

### Campos de texto
- Magias e habilidades
- Traço de personalidade
- Traços positivos
- Traços negativos
- Equipamentos

### Comportamento previsto
- Os campos serão reativos, utilizando `v-model` do Vue.
- Será possível criar, abrir, editar e excluir fichas.
- Os dados serão salvos na mesa online e sincronizados em tempo real.
- Será possível exportar e importar fichas em JSON.
- A aplicação deverá funcionar em computador e celular.

## 5. Visual da ficha

Manter a identidade visual do HTML original:
- Fundo externo cinza-bege (`#e9e5df`).
- Fundo da ficha em tom de pergaminho (`#fdfaf6`).
- Bordas marrons escuras (`#2c1a0c`), espessas e arredondadas.
- Caixas brancas.
- Fonte serifada Georgia nos títulos e no estilo geral.
- Campos de texto com linhas inferiores tracejadas.
- Organização em duas colunas em telas maiores.
- Organização em uma coluna em telas estreitas.
- Aparência limpa e temática de fantasia medieval.

A página inicial também terá o título **Grimório RPG**, com o subtítulo “O registro das suas aventuras” e o texto de cabeçalho “Crônicas da campanha”.

## 6. Catálogo de magias

Haverá uma área própria para o catálogo, separada da ficha.

As magias são **separadas por classe** (Druida, Guerreiro, Necromante, Ladino, Clérigo, Paladino, Bardo, Mago, Bárbaro e Patrulheiro). Cada classe tem 10 níveis com 4 magias cada, 400 no total. Cada magia tem nome, efeito e usos por dia.

As **afiliações** (Pacto do Sangue Carmesim, Sindicato da Máscara de Prata, A Chama Inquisidora, Herança Licantropa, Confraria do Mecanismo, Mago das Sombras e Domínio da Luz) têm uma habilidade nos níveis 1, 3, 5, 7 e 9, 35 no total. Habilidades passivas não têm usos por dia.

Funcionalidades:
- Uma aba por classe e por afiliação, com as magias agrupadas por nível, e uma aba "Todas".
- Busca por nome ou efeito, sem diferenciar acentos.
- Filtro por nível.
- Associação de magias às fichas, pelo Grimório ou pela própria ficha. Na ficha, o seletor mostra só as magias da classe e da afiliação do personagem quando os campos Classe e Afiliação correspondem ao catálogo.

Os dados ficam em `src/data/magias-por-classe.json` (classe › nível › magias) e `src/data/afiliacoes.json` (afiliação › nível › habilidades). Cada magia é identificada por classe ou afiliação + nome. O catálogo é parte estática do site: mudanças feitas por visitantes não atualizam o catálogo publicado para os demais.

## 6.1. Rolador de dados e regras

- **Rolador de dados:** botão flutuante "🎲 Dados" em todas as abas, com d4, d6, d8, d10, d12, d20 e d100, quantidade, modificador e vantagem ou desvantagem para um único d20. As rolagens ficam só no navegador de quem rolou (não vão para a mesa) e o histórico dura até a página ser recarregada.
- **Rolar pela ficha:** o botão 🎲 de cada atributo rola 1d20 + atributo com o nome do personagem.
- **Aba Regras (`#/regras`):** o Livro de Regras dentro do site, com índice por seção. O texto fica em `src/data/livro-de-regras.md`, uma cópia do documento do livro que precisa ser atualizada quando ele mudar.

## 7. Estrutura de arquivos

```text
grimorio-rpg/
├── .github/workflows/deploy.yml
├── src/
│   ├── components/
│   │   ├── MesaInicio.vue
│   │   ├── FichaPersonagem.vue
│   │   ├── ListaPersonagens.vue
│   │   ├── ListaMagias.vue
│   │   ├── RoladorDados.vue
│   │   └── SeletorMagias.vue
│   ├── views/
│   │   ├── PersonagensView.vue
│   │   ├── GrimorioView.vue
│   │   └── RegrasView.vue
│   ├── data/
│   │   ├── magias-por-classe.json
│   │   ├── afiliacoes.json
│   │   ├── livro-de-regras.md
│   │   ├── magias.js
│   │   └── regras.js
│   ├── services/
│   │   ├── dados.js
│   │   ├── firebase.js
│   │   ├── mesaOnline.js
│   │   ├── ficha.js
│   │   ├── preferencias.js
│   │   └── arquivoJson.js
│   ├── utils/
│   │   └── texto.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── vite.config.js
└── package.json
```

A estrutura poderá ser ajustada conforme o projeto evoluir. A intenção é separar componentes visuais, páginas, dados estáticos e acesso ao armazenamento local.

## 8. Etapas de implementação

1. Criar o projeto Vue 3 com Vite.
2. Transformar o HTML da ficha em `FichaPersonagem.vue`, preservando o visual e tornando os campos reativos.
3. Implementar o salvamento e a recuperação dos dados com LocalStorage.
4. Criar a área de personagens com cadastro, listagem, edição, exclusão e busca.
5. Implementar importação e exportação de fichas em JSON.
6. Criar o catálogo de magias com pesquisa e filtros.
7. Permitir associar magias às fichas.
8. Testar responsividade, validações e persistência.
9. Configurar a compilação e publicação automática pelo GitHub Pages usando GitHub Actions.

## 9. Comandos

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera a pasta dist/
npm run preview   # serve a versão compilada
```

## 10. Estado atual

Implementado (etapas 1 a 9):
- Ficha recriada a partir das regras visuais da seção 5 (o HTML original não estava disponível), com campos reativos via `v-model`.
- Mesa online no Firestore com link de convite. As fichas são sincronizadas em tempo real, campo a campo, com busca, criação e exclusão.
- Aviso para enviar à mesa as fichas da versão antiga (salvas só no navegador).
- Exportação de uma ficha ou de todas (backup) e importação de JSON, com tratamento de ids repetidos.
- Catálogo de 400 magias separadas por classe (10 classes × 10 níveis) e 35 habilidades de afiliação, com busca por nome ou efeito e filtro por nível.
- Associação de magias do catálogo às fichas (campo `magiasIds`), pela ficha ou pelo Grimório.
- Navegação por hash (`#/personagens`, `#/grimorio`, `#/mesa/<código>`), sem vue-router.
- Workflow do GitHub Actions para publicar no GitHub Pages.

**Pendente:** criar o projeto no Firebase, publicar as regras de `firestore.rules`, preencher `src/firebase.config.js` e ativar o GitHub Pages. Ver README.

## 11. Restrições e cuidados conhecidos

- Quem tem o link da mesa pode editar todas as fichas. O link deve ser compartilhado só com o grupo.
- Fichas excluídas da mesa não podem ser recuperadas sem um backup em JSON.
- O plano gratuito do Firebase tem limites diários de leituras e gravações, folgados para um grupo de RPG.
- O GitHub Pages hospeda arquivos estáticos; não executa PHP ou um backend.
- Não colocar senhas, chaves secretas ou credenciais privadas no frontend. A configuração do Firebase (`firebase.config.js`) é pública por natureza; a proteção vem das regras do Firestore.
- Para permissões por jogador será preciso adicionar login (Firebase Authentication).

## 12. Princípio de desenvolvimento

Implementar em etapas pequenas, testar cada etapa e preservar o visual original da ficha. Priorizar primeiro o armazenamento e o gerenciamento de fichas; depois desenvolver o catálogo de magias e, por último, finalizar a publicação.
