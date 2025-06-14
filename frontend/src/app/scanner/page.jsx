"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { QrCode, CheckCircle, XCircle, MapPin, Trophy, Camera } from "lucide-react";

export default function ScannerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: appLoading, user } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!appLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, appLoading]);

  const simulateQRScan = () => {
    setIsScanning(true);
    setScanStatus('processing');
    
    // Simular processamento
    setTimeout(() => {
      const mockQRData = "vilhena-local-001";
      setScanResult(mockQRData);
      setScanStatus('success');
      setIsScanning(false);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }, 2000);
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanStatus(null);
    setIsScanning(false);
  };

  if (appLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" text="Carregando scanner..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center space-x-3">
          <QrCode size={24} />
          <div>
            <h1 className="text-xl font-bold">Scanner QR</h1>
            <p className="text-green-100 text-sm">
              Escaneie QR codes dos locais
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Scanner Area */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-72 flex items-center justify-center bg-gray-100 relative">
            {!isScanning && !scanStatus && (
              <div className="text-center">
                <Camera size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Scanner QR Code
                </h3>
                <p className="text-gray-500 mb-4">
                  Clique no botão abaixo para simular o scanner
                </p>
                <Button 
                  onClick={simulateQRScan}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <QrCode size={20} className="mr-2" />
                  Simular Scanner
                </Button>
              </div>
            )}

            {isScanning && (
              <div className="text-center">
                <Loading size="large" text="Escaneando QR Code..." />
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="text-center p-6">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  QR Code detectado!
                </h3>
                <p className="text-gray-600 mb-4">
                  Local: {scanResult}
                </p>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Trophy size={20} />
                  <span className="font-medium">+10 pontos</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Redirecionando...
                </p>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="text-center p-6">
                <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Erro no Scanner
                </h3>
                <p className="text-gray-600 mb-4">
                  Não foi possível ler o QR code
                </p>
                <Button 
                  onClick={resetScanner}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Como usar:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Encontre um QR code em um local de Vilhena</li>
            <li>• Use o scanner para ler o código</li>
            <li>• Ganhe pontos por cada check-in</li>
            <li>• Colete pontos para trocar por prêmios</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MapPin size={20} />
            <span>Ver Locais</span>
          </Button>
          
          <Button
            onClick={() => router.push('/rewards')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Trophy size={20} />
            <span>Recompensas</span>
          </Button>
        </div>

        {/* Info sobre MVP */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">
            📱 Versão MVP
          </h3>
          <p className="text-sm text-yellow-800">
            Esta é uma simulação do scanner QR. Na versão final, a câmera será utilizada 
            para ler QR codes reais nos estabelecimentos de Vilhena.
          </p>
        </div>
      </div>
    </div>
  );
}