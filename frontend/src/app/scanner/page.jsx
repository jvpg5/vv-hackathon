"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { localsService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { QrCode, CheckCircle, XCircle, MapPin, Trophy, Camera, Settings } from "lucide-react";
import {
  Scanner,
  useDevices,
  outline,
  boundingBox,
  centerText,
} from "@yudiel/react-qr-scanner";

const styles = {
  container: {
    width: '100%',
    height: '300px',
    margin: 'auto',
  },
  controls: {
    marginBottom: 8,
  },
};

export default function ScannerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: appLoading, user, checkIn } = useApp();
  
  // Scanner states
  const [deviceId, setDeviceId] = useState(undefined);
  const [tracker, setTracker] = useState("centerText");
  const [pause, setPause] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Scan result states
  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [local, setLocal] = useState(null);

  const devices = useDevices();

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!appLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, appLoading]);

  function getTracker() {
    switch (tracker) {
      case "outline":
        return outline;
      case "boundingBox":
        return boundingBox;
      case "centerText":
        return centerText;
      default:
        return undefined;
    }
  }

  const handleScan = async (detectedCodes) => {
    if (pause || isProcessing || detectedCodes.length === 0) return;
    
    const qrCodeData = detectedCodes[0].rawValue;
    setPause(true);
    setIsProcessing(true);
    setScanStatus('processing');
    setScanResult(qrCodeData);

    try {
      // Search for local by QR code
      const response = await localsService.getByQrCode(qrCodeData);
      
      if (response.data && response.data.length > 0) {
        const foundLocal = response.data[0];
        setLocal(foundLocal);
        setScanStatus('success');
        
        // Perform automatic check-in
        try {
          await checkIn(foundLocal.documentId);
          
          // Redirect to local detail page after success
          setTimeout(() => {
            router.push(`/local/${foundLocal.documentId}`);
          }, 2000);
        } catch (checkInError) {
          console.error('Check-in error:', checkInError);
          setScanStatus('success'); // Still show success but without check-in
          setTimeout(() => {
            router.push(`/local/${foundLocal.documentId}`);
          }, 2000);
        }
      } else {
        setScanStatus('error');
        setTimeout(() => {
          resetScanner();
        }, 3000);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setScanStatus('error');
      setTimeout(() => {
        resetScanner();
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };



  const handleError = (error) => {
    console.log(`Scanner error: ${error}`);
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
      <div className="bg-green-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <QrCode size={24} />
            <div>
              <h1 className="text-xl font-bold">Scanner QR</h1>
              <p className="text-white font-medium text-sm">
                Escaneie QR codes dos locais
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowControls(!showControls)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Settings size={20} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Scanner Controls */}
        {showControls && (
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
            <h3 className="font-medium text-gray-900">Configurações do Scanner</h3>
            
            {/* Device Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Câmera
              </label>
              <select 
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                value={deviceId || ''}
              >
                <option value="">Selecione uma câmera</option>
                {devices.map((device, index) => (
                  <option key={index} value={device.deviceId}>
                    {device.label || `Câmera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Tracker Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indicador Visual
              </label>
              <select
                onChange={(e) => setTracker(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                value={tracker}
              >
                <option value="centerText">Texto Central</option>
                <option value="outline">Contorno</option>
                <option value="boundingBox">Caixa Delimitadora</option>
                <option value="">Sem Indicador</option>
              </select>
            </div>
          </div>
        )}

        {/* Scanner Area */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            {!scanStatus && (
              <div>
                <Scanner
                  formats={[
                    "qr_code",
                    "micro_qr_code",
                    "rm_qr_code",
                    "maxi_code",
                    "pdf417",
                    "aztec",
                    "data_matrix",
                    "matrix_codes",
                    "dx_film_edge",
                    "databar",
                    "databar_expanded",
                    "codabar",
                    "code_39",
                    "code_93",
                    "code_128",
                    "ean_8",
                    "ean_13",
                    "itf",
                    "linear_codes",
                    "upc_a",
                    "upc_e",
                  ]}
                  constraints={{
                    deviceId: deviceId,
                  }}
                  onScan={handleScan}
                  onError={handleError}
                  styles={{ 
                    container: styles.container,
                  }}
                  components={{
                    audio: true,
                    onOff: true,
                    torch: true,
                    zoom: true,
                    finder: true,
                    tracker: getTracker(),
                  }}
                  allowMultiple={false}
                  scanDelay={2000}
                  paused={pause}
                />
              </div>
            )}

            {scanStatus === 'processing' && (
              <div className="h-72 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Loading size="large" text="Processando QR Code..." />
                  <p className="text-sm text-gray-600 mt-2">
                    Código: {scanResult}
                  </p>
                </div>
              </div>
            )}

            {scanStatus === 'success' && local && (
              <div className="h-72 flex items-center justify-center bg-green-50">
                <div className="text-center p-6">
                  <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Local encontrado!
                  </h3>
                  <p className="text-gray-600 mb-2 font-medium">
                    {local.nome}
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                    <Trophy size={20} />
                    <span className="font-medium">+{local.pontuacao || 10} pontos</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Redirecionando para o local...
                  </p>
                </div>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="h-72 flex items-center justify-center bg-red-50">
                <div className="text-center p-6">
                  <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    QR Code não reconhecido
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Este QR code não está cadastrado no sistema
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Código escaneado: {scanResult}
                  </p>
                  <Button 
                    onClick={resetScanner}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bloco centralizado com instrução e botões */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center space-y-6">
          {/* Scanner overlay instructions */}
          {!scanStatus && (
            <div className=" bg-blue-50 border border-blue-200 rounded-lg bg-opacity-50 text-blue-950 shadow-sm p-3 rounded-lg w-full font-medium">
              <p className="text-sm text-center">
                Centralize o QR Code
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex items-center space-x-2 w-full justify-center"
            >
              <MapPin size={20} />
              <span>Ver Locais</span>
            </Button>
            
            <Button
              onClick={() => router.push('/rewards')}
              variant="outline"
              className="flex items-center space-x-2 w-full justify-center"
            >
              <Trophy size={20} />
              <span>Recompensas</span>
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
             Como usar o scanner
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Permita o acesso à câmera quando solicitado</li>
            <li>• Posicione o QR code dentro da área de escaneamento</li>
            <li>• Aguarde o reconhecimento automático</li>
            <li>• O check-in será feito automaticamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}