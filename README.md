# 🏠 MKM Consultoria Imobiliária

<div align="center">

![MKM Logo](./src/assets/Mkmbackground.png)

**Plataforma imobiliária moderna para compra, venda e locação de imóveis em Praia Grande - SP**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rodando o Projeto](#rodando-o-projeto)
- [Segurança](#segurança)
- [Autenticação JWT](#autenticação-jwt)
- [API Endpoints](#api-endpoints)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)

---

## 🏢 Sobre o Projeto

A **MKM Corretagem & Consultoria** é uma plataforma imobiliária completa para a região de Praia Grande, SP. O sistema permite:

- 🔍 Busca e filtragem avançada de imóveis
- 📱 Interface responsiva e moderna
- 🔒 Área administrativa protegida com JWT
- 📊 Dashboard com relatórios mensais
- 💬 Integração direta com WhatsApp
- ❤️ Sistema de favoritos
- 📝 Cadastro e gestão de imóveis

---

## 🛠 Tecnologias

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.x | Framework UI |
| React Router DOM | 6.x | Roteamento |
| React Icons | 5.x | Ícones |
| Axios | 1.x | HTTP Client |

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 18+ | Runtime |
| Express | 4.x | Framework HTTP |
| PostgreSQL | 15+ | Banco de dados |
| JWT | - | Autenticação |
| Bcrypt | - | Hash de senhas |
| Helmet | - | Segurança HTTP |
| Rate Limiter | - | Proteção DDoS |

---

## 📁 Estrutura do Projeto

```
mkm-consultoria/
├── 📂 src/
│   ├── 📂 assets/           # Imagens e recursos estáticos
│   │   ├── Mkmbackground.png
│   │   ├── Mkmbackground.jpg
│   │   └── whatsapp.png
│   ├── 📂 components/       # Componentes reutilizáveis
│   │   ├── Header.jsx
│   │   ├── HeaderAdmin.jsx
│   │   ├── Footer.jsx
│   │   ├── ImovelCard.jsx
│   │   ├── SearchBar.jsx
│   │   ├── TabelaImoveis.jsx
│   │   ├── SobreTexto.jsx
│   │   └── AdminForm.jsx
│   ├── 📂 pages/            # Páginas da aplicação
│   │   ├── Home.jsx
│   │   ├── ListarImoveis.jsx
│   │   ├── ImovelDetalhe.jsx
│   │   ├── Sobre.jsx
│   │   ├── Anuncie.jsx
│   │   ├── FaleConosco.jsx
│   │   ├── Favoritos.jsx
│   │   ├── FiltrosImoveis.jsx
│   │   ├── LoginAdm.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── CadastrarImoveis.jsx
│   │   ├── EditarImoveis.jsx
│   │   ├── Painel.jsx
│   │   ├── PainelAdmin.jsx
│   │   └── Contato.jsx
│   ├── 📂 styles/           # Arquivos CSS
│   ├── 📂 hooks/            # Custom React hooks
│   ├── 📂 services/         # Serviços e API calls
│   ├── 📂 context/          # Context API (auth, etc.)
│   ├── App.jsx
│   └── index.js
├── 📂 server/               # Backend (separado ou integrado)
│   ├── 📂 config/
│   │   └── database.js      # ⚠️ NÃO versionar - usar .env
│   ├── 📂 middleware/
│   │   ├── auth.js          # JWT middleware
│   │   ├── rateLimit.js
│   │   └── security.js
│   ├── 📂 routes/
│   │   ├── imoveis.js
│   │   ├── auth.js
│   │   └── admin.js
│   └── index.js
├── .env.example             # Template de variáveis (SEM valores reais)
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- PostgreSQL 15+

### Clone o repositório
```bash
git clone https://github.com/seu-usuario/mkm-consultoria.git
cd mkm-consultoria
```

### Instale as dependências do frontend
```bash
npm install
```

### Instale as dependências do backend
```bash
cd server
npm install
```

---

## 🔑 Variáveis de Ambiente

**NUNCA commite arquivos `.env` com valores reais!**

Copie o arquivo de exemplo e preencha com seus valores:
```bash
cp .env.example .env
```

### `.env.example` (template público):
```env
# === BANCO DE DADOS ===
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mkm_db
DB_USER=seu_usuario
DB_PASSWORD=sua_senha_segura

# === JWT ===
JWT_SECRET=seu_segredo_jwt_muito_longo_e_aleatorio_aqui
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=outro_segredo_para_refresh_token
JWT_REFRESH_EXPIRES_IN=30d

# === SERVIDOR ===
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# === SEGURANÇA ===
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# === EMAIL (para recuperação de senha) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# === UPLOADS ===
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

---

## 🚀 Rodando o Projeto

### Desenvolvimento
```bash
# Terminal 1 - Frontend
npm start

# Terminal 2 - Backend
cd server
npm run dev
```

### Produção
```bash
# Build do frontend
npm run build

# Iniciar servidor
cd server
npm start
```

---

## 🔐 Segurança

### Práticas implementadas no backend:

#### 1. Proteção de Banco de Dados
```javascript
// Usar queries parametrizadas (NUNCA concatenar strings SQL)
// ✅ CORRETO:
db.query('SELECT * FROM imoveis WHERE id = $1', [id])

// ❌ ERRADO (SQL Injection):
db.query(`SELECT * FROM imoveis WHERE id = ${id}`)
```

#### 2. Headers de Segurança (Helmet.js)
```javascript
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  hsts: { maxAge: 31536000 }
}))
```

#### 3. Rate Limiting
```javascript
// Limita 100 requests por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições, tente novamente mais tarde'
})
```

#### 4. CORS Configurado
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))
```

#### 5. Sanitização de Input
```javascript
// Usar express-validator para validar e sanitizar inputs
const { body, validationResult } = require('express-validator')
```

---

## 🔑 Autenticação JWT

### Fluxo de autenticação:

```
1. Admin faz login (POST /api/auth/login)
2. Servidor valida credenciais com bcrypt
3. Servidor retorna accessToken (7d) + refreshToken (30d)
4. Frontend armazena tokens no httpOnly cookie (mais seguro) ou localStorage
5. Cada request protegido envia: Authorization: Bearer <token>
6. Middleware verifica token antes de processar a rota
7. Se token expirado: POST /api/auth/refresh para renovar
```

### Exemplo de uso no frontend:
```javascript
// Fazer login
const response = await api.post('/auth/login', { email, senha })
const { accessToken } = response.data

// Armazenar (prefira httpOnly cookies no backend)
localStorage.setItem('mkm_token', accessToken)

// Usar em requests
api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
```

### Proteger rotas no frontend:
```jsx
// PrivateRoute.jsx
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}
```

---

## 📡 API Endpoints

### Públicos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/imoveis` | Listar imóveis |
| GET | `/api/imoveis/:id` | Detalhe do imóvel |
| GET | `/api/imoveis/busca` | Busca com filtros |

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login do corretor |
| POST | `/api/auth/refresh` | Renovar token |
| POST | `/api/auth/logout` | Logout |

### Admin (requer JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/imoveis` | Listar todos |
| POST | `/api/admin/imoveis` | Cadastrar imóvel |
| PUT | `/api/admin/imoveis/:id` | Editar imóvel |
| DELETE | `/api/admin/imoveis/:id` | Remover imóvel |
| GET | `/api/admin/relatorios` | Dashboard dados |

---

## 🚢 Deploy

### Variáveis obrigatórias em produção:
- `NODE_ENV=production`
- `JWT_SECRET` (mínimo 64 caracteres, completamente aleatório)
- `DB_*` (configurações do banco de produção)
- `FRONTEND_URL` (URL do frontend em produção)

### Checklist de segurança para produção:
- [ ] HTTPS habilitado (SSL/TLS)
- [ ] Variáveis de ambiente configuradas no servidor
- [ ] Banco de dados com senha forte e acesso restrito
- [ ] Backup automático do banco configurado
- [ ] Logs de acesso habilitados
- [ ] Rate limiting configurado
- [ ] CORS restrito ao domínio do frontend

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">

Feito com ❤️ para **MKM Corretagem & Consultoria**

📍 Praia Grande - SP | 📞 (11) 99293-1055

</div>