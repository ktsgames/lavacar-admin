'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  total: number;
  free: number;
  pending: number;
  pro: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  status: 'free' | 'pending' | 'pro';
  created_at: string;
  expires_at: string | null;
  requested_at: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ total: 0, free: 0, pending: 0, pro: 0 });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setPendingUsers(data.users.filter((u: User) => u.status === 'pending'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    const days = prompt('Quantos dias de acesso Pró?', '30');
    if (!days) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', days: parseInt(days) }),
      });

      if (res.ok) {
        fetchData();
        alert('Usuário aprovado com sucesso!');
      }
    } catch (error) {
      alert('Erro ao aprovar usuário');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">LavaCar Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">KaiqueDev</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total de Usuários</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Usuários Free</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.free}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
            <p className="text-sm text-gray-500">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-400">
            <p className="text-sm text-gray-500">Usuários Pró</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.pro}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/users"
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Ver Todos os Usuários
          </Link>
        </div>

        {/* Pending Users */}
        {pendingUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Solicitações Pendentes ({pendingUsers.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Solicitado em: {user.requested_at ? new Date(user.requested_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    Aprovar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingUsers.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">Nenhuma solicitação pendente</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-400">
        Criado por KaiqueDev
      </footer>
    </div>
  );
}
