# Grimório RPG — Decisões do Projeto

## 1. Objetivo

Desenvolver um site simples para RPG de mesa, com visual medieval, onde seja possível gerenciar fichas de personagens e consultar um catálogo de magias.

O site será publicado gratuitamente pelo GitHub Pages.

## 2. Tecnologias escolhidas

- **Vue 3** para a interface.
- **Vite** para criação, execução e compilação do projeto.
- **JavaScript** para a lógica da aplicação.
- **HTML e CSS** para estrutura e apresentação.
- **LocalStorage** para salvar dados no navegador na primeira versão.
- **JSON** para importar e exportar fichas e realizar backups.
- **GitHub Pages** para hospedar a interface estática.

Não usaremos Laravel, PHP ou um backend na primeira versão. Também não usaremos um banco de dados tradicional inicialmente.

## 3. Usuários e compartilhamento

O site será acessado pelo criador da campanha e pelos jogadores.

Na primeira versão:
- Cada navegador terá seu próprio LocalStorage.
- Os dados salvos no navegador de um jogador **não serão sincronizados automaticamente** com os demais.
- Fichas poderão ser transferidas entre dispositivos por importação e exportação de arquivos JSON.
- O catálogo inicial de magias será disponibilizado no próprio projeto e poderá ser consultado por todos os visitantes.

Se no futuro for necessário compartilhar e atualizar as mesmas fichas em tempo real entre jogadores, será preciso integrar um serviço de armazenamento online, como Supabase ou Firebase. O GitHub Pages poderá continuar hospedando o frontend.

## 4. Ficha de personagem

O componente da ficha deverá preservar o estilo do HTML fornecido.

### Identidade e informações básicas
- Jogador
- Nome do personagem
- Raça
- Classe
- Nível
- Dinheiro
- Idade
- Gênero

### Atributos
- Vida
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
- Os dados serão salvos localmente.
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

Funcionalidades planejadas:
- Lista de magias.
- Busca por nome.
- Filtros por categoria, elemento ou nível.
- Exibição da descrição e dos detalhes de cada magia.
- Campos previstos para custo, alcance, duração e efeitos.
- Possibilidade de associar magias a personagens em uma etapa posterior.

As magias iniciais ficarão em um arquivo de dados separado, por exemplo `src/data/magias.js`. Na primeira versão, esse catálogo será parte estática do site; mudanças feitas por visitantes não atualizarão o catálogo publicado para os demais.

## 7. Estrutura de arquivos

```text
grimorio-rpg/
├── .github/workflows/deploy.yml
├── src/
│   ├── components/
│   │   ├── FichaPersonagem.vue
│   │   ├── ListaPersonagens.vue
│   │   ├── ListaMagias.vue
│   │   └── SeletorMagias.vue
│   ├── views/
│   │   ├── PersonagensView.vue
│   │   └── GrimorioView.vue
│   ├── data/
│   │   └── magias.js
│   ├── services/
│   │   ├── personagensStorage.js
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
- Várias fichas salvas no LocalStorage, com salvamento automático, busca, criação e exclusão.
- Exportação de uma ficha ou de todas (backup) e importação de JSON, com tratamento de ids repetidos.
- Catálogo de magias com busca sem acentos e filtros por categoria, elemento e nível. As magias atuais são exemplos.
- Associação de magias do catálogo às fichas (campo `magiasIds`), pela ficha ou pelo Grimório.
- Navegação por hash (`#/personagens`, `#/grimorio`), sem vue-router.
- Workflow do GitHub Actions para publicar no GitHub Pages.

**Pendente:** criar o repositório no GitHub, fazer o push e ativar o Pages (ver README). Também falta trocar as magias de exemplo pelas da campanha.

## 11. Restrições e cuidados conhecidos

- LocalStorage é específico de cada navegador e dispositivo.
- Limpar os dados do navegador pode apagar fichas que não tenham backup.
- Exportar/importar JSON é o mecanismo inicial de transferência e backup.
- O GitHub Pages hospeda arquivos estáticos; não executa PHP ou um backend.
- Não colocar senhas, chaves secretas ou credenciais privadas no frontend.
- Para autenticação, permissões e sincronização compartilhada, será necessária uma solução adicional no futuro.

## 12. Princípio de desenvolvimento

Implementar em etapas pequenas, testar cada etapa e preservar o visual original da ficha. Priorizar primeiro o armazenamento e o gerenciamento de fichas; depois desenvolver o catálogo de magias e, por último, finalizar a publicação.
