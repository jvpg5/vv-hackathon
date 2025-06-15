// Configuração da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Função auxiliar para fazer requisições à API
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Adicionar token de autenticação se existir
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
      return;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * Função para construir URL completa de imagens do Strapi
 */
function getStrapiImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${STRAPI_URL}${imageUrl}`;
}

// Serviços para Locais
export const localsService = {
  // Buscar todos os locais
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/locals${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Buscar local por ID
  async getById(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/locals/${id}${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Buscar local por QR Code
  async getByQrCode(qrCodeId) {
    const params = {
      'filters[qr_code_id][$eq]': qrCodeId,
      'populate': '*'
    };
    return this.getAll(params);
  },

  // Validar QR Code e retornar informações do local
  async validateQrCode(qrCodeId) {
    try {
      const response = await this.getByQrCode(qrCodeId);
      
      if (response.data && response.data.length > 0) {
        return {
          valid: true,
          local: response.data[0],
          message: 'QR Code válido'
        };
      } else {
        return {
          valid: false,
          local: null,
          message: 'QR Code não encontrado no sistema'
        };
      }
    } catch (error) {
      return {
        valid: false,
        local: null,
        message: 'Erro ao validar QR Code'
      };
    }
  },

  // Criar novo local (admin)
  async create(data) {
    return apiRequest('/locals', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  // Atualizar local (admin)
  async update(id, data) {
    return apiRequest(`/locals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  },

  // Deletar local (admin)
  async delete(id) {
    return apiRequest(`/locals/${id}`, {
      method: 'DELETE',
    });
  },
};

