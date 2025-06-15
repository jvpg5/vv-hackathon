
# 🌟 Valoriza Vilhena

<div align="center">
  <h3>Conectando você com a história e os sabores da nossa terra 🏛️</h3>
  <p><strong>Projeto desenvolvido para o Hubee Hackathon</strong></p>
  
  ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![Strapi](https://img.shields.io/badge/Strapi-2E7EEA?style=for-the-badge&logo=strapi&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
</div>

## 📖 Sobre o Projeto

O **Valoriza Vilhena** é uma plataforma gamificada que promove a exploração cultural, histórica e gastronômica da cidade de Vilhena-RO. Através de QR Codes espalhados pela cidade, os usuários podem fazer check-ins, acumular pontos e resgatar prêmios, incentivando o turismo local e o conhecimento da história da região.

### 🎯 Objetivo Principal
Transformar a descoberta cultural em uma experiência divertida e recompensadora, conectando moradores e visitantes com os pontos turísticos, estabelecimentos locais e eventos culturais de Vilhena.

## ✨ Funcionalidades

### 🏆 Sistema de Gamificação
- 📷 **Leitura de QR Codes** para check-ins em locais cadastrados
- 🎖️ **Sistema de pontos** baseado na exploração de diferentes locais
- 🏅 **Ranking de usuários** para estimular a competição saudável
- 🎁 **Catálogo de prêmios** resgatáveis com pontos acumulados

### 🗺️ Exploração Interativa
- 📍 **Mapa interativo** com locais turísticos, gastronômicos e culturais
- 📱 **Interface responsiva** para navegação em PC e mobile
- 🧭 **Geolocalização** para facilitar a descoberta de locais próximos
- 📖 **Histórias e informações** detalhadas sobre cada local

### 👥 Recursos Sociais e Comerciais
- 🧑‍💼 **Área para comerciantes** cadastrarem seus estabelecimentos
- 🗓️ **Agenda de eventos** culturais da cidade
- 💬 **Feed social** para compartilhar experiências
- ⭐ **Sistema de avaliações** dos locais visitados

### 🔐 Autenticação
- 📧 Login com e-mail
- 🔗 Integração com Google
- 📱 Verificação por SMS (simulado para MVP)

## 🛠️ Stack Tecnológica

### Frontend
- **Framework:** Next.js 14+
- **Styling:** Tailwind CSS + ShadCN/UI
- **QR Scanner:** @yudiel/react-qr-scanner
- **Mapas:** Leaflet
- **Gerenciamento de Estado:** React Context/Hooks

### Backend
- **CMS:** Strapi v4
- **Banco de Dados:** SQLite (desenvolvimento)
- **Autenticação:** Strapi Users & Permissions
- **API:** REST

### DevOps & Deploy
- **Gerenciador de Pacotes:** pnpm
- **Frontend:** Cloudflare Pages
- **Backend:** Digital Ocean
- **Monorepo:** Estrutura organizada com frontend e backend

## 🧩 Dependências

### Frontend
- **Componentes UI:** Shadcn/UI
- **Biblioteca de ícones:** Lucide React
- **QR Code Scanner:** @yudiel/react-qr-scanner


## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- pnpm

### Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]
cd vv-hackathon

# Instale as dependências do backend
cd backend
pnpm install

# Instale as dependências do frontend
cd ../frontend
pnpm install
```

### Executando o Projeto

```bash
# Terminal 1 - Backend (Strapi)
cd backend
pnpm develop

# Terminal 2 - Frontend (Next.js)
cd frontend
pnpm dev
```

- **Frontend:** http://localhost:3000
- **Backend/Admin:** http://localhost:1337/admin

## 📊 Estrutura do Projeto

```
vv-hackathon/
├── frontend/          # Aplicação Next.js
│   ├── src/app/       # Pages e layouts
│   ├── src/components/# Componentes React
│   └── src/lib/       # Utilitários e auth
├── backend/           # CMS Strapi
│   ├── src/api/       # Content Types e Controllers
│   ├── config/        # Configurações do Strapi
│   └── database/      # Migrations e dados
└── README.md
```

## 📋 Coleções do CMS (Strapi)

| Coleção | Descrição | Campos Principais |
|---------|-----------|-------------------|
| **Local** | Pontos turísticos e estabelecimentos | nome, descrição, coordenadas, QR code, pontos |
| **Premio** | Recompensas disponíveis | título, descrição, custo_pontos, imagem |
| **Evento** | Eventos culturais da cidade | nome, data, local, pontos_checkin |
| **Avaliacao** | Reviews dos usuários | nota, comentário, local, usuário |
| **Usuario** | Perfis dos usuários | nome, email, pontos_totais, nivel |

## 🎮 MVP - Funcionalidades Implementadas

- ✅ Interface web responsiva
- ✅ Sistema de autenticação básico
- ✅ Leitura de QR Codes via browser
- ✅ Cadastro de locais via CMS
- ✅ Sistema de pontuação
- ✅ Layout moderno com Tailwind CSS
- ✅ Estrutura de API REST funcional

## 🔮 Próximos Passos

- [ ] Implementar sistema de ranking
- [ ] Adicionar geolocalização avançada
- [ ] Criar feed social completo
- [ ] Implementar notificações push
- [ ] Sistema de badges e conquistas
- [ ] Integração com redes sociais
- [ ] Dashboard analytics para comerciantes

## 👥 Equipe

Projeto desenvolvido para o **Hubee Hackathon** - Inovação e Tecnologia para Rondônia.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  <p>Feito com ❤️ para valorizar nossa Vilhena</p>
</div>
