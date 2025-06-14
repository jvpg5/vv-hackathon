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
      throw new Error(`HTTP error! status: ${response.status}`);
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
    return apiRequest('/users/me');
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
    // Esta função precisará ser implementada no backend
    return apiRequest('/users/add-points', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        points,
      }),
    });
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
      return await this.checkIn(validation.local.documentId, userId);
    } catch (error) {
      throw error;
    }
  },

  // Obter ranking de usuários
  async getRanking(limit = 10) {
    return apiRequest(`/users?sort=pontos_totais:desc&pagination[limit]=${limit}`);
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

// Exportar função auxiliar
export { getStrapiImageUrl };
