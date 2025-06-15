"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { localsService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { QrCode, CheckCircle, XCircle, MapPin, Trophy, Camera, Settings, Zap, Star, ArrowLeft, CircleHelp } from "lucide-react";
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
    height: '280px',
    margin: 'auto',
    borderRadius: '16px',
    overflow: 'hidden',
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

  const resetScanner = () => {
    setPause(false);
    setScanResult(null);
    setScanStatus(null);
    setLocal(null);
  };

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
          <Loading size="large" text="Carregando scanner..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-50 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96  rounded-full opacity-30 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-4 pb-2 px-3">
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl p-3 shadow-lg border border-green-400/40">
          <div className="flex items-center justify-between mb-2">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/30 rounded-full p-1.5 transition-all duration-200 border border-white/20"
            >
              <ArrowLeft size={20} />
            </Button>
            
            <Button
              onClick={() => setShowControls(!showControls)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/30 rounded-full p-1.5 transition-all duration-200 border border-white/20"
            >
              <Settings size={20} />  
            </Button>
          </div>
          
          <div className="text-center py-0.5">
            <div className="bg-white/30 rounded-full p-2 mb-2 inline-flex items-center justify-center border border-white/30 shadow-inner">
              <QrCode size={24} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-white mb-1">Scanner QR</h1>
            <div className="inline-flex items-center justify-center bg-white/20 rounded-full px-2.5 py-1 space-x-1 border border-white/20">
              <MapPin size={12} className="text-white" />
              <p className="text-white text-xs font-medium">Descubra Vilhena</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 space-y-4 pb-20">
        {/* Scanner Controls */}
        {showControls && (
          <div className="bg-white shadow-xl rounded-2xl p-4 border border-gray-100 animate-in slide-in-from-top duration-300">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center text-base">
              <Settings size={18} className="mr-2 text-green-600" />
              Configurações Avançadas
            </h3>
            
            <div className="space-y-3">
              {/* Device Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                   Câmera
                </label>
                <select 
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                   Indicador Visual
                </label>
                <select
                  onChange={(e) => setTracker(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={tracker}
                >
                  <option value="centerText">Texto Central</option>
                  <option value="outline">Contorno</option>
                  <option value="boundingBox">Caixa Delimitadora</option>
                  <option value="">Sem Indicador</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Area */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="relative">
            {!scanStatus && (
              <div className="relative">
                {/* Scanner Frame Overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                   
                   
                  </div>
                </div>
                
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
              <div className="h-72 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center p-6">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-spin mx-auto flex items-center justify-center">
                      <Zap size={24} className="text-white" />
                    </div>
                    <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-ping mx-auto opacity-20"></div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Analisando QR Code...
                  </h3>
                  <p className="text-gray-600 text-sm bg-gray-100 rounded-full px-3 py-1.5">
                    {scanResult}
                  </p>
                </div>
              </div>
            )}

            {scanStatus === 'success' && local && (
              <div className="h-72 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center p-6 animate-in zoom-in duration-500">
                  <div className="relative mb-4">
                    <CheckCircle size={60} className="text-green-500 mx-auto animate-bounce" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                       Local Descoberto!
                  </h3>
                  <div className="bg-white shadow-lg rounded-xl p-3 mb-3 border border-green-100">
                    <p className="text-gray-800 font-bold text-base mb-1.5">
                      {local.nome}
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-yellow-500">
                      <Star size={16} className="fill-current" />
                      <span className="font-bold text-base">+{local.pontuacao || 10} pontos</span>
                      <Star size={16} className="fill-current" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-1.5 text-green-500">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <p className="text-green-600 text-xs mt-1.5">
                    Redirecionando...
                  </p>
                </div>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="h-72 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="text-center p-6 animate-in zoom-in duration-500">
                  <div className="relative mb-4">
                    <XCircle size={60} className="text-red-500 mx-auto animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                         QR Code Inválido
                  </h3>
                  <div className="bg-white shadow-lg rounded-xl p-3 mb-3 border border-red-100">
                    <p className="text-gray-600 mb-1 text-sm">
                      Este QR code não faz parte do
                    </p>
                    <p className="text-gray-800 font-bold text-sm">
                      Valoriza Vilhena
                    </p>
                  </div>
                  <p className="text-red-600 text-xs mb-4 bg-red-50 rounded-full px-3 py-1.5 border border-red-200">
                    {scanResult}
                  </p>
                  <Button 
                    onClick={resetScanner}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                  >
                     Tentar Novamente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white shadow-xl rounded-2xl p-5 border border-gray-100">
          <div className="text-center mb-5">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="p-2  rounded-full">
                <CircleHelp size={18} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                Como Funciona
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Explore Vilhena de forma gamificada!
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-start space-x-3 bg-green-50 rounded-2xl p-4 border border-green-100">
              <div className="flex items-center justify-center bg-green-100 rounded-full w-12 h-12 mb-2 shadow">
                <Camera size={22} className="text-green-600" />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Permita acesso à câmera</p>
                <p className="text-gray-600 text-xs">Para funcionar perfeitamente</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 bg-teal-50 rounded-2xl p-4 border border-teal-100">
               <div className="flex items-center justify-center bg-green-100 rounded-full w-12 h-12 mb-2 shadow">
        <QrCode className="text-green-600" size={22} />
      </div>
              <div>
                <p className="text-gray-800 font-medium">Posicione o QR code na área</p>
                <p className="text-gray-600 text-xs">Aguarde o reconhecimento automático</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center justify-center bg-green-100 rounded-full w-12 h-12 mb-2 shadow">
               <Trophy className="text-yellow-500" size={22} />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Ganhe pontos automaticamente</p>
                <p className="text-gray-600 text-xs">Check-in feito na hora!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}