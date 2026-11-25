# MKM Consultoria Imobiliária

Site de imóveis de Praia Grande e região, com catálogo público, favoritos no navegador, Blog, Arquitetura e painel administrativo. O frontend usa React. A API usa Express e MySQL.

## Ambiente local

Use Node.js 20 ou superior e um banco MySQL. Crie o banco vazio (ou use o banco existente do MKM) e configure o usuário em `.env` na raiz do repositório. Copie `.env.example` como ponto de partida. Os valores `DB_*` são usados pela API, pelo preparo de tabelas e pelo comando de criação de administradores. A API também lê o antigo `servidor/.env` como fallback.

Gere uma chave de sessão com:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Coloque a chave em `JWT_SECRET`. Instale as dependências e prepare o banco:

```sh
npm ci
npm run db:setup
```

O comando cria as tabelas que estiverem faltando, incluindo `admin_sessoes`, e preserva as tabelas e os registros existentes. O usuário do banco precisa de permissão de criação de tabelas nessa etapa.

Para criar um administrador, configure `MKM_ADMIN_NOME`, `MKM_ADMIN_EMAIL` e `MKM_ADMIN_SENHA` no ambiente local e execute `npm run admin:create`. Use uma senha com pelo menos 12 caracteres e até 72 bytes. Retire essas três variáveis da configuração depois de criar a conta. As contas existentes continuam no banco. Após atualizar de uma versão anterior, entre novamente para iniciar uma sessão.

Abra dois terminais na raiz:

```sh
npm run api
```

```sh
npm start
```

Acesse `http://localhost:3000` para o site, `http://localhost:3000/login` para o painel e `http://localhost:3002/health` para o estado da API. Use o mesmo hostname nos dois serviços locais para que o navegador envie o cookie de sessão.

## Publicação

- Execute `npm run db:setup` com as credenciais do ambiente de destino antes de reiniciar a API. Execute `npm run api` com `NODE_ENV=production`, `FRONTEND_URL` em HTTPS e uma chave `JWT_SECRET` própria do ambiente.
- Defina `REACT_APP_API_URL=/api` no ambiente da build e execute `npm run build`. Sirva `build/` pelo servidor web. Encaminhe `/api/*` à API removendo o prefixo `/api` e configure as demais rotas da aplicação para servir `index.html` quando não houver um arquivo correspondente.
- Persista `UPLOADS_DIR` junto com os backups do banco. Por padrão é `uploads/` na raiz do projeto. Se o servidor anterior gravava imagens em outro diretório, configure o caminho existente para preservar os arquivos.
- Use `TRUST_PROXY_HOPS` somente se a API estiver atrás dessa quantidade de proxies confiáveis. O proxy de entrada deve controlar o cabeçalho `X-Forwarded-For`.

Blog e Arquitetura exibem o conteúdo publicado pelo painel. Rascunhos ficam disponíveis na administração. As rotas públicas de imóveis exibem os campos do catálogo. Campos internos do contrato e da captação ficam nas rotas autenticadas.

## Verificações

```sh
npm test -- --watchAll=false --runInBand
npm run test:api
npm run build
```

Contato, anúncio e dúvidas preparam uma mensagem para envio pelo próprio visitante no WhatsApp.

O teste HTTP da API usa um MySQL de teste. Configure `MKM_TEST_DB_HOST`, `MKM_TEST_DB_PORT`, `MKM_TEST_DB_USER` e `MKM_TEST_DB_PASSWORD` para a instância isolada. O usuário precisa criar e remover o banco temporário gerado pelo teste. O teste pula quando `MKM_TEST_DB_HOST` não está definido.
