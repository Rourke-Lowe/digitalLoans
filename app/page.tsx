'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.role === 'member') {
          router.push('/member');
        } else {
          router.push('/staff');
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-20 h-20 mb-4" />
          <h1 className="text-2xl font-bold text-primary-700">DIGITAL LOANS</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <p className="font-semibold mb-2">Test Accounts:</p>
          <ul className="space-y-1">
            <li>• john.doe@email.com (Member)</li>
            <li>• jane.smith@email.com (Member)</li>
            <li>• sarah.martin@email.com (Member)</li>
            <li>• staff@creditunion.com (Staff)</li>
            <li>• admin@creditunion.com (Admin)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}