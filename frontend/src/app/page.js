'use client';

import { useEffect, useState } from 'react';
import {star} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { localsService } from '@/lib/api';
import Loading from '@/components/Loading';
import { 
  MapPin, 
  QrCode, 
  Trophy, 
  Calendar,
  TrendingUp,
  Star
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading, user, points } = useApp();
  const [locals, setLocals] = useState([]);
  const [featuredLocals, setFeaturedLocals] = useState([]);
  const [loadingLocals, setLoadingLocals] = useState(true);
  const router = useRouter();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar locais em destaque
  useEffect(() => {
    const loadFeaturedLocals = async () => {
      try {
        const response = await localsService.getAll({
          'populate': '*',
          'pagination[limit]': 6,
          'sort': 'createdAt:desc'
        });
        
        setFeaturedLocals(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar locais:', error);
      } finally {
        setLoadingLocals(false);
      }
    };

    if (isAuthenticated) {
      loadFeaturedLocals();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" text="Carregando Valoriza Vilhena..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado
  }

  return (
    <div className="pb-20"> 
      <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Star className="text-white" size={28} />
            Valoriza Vilhena
          </h1>
          <p className="font-medium text-white mb-4">
            Descubra a história e os sabores da nossa terra
          </p>
          
          {/* Cards de estatísticas rápidas */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="text-yellow-300" size={24} />
              </div>
              <div className="text-2xl font-bold">{points}</div>
              <div className="text-sm text-green-100">Pontos</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="text-white" size={24} />
              </div>
              <div className="text-2xl font-bold">{featuredLocals.length}</div>
              <div className="text-sm text-green-100">Locais</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.push('/scanner')}
            className="bg-green-400 text-white p-4 rounded-lg flex flex-col items-center space-y-2 hover:bg-green-700 transition-colors"
          >
            <QrCode size={32} />
            <span className="font-medium">Escanear QR</span>
          </button>
          
          <button 
            onClick={() => router.push('/rewards')}
            className="bg-yellow-400 text-white p-4 rounded-lg flex flex-col items-center space-y-2 hover:bg-yellow-700 transition-colors"
          >
            <Trophy size={32} />
            <span className="font-medium">Recompensas</span>
          </button>
        </div>
      </div>

      {/* Locais em destaque */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Locais em Destaque</h2>
          <button 
            onClick={() => router.push('/map')}
            className="text-green-600 text-sm font-medium"
          >
            Ver todos
          </button>
        </div>

        {loadingLocals ? (
          <Loading text="Carregando locais..." />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {featuredLocals.slice(0, 3).map((local) => (
              <div 
                key={local.id} 
                className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/local/${local.documentId}`)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="text-green-600" size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {local.nome || 'Local sem nome'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {local.descricao || 'Sem descrição disponível'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-500" size={16} />
                        <span className="text-sm text-gray-600">
                          {local.pontuacao || 0} pts
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {local.categoria || 'Geral'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {featuredLocals.length === 0 && !loadingLocals && (
          <div className="text-center py-8 text-gray-500">
            <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum local cadastrado ainda.</p>
            <p className="text-sm">Novos locais aparecerão aqui!</p>
          </div>
        )}
      </div>

      {/* Call to action */}
      <div className="p-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Comece sua jornada!
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Escaneie QR codes nos locais de Vilhena e ganhe pontos para trocar por prêmios.
              </p>
              <button 
                onClick={() => router.push('/scanner')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Escanear agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}