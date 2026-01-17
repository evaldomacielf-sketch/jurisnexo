'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { loginAction } from '@/actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // VALIDAÇÕES
      if (!email || !password) {
        toast.error('Preencha todos os campos');
        setLoading(false);
        return;
      }


      console.log('🔐 Tentando login com:', email);

      // Usar Server Action para autenticação
      const result = await loginAction({ email, password });

      if (!result.success) {
        console.error('❌ Erro de autenticação:', result.error);
        toast.error(result.error || 'Credenciais inválidas');
        setLoading(false);
        return;
      }

      console.log('✅ Login bem-sucedido');

      // Salva token no localStorage para uso no axios interceptor
      if (result.data?.token) {
        localStorage.setItem('token', result.data.token);

        // Also update auth store for apiClient to use
        const { useAuthStore } = await import('@/stores/auth');
        useAuthStore.getState().setAuth(result.data.token, result.data.user);
      }

      toast.success('Login realizado com sucesso!');

      // REDIRECIONAMENTO
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast.error('Erro ao conectar com o servidor');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="bg-card w-full max-w-md space-y-8 rounded-lg border p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">JurisNexo</h1>
          <p className="mt-2 text-sm text-muted-foreground">Faça login na sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-background"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Ainda não tem conta?{' '}
            <button
              onClick={() => router.push('/register')}
              className="font-medium text-primary hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
