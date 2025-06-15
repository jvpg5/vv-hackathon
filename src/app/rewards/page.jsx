'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { premiosService, getStrapiImageUrl } from '@/lib/api';
import { 
  Trophy, 
  Star, 
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Loading from '@/components/Loading';

export default function RewardsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, points } = useApp();
  const [rewards, setRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load rewards
  useEffect(() => {
    const loadRewards = async () => {
      try {
        setLoadingRewards(true);
        const response = await premiosService.getAll({
          'populate': '*',
          'sort': 'pontos_necessarios:asc'
        });
        
        setRewards(response.data || []);
      } catch (error) {
        console.error('Error loading rewards:', error);
        setError('Erro ao carregar recompensas');
      } finally {
        setLoadingRewards(false);
      }
    };

    if (isAuthenticated) {
      loadRewards();
    }
  }, [isAuthenticated]);

  const handleRedeem = async (reward) => {
    if (!user || points < reward.pontos_necessarios) {
      setError('Pontos insuficientes para resgatar esta recompensa');
      return;
    }

    try {
      setRedeeming(reward.id);
      setError('');
      
      // Call API to redeem reward
      await premiosService.redeem(reward.id, user.id);
      
      setSuccess(`Recompensa "${reward.nome}" resgatada com sucesso!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setError('Erro ao resgatar recompensa. Tente novamente.');
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardImage = (reward) => {
    if (reward.imagem && reward.imagem.length > 0) {
      return getStrapiImageUrl(reward.imagem[0].url);
    }
    return null;
  };

  const canRedeem = (reward) => {
    return points >= (reward.pontos_necessarios || 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" text="Carregando recompensas..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-6 rounded-b-xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="text-yellow-200 mr-3" size={32} />
            <h1 className="text-2xl font-bold">Recompensas</h1>
          </div>
          
          {/* Points Card */}
          <div className="bg-white/90 rounded-xl shadow-md p-4 max-w-xs mx-auto">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center justify-center bg-yellow-100 rounded-full w-12 h-12 shadow">
                <Trophy className="text-yellow-500" size={24} />
              </div>
              <div>
                <div className="text-sm text-yellow-700 font-medium">Seus pontos</div>
                <div className="text-2xl font-bold text-yellow-900">{points || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="mx-6 mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle size={20} className="mr-2" />
            {success}
          </div>
        </div>
      )}

      {/* Rewards List */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-green-900">Recompensas Disponíveis</h2>

        {loadingRewards ? (
          <Loading text="Carregando recompensas..." />
        ) : rewards.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma recompensa disponível
            </h3>
            <p className="text-gray-500">
              Novas recompensas serão adicionadas em breve!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
                  canRedeem(reward) 
                    ? 'border-green-200 hover:shadow-md' 
                    : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Reward Image/Icon */}
                  <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getRewardImage(reward) ? (
                      <img
                        src={getRewardImage(reward)}
                        alt={reward.nome}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Trophy className="text-yellow-600" size={24} />
                    )}
                  </div>

                  {/* Reward Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {reward.nome}
                    </h3>
                    {reward.descricao && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {reward.descricao}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-500" size={16} />
                        <span className="text-sm text-gray-600">
                          {reward.pontos_necessarios || 0} pontos
                        </span>
                      </div>
                      
                      {/* Action Button */}
                      {canRedeem(reward) ? (
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={redeeming === reward.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {redeeming === reward.id ? 'Resgatando...' : 'Resgatar'}
                        </button>
                      ) : (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Faltam</p>
                          <p className="text-sm font-semibold text-red-600">
                            {(reward.pontos_necessarios || 0) - points} pts
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      {rewards.length > 0 && (
        <div className="p-6">
          <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <Trophy className="text-yellow-500 mx-auto mb-2" size={32} />
              <h3 className="font-medium text-gray-900 mb-1">
                Ganhe mais pontos!
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Visite mais locais em Vilhena para ganhar pontos e resgatar recompensas incríveis.
              </p>
              <button 
                onClick={() => router.push('/scanner')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Escanear QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
