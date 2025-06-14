'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { 
  Home, 
  QrCode, 
  Trophy, 
  User, 
  LogOut,
  MapPin,
  Users
} from 'lucide-react';

const navigation = [
  { name: 'Início', href: '/', icon: Home },
  { name: 'Scanner', href: '/scanner', icon: QrCode },
  { name: 'Ranking', href: '/ranking', icon: Users },
  { name: 'Recompensas', href: '/rewards', icon: Trophy },
  { name: 'Perfil', href: '/profile', icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user, points } = useApp();

  // Não mostrar na página de login/registro
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <>
      {/* Header com informações do usuário */}
      {isAuthenticated && (
        <header className="bg-green-600 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Olá, {user?.username || 'Usuário'}!</h2>
            <p className="text-green-100 text-sm">{points} pontos</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-green-700 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </header>
      )}

      {/* Navegação inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors
                  ${isActive 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-500 hover:text-green-600'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Espaçamento para a navegação fixa */}
      <div className="h-16"></div>
    </>
  );
}
