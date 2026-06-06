import { useState } from 'react';
import { LogOut, Mail, Clock, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignOut() {
    setError('');
    setLoading(true);

    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sair');
    } finally {
      setLoading(false);
    }
  }

  const username = user?.username || user?.email?.split('@')[0] || 'Usuário';
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR')
    : '';

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-6">
        <div className="text-center mb-6">
          <div className="inline-block bg-moss-100 rounded-full p-4 mb-4">
            <div className="text-3xl font-bold text-moss-700">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="text-xl font-bold text-stone-800">{username}</h2>
          <p className="text-stone-500 text-sm mt-1">Conta de vendas</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
            <Mail size={18} className="text-stone-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-stone-500 font-medium">Email</p>
              <p className="text-sm text-stone-800 break-all">{user?.email}</p>
            </div>
          </div>

          {createdAt && (
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
              <Clock size={18} className="text-stone-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-500 font-medium">Membro desde</p>
                <p className="text-sm text-stone-800">{createdAt}</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors active:scale-95"
        >
          {loading && <Loader size={18} className="animate-spin" />}
          <LogOut size={18} />
          {loading ? 'Saindo...' : 'Sair da Conta'}
        </button>
      </div>
    </div>
  );
}
