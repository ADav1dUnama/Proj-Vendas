import { useState } from 'react';
import { Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SignUpProps {
  onSwitchToLogin: () => void;
}

export function SignUp({ onSwitchToLogin }: SignUpProps) {
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, username);
      setSuccess(true);
      setTimeout(() => onSwitchToLogin(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    username.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    password === confirmPassword;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-moss-600 to-moss-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="inline-block bg-green-100 rounded-full p-3 mb-4">
            <User size={28} className="text-green-700" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Cadastro realizado!</h1>
          <p className="text-stone-500 text-sm mt-2 mb-6">
            Sua conta foi criada com sucesso. Redirecionando para login...
          </p>
          <div className="w-8 h-8 border-4 border-moss-300 border-t-moss-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-moss-600 to-moss-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-moss-100 rounded-full p-3 mb-4">
            <User size={28} className="text-moss-700" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Cadastro New Vendas</h1>
          <p className="text-stone-500 text-sm mt-2">Crie sua conta para controlar as vendas</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Nome de Usuário
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3.5 text-stone-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu_nome"
                className="w-full border-2 border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-800 focus:outline-none focus:border-moss-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border-2 border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-800 focus:outline-none focus:border-moss-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-2 border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-800 focus:outline-none focus:border-moss-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-stone-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-2 border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-800 focus:outline-none focus:border-moss-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full bg-moss-600 hover:bg-moss-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-stone-600 text-sm">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-moss-700 font-semibold hover:underline"
            >
              Entre aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
