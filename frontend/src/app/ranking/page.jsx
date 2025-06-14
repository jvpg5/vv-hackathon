'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { usersService } from '@/lib/api';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Loading from '@/components/Loading';
import { 
  Trophy, 
  Medal,
  Award,
  Star,
  Users,
  ArrowLeft
} from 'lucide-react';

export default function RankingPage() {
  const { isAuthenticated, isLoading, user } = useApp();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar usuários
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await usersService.getRanking(50); // Buscar top 50 usuários
        setUsers(response || []);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        setError(error.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  // Função para obter o ícone do troféu baseado na posição
  const getTrophyIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-amber-600" size={24} />;
      default:
        return null;
    }
  };

  // Função para obter a cor do card baseado na posição
  const getCardStyle = (position) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  // Função para obter as iniciais do nome do usuário
  const getUserInitials = (username) => {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" text="Carregando ranking..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <Trophy className="text-yellow-300" size={28} />
            <h1 className="text-2xl font-bold">Ranking</h1>
          </div>
        </div>
        <p className="text-green-100">
          Veja quem está explorando mais Vilhena!
        </p>
      </div>

      <div className="p-6">
        {loadingUsers ? (
          <Loading text="Carregando ranking..." />
        ) : error ? (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">Erro ao carregar ranking</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">Nenhum usuário encontrado</p>
            <p className="text-sm text-gray-400">
              Seja o primeiro a explorar Vilhena!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Exploradores
              </h2>
              <div className="text-sm text-gray-500">
                {users.length} participantes
              </div>
            </div>

            {/* Lista de usuários */}
            {users.map((userItem, index) => {
              const position = index + 1;
              const isCurrentUser = user && userItem.id === user.id;
              
              return (
                <div
                  key={userItem.id}
                  className={`
                    ${getCardStyle(position)}
                    ${isCurrentUser ? 'ring-2 ring-green-500' : ''}
                    border rounded-lg p-4 transition-all duration-200 hover:shadow-md
                  `}
                >
                  <div className="flex items-center space-x-4">
                    {/* Posição e troféu */}
                    <div className="flex items-center space-x-2 min-w-[60px]">
                      <span className="text-lg font-bold text-gray-600">
                        #{position}
                      </span>
                      {getTrophyIcon(position)}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={userItem.avatar?.url} 
                        alt={userItem.username}
                      />
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                        {getUserInitials(userItem.username || 'U')}
                      </AvatarFallback>
                    </Avatar>

                    {/* Informações do usuário */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {userItem.username || 'Usuário Anônimo'}
                        </h3>
                        {isCurrentUser && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="text-yellow-500" size={16} />
                        <span className="text-lg font-bold text-gray-800">
                          {userItem.pontos || 0} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Informações adicionais */}
        {users.length > 0 && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="text-green-600" size={20} />
              <h3 className="font-semibold text-green-800">Como ganhar pontos</h3>
            </div>
            <p className="text-sm text-green-700">
              Escaneie QR codes nos locais de Vilhena para acumular pontos e subir no ranking!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
