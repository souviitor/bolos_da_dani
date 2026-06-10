'use client';
// src/app/admin/login/page.tsx
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Cake, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.ok) {
        toast.success('Bem-vinda, Dani! 🎂');
        router.push('/admin/dashboard');
      } else {
        toast.error('Email ou senha inválidos.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-rose flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Cake className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-cream">Bolos da Dani</h1>
          <p className="font-body text-cream/50 text-sm mt-1">Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="card p-8 bg-cream">
          <h2 className="font-display text-xl font-bold text-espresso mb-6 text-center">Entrar</h2>

          <div className="space-y-4">
            <div>
              <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@bolosdadani.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">Senha</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso transition-colors"
                  onClick={() => setShowPwd(s => !s)}
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</> : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-cream/30 text-xs mt-6">
          © {new Date().getFullYear()} Bolos da Dani
        </p>
      </div>
    </div>
  );
}
