'use client';

import { useRouter } from 'next/navigation';
import Logo from './Logo';

interface HeaderProps {
  userName?: string;
  showDashboard?: boolean;
  showSettings?: boolean;
}

export default function Header({ userName, showDashboard = true, showSettings = false }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo className="w-10 h-10" />
          </div>

          <nav className="flex items-center space-x-8">
            {showDashboard && (
              <button
                onClick={() => router.push(userName ? '/member' : '/staff')}
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Dashboard
              </button>
            )}
            {showSettings && (
              <button
                onClick={() => router.push('/staff/settings')}
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Settings
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}