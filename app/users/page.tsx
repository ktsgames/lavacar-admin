'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  status: 'free' | 'pending' | 'pro';
  created_at: string;
  last_sign_in: string | null;
  expires_at: string | null;
  pro_days_remaining: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'pending' | 'pro'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    
    if (filter !== 'all') {
      result = result.filter(u => u.status === filter);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(u => 
        u.email.toLowerCase().includes(searchLower) ||
        u.name.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredUsers(result);
  }, [users, filter, search]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: string) => {
    let days = 30;
    
    if (action === 'approve' || action === 'extend') {
      const input = prompt('Quantos dias?', '30');
      if (!input) return;
      days = parseInt(input);
    }

    if (action === 'delete') {
      if (!confirm('Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.')) {
        return;
      }
    }

    try {
      const method = action === 'delete' ? 'DELETE' : 'PATCH';
      const res = await fetch(`/api/users/${userId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: action !== 'delete' ? JSON.stringify({ action, days }) : undefined,
      });

      if (res.ok) {
        fetchUsers();
        alert('Operação realizada com sucesso!');
      } else {
        const data = await res.json();
        alert(data.error || 'Erro na operação');
      }
    } catch (error) {
      alert('Erro ao executar ação');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      free: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      pro: 'bg-green-100 text-green-700',
    };
    const labels = {
      free: 'Free',
      pending: 'Pendente',
      pro: 'Pró',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
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
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Gerenciar Usuários</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar por email ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900"
          />
          <div className="flex gap-2">
            {(['all', 'free', 'pending', 'pro'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'free' ? 'Free' : f === 'pending' ? 'Pendentes' : 'Pró'}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dias Restantes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Acesso</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.status === 'pro' ? (
                        user.expires_at ? (
                          <span>
                            {Math.max(0, Math.ceil((new Date(user.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dias
                          </span>
                        ) : (
                          <span>{user.pro_days_remaining} dias</span>
                        )
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.last_sign_in
                        ? new Date(user.last_sign_in).toLocaleDateString('pt-BR')
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.status === 'pending' && (
                          <button
                            onClick={() => handleAction(user.id, 'approve')}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Aprovar
                          </button>
                        )}
                        {user.status === 'free' && (
                          <button
                            onClick={() => handleAction(user.id, 'approve')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Dar Pró
                          </button>
                        )}
                        {user.status === 'pro' && (
                          <>
                            <button
                              onClick={() => handleAction(user.id, 'extend')}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Estender
                            </button>
                            <button
                              onClick={() => handleAction(user.id, 'revoke')}
                              className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                            >
                              Revogar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleAction(user.id, 'delete')}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-400">
        Criado por KaiqueDev
      </footer>
    </div>
  );
}
