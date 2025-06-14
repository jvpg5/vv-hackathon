# 🌱 Seed Database - Valoriza Vilhena

Este script popula o banco de dados com dados de teste para o projeto Valoriza Vilhena.

## 📋 Pré-requisitos

1. **Backend Strapi rodando**: Certifique-se de que o backend esteja executando em `http://localhost:1337`
2. **Dependências instaladas**: Execute `pnpm install` na raiz do projeto

## 🚀 Como usar

### Executar o seed completo
```bash
# Na raiz do projeto (vv-hackathon/)
pnpm seed
```

### Limpar banco de dados
```bash
# Remove todos os dados criados pelo seed
pnpm run seed:clear
```

## 📊 Dados criados

O script cria:

### 👥 Usuários (5)
- João Silva (joao.silva@email.com)
- Maria Santos (maria.santos@email.com) 
- Pedro Oliveira (pedro.oliveira@email.com)
- Ana Costa (ana.costa@email.com)
- Carlos Ferreira (carlos.ferreira@email.com)

**Senha padrão**: `senha123`

### 📍 Locais (10)
- Parque Ecológico de Vilhena
- Centro Cultural José de Alencar
- Mercado Municipal
- Museu do Pioneiro
- Plaza Shopping Vilhena
- Igreja Matriz São José
- Estádio Portal da Amazônia
- Restaurante Sabor da Terra
- Ponte sobre o Rio Pimenta Bueno
- Centro de Convenções

### 🎁 Prêmios (10)
- Descontos em restaurantes
- Ingressos de cinema
- Tours guiados
- Produtos oficiais
- Experiências gastronômicas
- E muito mais!

## 🔑 Credenciais de Admin

- **Email**: admin@valorizavilhena.com
- **Senha**: AdminVV2025!

## 🐛 Solução de problemas

### Permissões (Erro 403 Forbidden)
Se você ver erros 403 ao criar locais e prêmios:

1. **Acesse o admin Strapi**: http://localhost:1337/admin
2. **Vá para Settings > Users & Permissions Plugin > Roles**
3. **Clique em "Authenticated"**
4. **Em "Permissions"**:
   - Expanda **"Local"** e marque: `create`, `find`, `findOne`
   - Expanda **"Premio"** e marque: `create`, `find`, `findOne`
5. **Clique em "Save"**
6. **Execute o seed novamente**: `pnpm seed`

### Outros problemas
1. **Erro de conexão**: Verifique se o backend está rodando na porta 1337
2. **Erro de autenticação**: O script criará automaticamente o usuário admin se não existir
3. **Dados duplicados**: Execute `pnpm run seed:clear` antes de rodar o seed novamente
4. **Erro de categoria**: As categorias válidas são: `cultura`, `gastronomia`, `historia`, `evento`, `turismo`, `outro`

## 📝 Estrutura dos dados

### Local
```json
{
  "nome": "string",
  "categoria": "turistico|cultural|gastronomico|historico|comercial|religioso|esportivo|eventos",
  "descricao_curta": "string",
  "descricao_longa": "string", 
  "qr_code_id": "string",
  "pontuacao": "number"
}
```

### Premio
```json
{
  "nome": "string",
  "descricao": "string",
  "pontos_necessarios": "number"
}
```

---

**Feito com ❤️ para valorizar nossa Vilhena**