// Serviços para Prêmios
export const premiosService = {
  // Buscar todos os prêmios
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/premios${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Buscar prêmio por ID
  async getById(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/premios/${id}${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Resgatar prêmio
  async redeem(premioId, userId) {
    // Esta função precisará ser implementada no backend
    return apiRequest('/premios/redeem', {
      method: 'POST',
      body: JSON.stringify({ 
        premioId, 
        userId 
      }),
    });
  },
};

// Serviços de Autenticação
export const authService = {
  // Login
  async login(identifier, password) {
    const response = await apiRequest('/auth/local', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    if (response.jwt) {
      localStorage.setItem('token', response.jwt);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  // Registro
  async register(username, email, password) {
    const response = await apiRequest('/auth/local/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    if (response.jwt) {
      localStorage.setItem('token', response.jwt);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar se está autenticado
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  // Obter usuário atual
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Obter informações do usuário autenticado
  async getMe() {
    return apiRequest('/users/me?populate=*');
  },
};

// Serviços para Usuários
export const usersService = {
  // Atualizar perfil do usuário
  async updateProfile(userId, data) {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Adicionar pontos ao usuário
  async addPoints(userId, points) {
    try {
      // Primeiro, buscar os pontos atuais do usuário
      const currentUser = await apiRequest(`/users/${userId}`);
      const currentPoints = currentUser.pontos_totais || 0;
      
      // Calcular nova pontuação
      const newTotalPoints = currentPoints + points;
      
      // Atualizar o usuário com a nova pontuação
      return apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          pontos: newTotalPoints,
        }),
      });
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      throw error;
    }
  },

  // Fazer check-in em um local
  async checkIn(localId, userId) {
    // Esta função precisará ser implementada no backend
    return apiRequest('/users/checkin', {
      method: 'POST',
      body: JSON.stringify({
        localId,
        userId,
      }),
    });
  },

  // Fazer check-in em um local com QR Code
  async checkInWithQrCode(qrCodeId, userId) {
    try {
      // Primeiro valida o QR Code
      const validation = await localsService.validateQrCode(qrCodeId);
      
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Se válido, faz o check-in
      const checkInResult = await this.checkIn(validation.local.documentId, userId);

      // Verificar missões que podem ser completadas com este check-in
      const missionContext = {
        localCategory: validation.local.categoria,
        newPlaceVisited: checkInResult.newPlace, // Assumindo que o backend retorna isso
      };

      // Buscar missões disponíveis e verificar quais podem ser completadas
      const availableMissions = await dailyMissionsService.getAvailableMissions(userId);
      const completableMissions = [];

      for (const mission of availableMissions.data || []) {
        const canComplete = await dailyMissionsService.canCompleteMission(
          mission.documentId, 
          userId, 
          missionContext
        );
        
        if (canComplete.canComplete) {
          completableMissions.push(mission);
        }
      }

      return {
        ...checkInResult,
        completableMissions,
        local: validation.local
      };
    } catch (error) {
      throw error;
    }
  },

  // Completar missão e adicionar pontos
  async completeMissionAndAddPoints(missionId, userId) {
    try {
      // Buscar informações da missão
      const mission = await dailyMissionsService.getById(missionId);
      
      if (!mission.data) {
        throw new Error('Missão não encontrada');
      }

      // Completar a missão
      const completionResult = await dailyMissionsService.completeMission(missionId, userId);

      // Adicionar pontos ao usuário
      const points = mission.data.pontos || 0;
      if (points > 0) {
        await this.addPoints(userId, points);
      }

      return {
        ...completionResult,
        pointsEarned: points,
        mission: mission.data
      };
    } catch (error) {
      console.error('Erro ao completar missão:', error);
      throw error;
    }
  },

  // Obter ranking de usuários
  async getRanking(limit = 10) {
    return apiRequest(`/users?sort=pontos:desc&pagination[limit]=${limit}`);
  },
};

// Serviços para Upload de arquivos
export const uploadService = {
  // Upload de imagem
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('files', file);

    return apiRequest('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type para FormData
    });
  },
};

// Serviços para Daily Missions
export const dailyMissionsService = {
  // Buscar todas as missões diárias
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/daily-missions${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Buscar missão por ID
  async getById(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/daily-missions/${id}${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Buscar missões do usuário atual
  async getUserMissions(userId, params = {}) {
    const defaultParams = {
      'populate': '*',
      'filters[users_permissions_users][id][$eq]': userId,
      ...params
    };
    return this.getAll(defaultParams);
  },

  // Buscar missões disponíveis (não completadas pelo usuário)
  async getAvailableMissions(userId) {
    // Get all missions first, then filter on frontend
    const params = {
      'populate': '*'
    };
    return this.getAll(params);
  },

  // Completar uma missão
  async completeMission(missionId, userId) {
    // Usar update com connect para adicionar o usuário à relação users_permissions_users
    return apiRequest(`/daily-missions/${missionId}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          users_permissions_users: {
            connect: [userId]
          }
        }
      }),
    });
  },

  // Criar nova missão (admin)
  async create(data) {
    return apiRequest('/daily-missions', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  // Atualizar missão (admin)
  async update(id, data) {
    return apiRequest(`/daily-missions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  },

  // Deletar missão (admin)
  async delete(id) {
    return apiRequest(`/daily-missions/${id}`, {
      method: 'DELETE',
    });
  },

  // Verificar progresso das missões do usuário
  async getUserProgress(userId) {
    try {
      const [completedResponse, allMissionsResponse] = await Promise.all([
        this.getUserMissions(userId),
        this.getAll({ 'populate': '*' }) // Get all missions
      ]);

      const completedMissions = completedResponse.data || [];
      const allMissions = allMissionsResponse.data || [];
      
      // Get IDs of completed missions
      const completedMissionIds = completedMissions.map(mission => 
        mission.documentId || mission.id
      );
      
      // Filter available missions (not completed)
      const availableMissions = allMissions.filter(mission => 
        !completedMissionIds.includes(mission.documentId || mission.id)
      );

      const totalMissions = allMissions.length;

      return {
        completed: completedMissions,
        available: availableMissions,
        progress: {
          completed: completedMissions.length,
          total: totalMissions,
          percentage: totalMissions > 0 ? (completedMissions.length / totalMissions) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar progresso das missões:', error);
      // Return fallback data instead of throwing
      return {
        completed: [],
        available: [
          { id: 1, documentId: 'mock1', nome: "Visite 1 local novo", pontos: 20, rule: "visit_new_place" },
          { id: 2, documentId: 'mock2', nome: "Escaneie 5 locais", pontos: 50, rule: "daily_places_scanned>=5" },
          { id: 3, documentId: 'mock3', nome: "Faça check-in em gastronomia", pontos: 30, rule: "checkin_category_gastronomia" }
        ],
        progress: {
          completed: 0,
          total: 3,
          percentage: 0
        }
      };
    }
  },

  // Verificar se uma missão pode ser completada baseada na regra
  async canCompleteMission(missionId, userId, context = {}) {
    try {
      const mission = await this.getById(missionId, { populate: '*' });
      
      if (!mission.data) {
        return { canComplete: false, reason: 'Missão não encontrada' };
      }

      const rule = mission.data.rule;
      
      // Parse rule expressions with operators
      const parseRule = (rule) => {
        const operators = ['>=', '<=', '>', '<', '==', '='];
        for (const op of operators) {
          if (rule.includes(op)) {
            const [key, value] = rule.split(op);
            return {
              key: key.trim(),
              operator: op,
              value: parseFloat(value.trim()) || value.trim()
            };
          }
        }
        return { key: rule, operator: null, value: null };
      };

      const evaluateCondition = (contextValue, operator, targetValue) => {
        const numContextValue = parseFloat(contextValue) || 0;
        const numTargetValue = parseFloat(targetValue) || 0;
        
        switch (operator) {
          case '>=': return numContextValue >= numTargetValue;
          case '<=': return numContextValue <= numTargetValue;
          case '>': return numContextValue > numTargetValue;
          case '<': return numContextValue < numTargetValue;
          case '==':
          case '=': return contextValue == targetValue;
          default: return false;
        }
      };

      const parsedRule = parseRule(rule);
      
      // Handle different rule types
      switch (parsedRule.key) {
        case 'visit_new_place':
          return { canComplete: !!context.newPlaceVisited, reason: 'Visite um local novo' };
        
        case 'checkin_category_gastronomia':
          return { 
            canComplete: context.localCategory === 'gastronomia', 
            reason: 'Faça check-in em um local gastronômico' 
          };

        case 'daily_places_scanned':
          const scannedCount = context.daily_places_scanned || 0;
          const canComplete = evaluateCondition(scannedCount, parsedRule.operator, parsedRule.value);
          return {
            canComplete,
            reason: `Escaneie ${parsedRule.value} locais (${scannedCount}/${parsedRule.value})`
          };
        
        default:
          // For rules with operators but unknown keys
          if (parsedRule.operator && context[parsedRule.key] !== undefined) {
            const canComplete = evaluateCondition(context[parsedRule.key], parsedRule.operator, parsedRule.value);
            return {
              canComplete,
              reason: `${parsedRule.key} ${parsedRule.operator} ${parsedRule.value}`
            };
          }
          
          return { canComplete: true, reason: 'Missão disponível' };
      }
    } catch (error) {
      return { canComplete: false, reason: 'Erro ao verificar missão' };
    }
  }
};

// Exportar função auxiliar
export { getStrapiImageUrl };
