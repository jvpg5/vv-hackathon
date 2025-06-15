'use client';

import { useEffect, useState } from 'react';
import {star} from 'lucide-react';
import { Progress } from "@/components/ui/progress"
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { localsService, dailyMissionsService, authService } from '@/lib/api';
import Loading from '@/components/Loading';
import { 
  MapPin, 
  QrCode, 
  Trophy, 
  Calendar,
  TrendingUp,
  Star,
  CircleUser
} from 'lucide-react';
  import Image from "next/image";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useApp();
  const points = user?.pontos;
  const [locals, setLocals] = useState([]);
  const [featuredLocals, setFeaturedLocals] = useState([]);
  const [loadingLocals, setLoadingLocals] = useState(true);
  const [dailyMissions, setDailyMissions] = useState([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
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

  // Carregar missões diárias
  useEffect(() => {
    const loadDailyMissions = async () => {
      try {
        setMissionsLoading(true);
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const progress = await dailyMissionsService.getUserProgress(currentUser.id);
          
          // Combinar missões completadas e disponíveis para exibição
          const allMissions = [
            ...progress.completed.map(mission => ({ ...mission, done: true })),
            ...progress.available.map(mission => ({ ...mission, done: false }))
          ];
          
          setDailyMissions(allMissions);
        }
      } catch (error) {
        console.error('Erro ao carregar missões diárias:', error);
        // Fallback para dados mock em caso de erro
        setDailyMissions([
          { id: 1, nome: "Visite 1 local novo", done: true, pontos: 20 },
          { id: 2, nome: "Faça check-in em um local gastronômico", done: false, pontos: 30 },
        ]);
      } finally {
        setMissionsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadDailyMissions();
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

  const completedMissions = dailyMissions.filter(m => m.done).length;
  const totalMissions = dailyMissions.length;
  const missionsProgress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  // Exemplo de cálculo de level e locais visitados (ajuste conforme sua lógica real)
  const level = user?.level || Math.floor((points || 0) / 100) + 1;
  const visitedLocals = user?.visitedLocals?.length || 0;
  const avatarUrl = user?.avatarUrl || "/avatar-default.png"; // ajuste para seu campo real

  return (
    <div className="pb-20"> 
      <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-b-xl">
        {/* Card de Perfil do Usuário centralizado e compacto */}
        <div className="flex justify-center">
          <div className="bg-white/100 rounded-xl shadow-lg px-4 py-2 mt-2 mb-3 flex items-center w-full max-w-xs border border-green-100 h-16 min-h-0">
            <div className="flex items-center justify-center rounded-full border-2 border-green-400 shadow bg-white w-9 h-9">
              <CircleUser className="text-green-400" size={28} />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="font-bold text-green-900 text-base truncate leading-tight">
                {user?.nome || user?.username || "Usuário"}
              </div>
              <div className="text-green-700 text-xs font-medium leading-tight">
                Level {level}
              </div>
              <div className="text-xs text-green-600 flex items-center leading-tight">
                <MapPin className="inline-block mr-1 text-green-500" size={14} />
                {visitedLocals} locais visitados
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">

          {/* Card de Missões do Dia */}
          <div className="bg-white/100 rounded-xl shadow-md p-4 mb-6 max-w-xs mx-auto flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <span className="font-semibold text-green-800 text-base flex items-center gap-2">
                Missões do Dia
              </span>
              <Trophy className="text-yellow-500" size={24} />
            </div>
            {/* Progress bar customizada */}
            <div className="w-full mb-2 relative">
              <div className="h-4 bg-green-100 rounded-full overflow-hidden flex items-center">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${missionsProgress}%` }}
                ></div>
                {/* Troféu animado no fim da barra */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center"
                  style={{ right: '-18px' }}
                >
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between text-sm mt-1">
              <span className="text-green-700 font-medium">
                {completedMissions} de {totalMissions} missões concluídas
              </span>
              <span className="text-green-600 font-semibold">
                +{dailyMissions.reduce((acc, m) => acc + (m.pontos || 0), 0)} pts
              </span>
            </div>
            {/* Lista resumida das missões */}
            <ul className="w-full mt-2 space-y-1">
              {dailyMissions.map(mission => (
                <li key={mission.id || mission.documentId} className="flex items-center gap-2 text-green-900">
                  <span className={`w-2 h-2 rounded-full ${mission.done ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className={`text-xs ${mission.done ? "line-through text-gray-400" : ""}`}>
                    {mission.nome}
                  </span>
                  <span className="ml-auto text-xs text-green-700 font-semibold">
                    +{mission.pontos}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cards de estatísticas rápidas */}
          <div className="flex flex-col gap-4 mt-4  items-center">
  <div className=" bg-white/90 backdrop-blur-md shadow-lg rounded-xl w-full max-w-xs h-16 flex items-center px-4 border border-white/40 hover:scale-105 transition-transform">
    <div className="flex items-center justify-center bg-yellow-100 rounded-full w-10 h-10 shadow mr-3">
      <Trophy className="text-yellow-500" size={22} />
    </div>
    <div className="flex flex-row items-baseline gap-2">
      <div className="text-xl font-bold text-green-900">{points}</div>
      <div className="text-sm text-green-950 font-medium">Pontos</div>
    </div>
  </div>
  
  <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl w-full max-w-xs h-16 flex items-center px-4 border border-white/40 hover:scale-105 transition-transform">
    <div className="flex items-center justify-center bg-green-100 rounded-full w-10 h-10 shadow mr-3">
      <MapPin className="text-green-600" size={22} />
    </div>
    <div className="flex flex-row items-baseline gap-2">
      <div className="text-xl font-bold text-green-900">{featuredLocals.length}</div>
      <div className="text-sm text-green-950 font-medium">Locais</div>
    </div>
  </div>
</div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="p-6">
  <h2 className="text-lg font-semibold mb-4 text-green-900">Ações Rápidas</h2>
  <div className="flex flex-row gap-4 justify-center">
    <button
      onClick={() => router.push('/scanner')}
      className="flex flex-col items-center bg-white/70 border border-green-100 rounded-xl shadow-md px-6 py-4 hover:bg-green-50 transition-colors w-40"
    >
      <div className="flex items-center justify-center bg-green-100 rounded-full w-12 h-12 mb-2 shadow">
        <QrCode className="text-green-600" size={28} />
      </div>
      <span className="font-semibold text-green-900 text-base">Escanear QR</span>
      <span className="text-xs text-green-700 mt-1">Ganhe pontos visitando locais</span>
    </button>
    <button
      onClick={() => router.push('/rewards')}
      className="flex flex-col items-center bg-white/70 border border-yellow-100 rounded-xl shadow-md px-6 py-4 hover:bg-yellow-50 transition-colors w-40"
    >
      <div className="flex items-center justify-center bg-yellow-100 rounded-full w-12 h-12 mb-2 shadow">
        <Trophy className="text-yellow-500" size={28} />
      </div>
      <span className="font-semibold text-yellow-900 text-base">Recompensas</span>
      <span className="text-xs text-yellow-700 mt-1">Troque pontos por prêmios</span>
    </button>
  </div>
</div>

      {/* Locais em destaque */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-green-900 font-semibold">Locais em Destaque</h2>
          <button 
            onClick={() => router.push('/all-locals')}
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