"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { localsService, getStrapiImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { 
  MapPin, 
  Star, 
  Trophy, 
  Clock, 
  Phone, 
  Globe, 
  Navigation,
  Share2,
  Heart,
  QrCode,
  ArrowLeft
} from "lucide-react";

export default function LocalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: appLoading, user, checkIn } = useApp();
  const [local, setLocal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Carregar dados do local
  useEffect(() => {
    const loadLocal = async () => {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        const response = await localsService.getById(params.id, {
          'populate': '*'
        });
        
        if (response.data) {
          setLocal(response.data);
        } else {
          setError('Local não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar local:', error);
        setError('Erro ao carregar informações do local');
      } finally {
        setIsLoading(false);
      }
    };

    loadLocal();
  }, [params.id]);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!appLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, appLoading]);

  const handleCheckIn = async () => {
    if (!local || isCheckedIn) return;
    
    try {
      setCheckInLoading(true);
      await checkIn(local.id);
      setIsCheckedIn(true);
      
      // Mostrar feedback de sucesso
      setTimeout(() => {
        setIsCheckedIn(false);
      }, 3000);
    } catch (error) {
      console.error('Erro no check-in:', error);
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Valoriza Vilhena - ${local?.nome}`,
          text: `Confira este local incrível em Vilhena: ${local?.nome}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (appLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" text="Carregando local..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <MapPin size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <Button onClick={() => router.push('/')} variant="outline">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  if (!local) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="large" text="Local não encontrado..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header com imagem */}
      <div className="relative h-64 bg-gradient-to-br from-green-600 to-green-800">
        {/* Botão voltar */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Botão compartilhar */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
        >
          <Share2 size={20} />
        </button>

        {/* Imagem do local ou gradiente */}
        {local.imagens && local.imagens.length > 0 ? (
          <img
            src={getStrapiImageUrl(local.imagens[0].url)}
            alt={local.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin size={64} className="text-white opacity-60" />
          </div>
        )}

        {/* Overlay com informações básicas */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {local.nome || 'Local sem nome'}
          </h1>
          <div className="flex items-center space-x-4 text-white/80">
            <div className="flex items-center space-x-1">
              <Star className="text-yellow-400" size={16} />
              <span className="text-sm">4.5</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="text-yellow-400" size={16} />
              <span className="text-sm">{local.pontuacao || 10} pts</span>
            </div>
            <span className="text-sm bg-white/20 px-2 py-1 rounded">
              {local.categoria || 'Geral'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Check-in Button */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {isCheckedIn ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="text-green-600" size={32} />
              </div>
              <h3 className="font-bold text-green-900 mb-1">Check-in realizado!</h3>
              <p className="text-green-700 text-sm">+{local.pontuacao || 10} pontos adicionados</p>
            </div>
          ) : (
            <Button 
              onClick={handleCheckIn}
              disabled={checkInLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {checkInLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Fazendo check-in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <QrCode size={20} />
                  <span>Fazer Check-in (+{local.pontuacao || 10} pts)</span>
                </div>
              )}
            </Button>
          )}
        </div>

        {/* Descrição */}
        {local.descricao && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Sobre este local</h2>
            <p className="text-gray-700 leading-relaxed">
              {local.descricao}
            </p>
          </div>
        )}

        {/* Informações de contato/localização */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Informações</h2>
          <div className="space-y-3">
            {local.endereco && (
              <div className="flex items-start space-x-3">
                <MapPin className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Endereço</p>
                  <p className="text-sm text-gray-600">{local.endereco}</p>
                </div>
              </div>
            )}
            
            {local.telefone && (
              <div className="flex items-start space-x-3">
                <Phone className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Telefone</p>
                  <p className="text-sm text-gray-600">{local.telefone}</p>
                </div>
              </div>
            )}
            
            {local.site && (
              <div className="flex items-start space-x-3">
                <Globe className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Website</p>
                  <a 
                    href={local.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {local.site}
                  </a>
                </div>
              </div>
            )}
            
            {local.horario_funcionamento && (
              <div className="flex items-start space-x-3">
                <Clock className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Funcionamento</p>
                  <p className="text-sm text-gray-600">{local.horario_funcionamento}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* História/Curiosidades */}
        {local.historia && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">História</h2>
            <p className="text-gray-700 leading-relaxed">
              {local.historia}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => router.push('/scanner')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <QrCode size={20} />
            <span>Novo Scan</span>
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MapPin size={20} />
            <span>Ver Mapa</span>
          </Button>
        </div>

        {/* QR Code Info */}
        {local.qr_code_id && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              📱 QR Code: {local.qr_code_id}
            </h3>
            <p className="text-sm text-blue-800">
              Escaneie este código QR no local para fazer check-in e ganhar pontos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
