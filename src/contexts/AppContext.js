'use client';

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { authService, localsService, usersService, dailyMissionsService } from '@/lib/api';

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  points: 0,
  visitedLocals: [],
  error: null,
};

// Actions
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  ADD_POINTS: 'ADD_POINTS',
  ADD_VISITED_LOCAL: 'ADD_VISITED_LOCAL',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        points: action.payload?.pontos_totais || 0,
      };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        points: 0,
        visitedLocals: [],
      };

    case actionTypes.ADD_POINTS:
      return {
        ...state,
        points: state.points + action.payload,
        user: state.user ? {
          ...state.user,
          pontos_totais: (state.user.pontos_totais || 0) + action.payload,
        } : null,
      };

    case actionTypes.ADD_VISITED_LOCAL:
      return {
        ...state,
        visitedLocals: [...state.visitedLocals, action.payload],
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Verificar autenticação no carregamento inicial
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getMe();
          dispatch({ type: actionTypes.SET_USER, payload: user });
        } else {
          dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        authService.logout();
        dispatch({ type: actionTypes.LOGOUT });
      }
    };

    checkAuth();
  }, []);

  // Actions usando useCallback para estabilizar referências
  const login = useCallback(async (identifier, password) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });
      
      const response = await authService.login(identifier, password);
      dispatch({ type: actionTypes.SET_USER, payload: response.user });
      
      toast.success(`Bem-vindo de volta, ${response.user.username}!`);
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });
      
      const response = await authService.register(username, email, password);
      dispatch({ type: actionTypes.SET_USER, payload: response.user });
      
      toast.success(`Conta criada com sucesso! Bem-vindo, ${username}!`);
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      toast.error('Erro ao criar conta. Tente novamente.');
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: actionTypes.LOGOUT });
    toast.info('Você foi desconectado. Até a próxima!');
  }, []);

  const addPoints = useCallback(async (points) => {
    try {
      if (!state.user) {
        throw new Error('Usuário não está logado');
      }

      // Fazer requisição para adicionar pontos no backend
      await usersService.addPoints(state.user.id, points);
      
      // Atualizar estado local
      dispatch({ type: actionTypes.ADD_POINTS, payload: points });
      
      // Opcionalmente, buscar dados atualizados do usuário
      const updatedUser = await authService.getMe();
      dispatch({ type: actionTypes.SET_USER, payload: updatedUser });
      
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [state.user]);

  const addVisitedLocal = useCallback((local) => {
    dispatch({ type: actionTypes.ADD_VISITED_LOCAL, payload: local });
  }, []);

  const checkIn = useCallback(async (localId) => {
    try {
      if (!state.user) {
        toast.error('Você precisa estar logado para fazer check-in');
        return;
      }
      
      const [local, user] = await Promise.all([
        localsService.getById(localId),
        authService.getMe()
      ]);

      // Verificar se já visitou este local hoje
      const alreadyVisited = user.daily_locals_scanned?.some(
        (visited) => visited.id === local.data.id
      );
      
      if (alreadyVisited) {
        toast.warning('Você já visitou este local hoje');
        return { pointsEarned: 0 };
      }

      // Fazer requisição para adicionar o local à relação daily_locals_scanned do usuário
      // Usando connect para adicionar uma nova relação sem sobrescrever as existentes
      await usersService.updateProfile(state.user.id, {
        daily_locals_scanned: {
          connect: [local.data.id]
        }
      });
      
      const pointsEarned = local.data.pontuacao || 10;
      await addPoints(pointsEarned);
      addVisitedLocal({ id: localId, visitedAt: new Date() });
      
      // Verificar e completar missões diárias
      let missionPointsEarned = 0;
      try {
        const missionsProgress = await dailyMissionsService.getUserProgress(user.id);
        const availableMissions = missionsProgress.available || [];
        
        // Preparar contexto para verificação de missões
        const currentDailyCount = (user.daily_locals_scanned?.length || 0) + 1; // +1 porque acabamos de adicionar
        const isNewPlace = !user.daily_locals_scanned?.some(visited => visited.id === local.data.id);
        
        const missionContext = {
          newPlaceVisited: isNewPlace,
          localCategory: local.data.categoria,
          daily_places_scanned: currentDailyCount,
          currentLocal: local.data
        };
        
        // Verificar cada missão disponível
        for (const mission of availableMissions) {
          const canComplete = await dailyMissionsService.canCompleteMission(
            mission.documentId || mission.id,
            user.id,
            missionContext
          );
          
          if (canComplete.canComplete) {
            try {
              // Completar a missão
              await dailyMissionsService.completeMission(mission.documentId || mission.id, user.id);
              
              // Adicionar pontos da missão
              const missionPoints = mission.pontos || 0;
              if (missionPoints > 0) {
                await addPoints(missionPoints);
                missionPointsEarned += missionPoints;
              }
              
              toast.success(`Missão completada: ${mission.nome}! +${missionPoints} pontos!`);
            } catch (missionError) {
              console.error('Erro ao completar missão:', missionError);
              // Não interromper o fluxo principal se houver erro na missão
            }
          }
        }
      } catch (missionError) {
        console.error('Erro ao verificar missões:', missionError);
        // Não interromper o fluxo principal se houver erro nas missões
      }
      
      const totalPoints = pointsEarned + missionPointsEarned;
      const successMessage = missionPointsEarned > 0 
        ? `Check-in realizado! Você ganhou ${pointsEarned} pontos + ${missionPointsEarned} pontos de missões!`
        : `Check-in realizado! Você ganhou ${pointsEarned} pontos!`;
        
      toast.success(successMessage);
      
      return { pointsEarned: totalPoints };
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      toast.error('Erro ao realizar check-in. Tente novamente.');
      throw error;
    }
  }, [state.user, addPoints, addVisitedLocal]);

  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: actionTypes.SET_USER, payload: userData });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    addPoints,
    addVisitedLocal,
    checkIn,
    clearError,
    updateUser,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook para usar o contexto
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}

export default AppContext;
