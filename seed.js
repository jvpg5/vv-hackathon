#!/usr/bin/env node

import axios from 'axios';
import { faker } from '@faker-js/faker';

// Configure faker to use Portuguese locale for better Brazilian content
// In newer versions of faker, we use the constructor or direct imports

const API_BASE_URL = 'http://localhost:1337/api';
const ADMIN_API_URL = 'http://localhost:1337/admin';

// Default admin credentials for seeding
const ADMIN_CREDENTIALS = {
  email: 'admin@valorizavilhena.com',
  password: 'AdminVV2025!'
};

class SeedDatabase {
  constructor() {
    this.adminToken = null;
    this.userTokens = [];
    this.createdData = {
      users: [],
      locals: [],
      premios: []
    };
  }

  async init() {
    console.log('🌱 Iniciando processo de seed do banco de dados...\n');
    
    try {
      await this.authenticateAdmin();
      await this.seedUsers();
      await this.seedLocals();
      await this.seedPremios();
      
      console.log('\n✅ Seed concluído com sucesso!');
      this.printSummary();
    } catch (error) {
      console.error('❌ Erro durante o seed:', error.message);
      if (error.response?.data) {
        console.error('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
      }
      process.exit(1);
    }
  }

  async authenticateAdmin() {
    console.log('🔑 Autenticando como administrador...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/local`, {
        identifier: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password
      });
      
      this.adminToken = response.data.jwt;
      console.log('✅ Autenticação de admin realizada com sucesso');
    } catch (error) {
      console.log('⚠️  Admin não encontrado, tentando criar...');
      
      // Try to create admin user
      try {
        const createResponse = await axios.post(`${API_BASE_URL}/auth/local/register`, {
          username: 'admin',
          email: ADMIN_CREDENTIALS.email,
          password: ADMIN_CREDENTIALS.password
        });
        
        console.log('👤 Usuário admin criado, agora tentando autenticar...');
        
        // Try to authenticate again
        const authResponse = await axios.post(`${API_BASE_URL}/auth/local`, {
          identifier: ADMIN_CREDENTIALS.email,
          password: ADMIN_CREDENTIALS.password
        });
        
        this.adminToken = authResponse.data.jwt;
        console.log('✅ Admin criado e autenticado com sucesso');
        console.log('⚠️  IMPORTANTE: O usuário criado tem role "Authenticated". Para criar conteúdo, você precisa:');
        console.log('   1. Acessar http://localhost:1337/admin');
        console.log('   2. Ir em Settings > Roles > Authenticated');
        console.log('   3. Dar permissão de CREATE para Local e Premio');
        console.log('   4. Ou rodar este seed como um usuário que já tem essas permissões');
      } catch (createError) {
        console.error('Detalhes do erro de criação:', createError.response?.data || createError.message);
        throw new Error(`Não foi possível criar ou autenticar admin: ${createError.message}`);
      }
    }
  }

  async seedUsers() {
    console.log('\n👥 Criando usuários de teste...');
    
    const users = [
      {
        username: 'joao.silva',
        email: 'joao.silva@email.com',
        password: 'senha123'
      },
      {
        username: 'maria.santos',
        email: 'maria.santos@email.com',
        password: 'senha123'
      },
      {
        username: 'pedro.oliveira',
        email: 'pedro.oliveira@email.com',
        password: 'senha123'
      },
      {
        username: 'ana.costa',
        email: 'ana.costa@email.com',
        password: 'senha123'
      },
      {
        username: 'carlos.ferreira',
        email: 'carlos.ferreira@email.com',
        password: 'senha123'
      }
    ];

    for (const userData of users) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/local/register`, userData);
        this.createdData.users.push(response.data.user);
        this.userTokens.push(response.data.jwt);
        console.log(`✅ Usuário criado: ${userData.username}`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('Email')) {
          console.log(`⚠️  Usuário ${userData.username} já existe, pulando...`);
        } else {
          console.error(`❌ Erro ao criar usuário ${userData.username}:`, error.response?.data || error.message);
        }
      }
    }
  }

  async seedLocals() {
    console.log('\n📍 Criando locais turísticos de Vilhena...');
    
    const locals = [
      {
        nome: 'Parque Ecológico de Vilhena',
        categoria: 'turismo',
        descricao_curta: 'Área verde preservada no coração da cidade',
        descricao_longa: 'O Parque Ecológico de Vilhena é um refúgio natural que oferece trilhas, lago artificial e área de lazer para toda a família. Com mais de 50 hectares de área preservada, é o local perfeito para relaxar e se conectar com a natureza.',
        qr_code_id: 'QR_PARQUE_ECOLOGICO_001',
        pontuacao: 50
      },
      {
        nome: 'Centro Cultural José de Alencar',
        categoria: 'cultura',
        descricao_curta: 'Principal centro cultural da cidade',
        descricao_longa: 'O Centro Cultural José de Alencar é o epicentro das atividades culturais de Vilhena, oferecendo exposições, teatro, biblioteca e oficinas. Um espaço dedicado à preservação e promoção da cultura local e regional.',
        qr_code_id: 'QR_CENTRO_CULTURAL_002',
        pontuacao: 75
      },
      {
        nome: 'Mercado Municipal',
        categoria: 'gastronomia',
        descricao_curta: 'Sabores tradicionais de Rondônia',
        descricao_longa: 'O Mercado Municipal de Vilhena reúne o melhor da gastronomia regional. Encontre produtos locais, pratos típicos como pacu assado e farofa de banana, além de frutas exóticas da Amazônia.',
        qr_code_id: 'QR_MERCADO_MUNICIPAL_003',
        pontuacao: 40
      },
      {
        nome: 'Museu do Pioneiro',
        categoria: 'historia',
        descricao_curta: 'História da colonização de Vilhena',
        descricao_longa: 'O Museu do Pioneiro conta a fascinante história da colonização de Vilhena e região. Através de objetos, fotografias e documentos históricos, você conhecerá como se deu a formação desta importante cidade de Rondônia.',
        qr_code_id: 'QR_MUSEU_PIONEIRO_004',
        pontuacao: 80
      },
      {
        nome: 'Plaza Shopping Vilhena',
        categoria: 'outro',
        descricao_curta: 'Principal centro comercial da cidade',
        descricao_longa: 'O Plaza Shopping Vilhena é o maior centro comercial da região, oferecendo lojas, restaurantes, cinema e praça de alimentação. Um local moderno para compras e entretenimento.',
        qr_code_id: 'QR_PLAZA_SHOPPING_005',
        pontuacao: 30
      },
      {
        nome: 'Igreja Matriz São José',
        categoria: 'cultura',
        descricao_curta: 'Principal templo católico da cidade',
        descricao_longa: 'A Igreja Matriz São José é um marco arquitetônico e religioso de Vilhena. Com sua bela arquitetura e importância histórica, representa a fé e tradição da comunidade católica local.',
        qr_code_id: 'QR_IGREJA_MATRIZ_006',
        pontuacao: 45
      },
      {
        nome: 'Estádio Portal da Amazônia',
        categoria: 'evento',
        descricao_curta: 'Casa do futebol vilhenense',
        descricao_longa: 'O Estádio Portal da Amazônia é o principal palco esportivo de Vilhena, recebendo jogos do campeonato estadual e eventos esportivos da região. Um local de paixão e tradição esportiva.',
        qr_code_id: 'QR_ESTADIO_PORTAL_007',
        pontuacao: 35
      },
      {
        nome: 'Restaurante Sabor da Terra',
        categoria: 'gastronomia',
        descricao_curta: 'Culinária típica amazônica',
        descricao_longa: 'O Restaurante Sabor da Terra é famoso por seus pratos típicos da região amazônica. Experimente o tambaqui na brasa, o pirarucu de casaca e outras delícias da culinária local em um ambiente acolhedor.',
        qr_code_id: 'QR_SABOR_TERRA_008',
        pontuacao: 60
      },
      {
        nome: 'Ponte sobre o Rio Pimenta Bueno',
        categoria: 'turismo',
        descricao_curta: 'Marco paisagístico da cidade',
        descricao_longa: 'A Ponte sobre o Rio Pimenta Bueno oferece uma vista panorâmica deslumbrante. É um local perfeito para contemplar o pôr do sol e apreciar a beleza natural que cerca Vilhena.',
        qr_code_id: 'QR_PONTE_RIO_009',
        pontuacao: 55
      },
      {
        nome: 'Centro de Convenções',
        categoria: 'evento',
        descricao_curta: 'Espaço para grandes eventos',
        descricao_longa: 'O Centro de Convenções de Vilhena é o local ideal para conferências, feiras, shows e grandes eventos. Com infraestrutura moderna e capacidade para milhares de pessoas.',
        qr_code_id: 'QR_CENTRO_CONVENCOES_010',
        pontuacao: 40
      }
    ];

    for (const localData of locals) {
      try {
        // First try with admin token
        let response;
        try {
          response = await axios.post(
            `${API_BASE_URL}/locals`,
            { data: localData },
            {
              headers: {
                'Authorization': `Bearer ${this.adminToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (authError) {
          if (authError.response?.status === 403) {
            console.log(`⚠️  Tentando criar ${localData.nome} sem autenticação...`);
            // Try without authentication (public access)
            response = await axios.post(
              `${API_BASE_URL}/locals`,
              { data: localData },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          } else {
            throw authError;
          }
        }
        
        this.createdData.locals.push(response.data.data);
        console.log(`✅ Local criado: ${localData.nome}`);
      } catch (error) {
        console.error(`❌ Erro ao criar local ${localData.nome}:`, error.response?.data || error.message);
      }
    }
  }

  async seedPremios() {
    console.log('\n🎁 Criando prêmios disponíveis...');
    
    const premios = [
      {
        nome: 'Desconto 20% - Restaurante Sabor da Terra',
        descricao: 'Ganhe 20% de desconto em qualquer prato do cardápio no Restaurante Sabor da Terra. Válido para almoço e jantar.',
        pontos_necessarios: 100
      },
      {
        nome: 'Ingresso Grátis - Cinema Plaza Shopping',
        descricao: 'Um ingresso gratuito para qualquer sessão de cinema no Plaza Shopping Vilhena. Válido de segunda a quinta-feira.',
        pontos_necessarios: 150
      },
      {
        nome: 'Tour Guiado - Museu do Pioneiro',
        descricao: 'Tour guiado especial no Museu do Pioneiro com acesso a áreas exclusivas e material didático complementar.',
        pontos_necessarios: 80
      },
      {
        nome: 'Camiseta Oficial - Valoriza Vilhena',
        descricao: 'Camiseta oficial do projeto Valoriza Vilhena em algodão premium. Disponível nos tamanhos P, M, G e GG.',
        pontos_necessarios: 200
      },
      {
        nome: 'Desconto 30% - Produtos Locais no Mercado',
        descricao: 'Desconto de 30% em produtos regionais selecionados no Mercado Municipal. Inclui frutas, doces e artesanatos.',
        pontos_necessarios: 120
      },
      {
        nome: 'Passeio de Barco - Rio Pimenta Bueno',
        descricao: 'Passeio de barco pelo Rio Pimenta Bueno com duração de 2 horas, incluindo lanche e guia turístico.',
        pontos_necessarios: 300
      },
      {
        nome: 'Kit Degustação - Doces Regionais',
        descricao: 'Kit com 6 doces típicos da região: cocada de cupuaçu, rapadura de caju, bombom de castanha e outros sabores únicos.',
        pontos_necessarios: 90
      },
      {
        nome: 'Voucher SPA - Hotel Portal',
        descricao: 'Day use completo no SPA do Hotel Portal, incluindo massagem relaxante, sauna e piscina. Válido por 6 meses.',
        pontos_necessarios: 500
      },
      {
        nome: 'Aula de Culinária Regional',
        descricao: 'Aprenda a preparar pratos típicos de Rondônia em uma aula especial com chef local. Inclui degustação e receitas.',
        pontos_necessarios: 250
      },
      {
        nome: 'Caneca Térmica - Valoriza Vilhena',
        descricao: 'Caneca térmica oficial do projeto com capacidade para 400ml. Ideal para manter suas bebidas na temperatura perfeita.',
        pontos_necessarios: 60
      }
    ];

    for (const premioData of premios) {
      try {
        // First try with admin token
        let response;
        try {
          response = await axios.post(
            `${API_BASE_URL}/premios`,
            { data: premioData },
            {
              headers: {
                'Authorization': `Bearer ${this.adminToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (authError) {
          if (authError.response?.status === 403) {
            console.log(`⚠️  Tentando criar ${premioData.nome} sem autenticação...`);
            // Try without authentication (public access)
            response = await axios.post(
              `${API_BASE_URL}/premios`,
              { data: premioData },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          } else {
            throw authError;
          }
        }
        
        this.createdData.premios.push(response.data.data);
        console.log(`✅ Prêmio criado: ${premioData.nome}`);
      } catch (error) {
        console.error(`❌ Erro ao criar prêmio ${premioData.nome}:`, error.response?.data || error.message);
      }
    }
  }

  printSummary() {
    console.log('\n📊 RESUMO DO SEED:');
    console.log('==================');
    console.log(`👥 Usuários criados: ${this.createdData.users.length}`);
    console.log(`📍 Locais criados: ${this.createdData.locals.length}`);
    console.log(`🎁 Prêmios criados: ${this.createdData.premios.length}`);
    
    if (this.createdData.locals.length === 0 || this.createdData.premios.length === 0) {
      console.log('\n⚠️  PROBLEMAS DE PERMISSÃO DETECTADOS:');
      console.log('=====================================');
      console.log('Se locais e prêmios não foram criados, é necessário configurar permissões:');
      console.log('1. Acesse: http://localhost:1337/admin');
      console.log('2. Vá em Settings > Users & Permissions Plugin > Roles');
      console.log('3. Clique em "Authenticated"');
      console.log('4. Em "Permissions", expanda "Local" e "Premio"');
      console.log('5. Marque as opções: create, find, findOne');
      console.log('6. Clique em "Save"');
      console.log('7. Execute o seed novamente: pnpm seed');
    }
    
    console.log('\n🔗 LINKS ÚTEIS:');
    console.log('===============');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('⚙️  Admin Strapi: http://localhost:1337/admin');
    console.log('📡 API Docs: http://localhost:1337/documentation');
    console.log('\n🔑 CREDENCIAIS DE TESTE:');
    console.log('========================');
    console.log('Admin:');
    console.log(`  Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`  Senha: ${ADMIN_CREDENTIALS.password}`);
    console.log('\nUsuários de teste:');
    console.log('  Email: joao.silva@email.com | Senha: senha123');
    console.log('  Email: maria.santos@email.com | Senha: senha123');
    console.log('  Email: pedro.oliveira@email.com | Senha: senha123');
    console.log('  Email: ana.costa@email.com | Senha: senha123');
    console.log('  Email: carlos.ferreira@email.com | Senha: senha123');
  }

  async clearDatabase() {
    console.log('🗑️  Limpando banco de dados...');
    
    try {
      await this.authenticateAdmin();
      
      // Clear locals
      const localsResponse = await axios.get(`${API_BASE_URL}/locals`, {
        headers: { 'Authorization': `Bearer ${this.adminToken}` }
      });
      
      for (const local of localsResponse.data.data) {
        await axios.delete(`${API_BASE_URL}/locals/${local.documentId}`, {
          headers: { 'Authorization': `Bearer ${this.adminToken}` }
        });
      }
      console.log(`✅ ${localsResponse.data.data.length} locais removidos`);
      
      // Clear premios
      const premiosResponse = await axios.get(`${API_BASE_URL}/premios`, {
        headers: { 'Authorization': `Bearer ${this.adminToken}` }
      });
      
      for (const premio of premiosResponse.data.data) {
        await axios.delete(`${API_BASE_URL}/premios/${premio.documentId}`, {
          headers: { 'Authorization': `Bearer ${this.adminToken}` }
        });
      }
      console.log(`✅ ${premiosResponse.data.data.length} prêmios removidos`);
      
     
      
      // Clear users (except admin)
      try {
        const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
          headers: { 'Authorization': `Bearer ${this.adminToken}` }
        });
        
        let removedUsersCount = 0;
        for (const user of usersResponse.data) {
          // Don't delete admin user
          if (user.email !== ADMIN_CREDENTIALS.email) {
            try {
              await axios.delete(`${API_BASE_URL}/users/${user.id}`, {
                headers: { 'Authorization': `Bearer ${this.adminToken}` }
              });
              removedUsersCount++;
            } catch (userError) {
              console.log(`⚠️  Não foi possível remover usuário ${user.username}: ${userError.message}`);
            }
          }
        }
        console.log(`✅ ${removedUsersCount} usuários removidos (admin preservado)`);
      } catch (usersError) {
        console.log('⚠️  Não foi possível limpar usuários:', usersError.message);
      }
      
      console.log('✅ Banco de dados limpo com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao limpar banco:', error.message);
    }
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');

const seeder = new SeedDatabase();

if (shouldClear) {
  seeder.clearDatabase();
} else {
  seeder.init();
}
