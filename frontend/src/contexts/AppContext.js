'use client';

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService, localsService } from '@/lib/api';

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
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
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
      
      return response;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: actionTypes.LOGOUT });
  }, []);

  const addPoints = useCallback((points) => {
    dispatch({ type: actionTypes.ADD_POINTS, payload: points });
  }, []);

  const addVisitedLocal = useCallback((local) => {
    dispatch({ type: actionTypes.ADD_VISITED_LOCAL, payload: local });
  }, []);

  const checkIn = useCallback(async (localId) => {
    try {
      if (!state.user) {
        //TODO: Implementar mostrar um toast que o usuário precisa estar logado
        console.log('Usuário não está logado.');
      }
      const local = await localsService.getById(localId); //Pegar local
      // Verificar se já visitou este local
      const alreadyVisited = state.visitedLocals.some(local => local.id === localId);
      if (alreadyVisited) {
        //TODO: Implementar mostrar um toast que já foi visitado
        console.warn('Você já visitou este local.');
      }

      // Aqui você implementaria a lógica de check-in com a API
      // const response = await usersService.checkIn(localId, state.user.id);
      
      // Por enquanto, vamos simular
      console.log(local);
      const pointsEarned = local.data.pontuacao; // Pontos fixos por check-in
      addPoints(pointsEarned);
      addVisitedLocal({ id: localId, visitedAt: new Date() });
      
      return { pointsEarned };
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [state.user, state.visitedLocals, addPoints, addVisitedLocal]);

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
