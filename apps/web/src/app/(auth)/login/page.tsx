'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { setAuthCookies } from '@/lib/auth/cookies';

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
        return;
      }

      console.log('🔐 Tentando login com:', email);

      // AUTENTICAÇÃO via API .NET
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro de autenticação:', errorData);
        toast.error(errorData.message || 'Credenciais inválidas');
        return;
      }

      const data = await response.json();
      console.log('✅ Login bem-sucedido');

      // Setar cookies de autenticação
      if (data.accessToken && data.refreshToken) {
        await setAuthCookies({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }

      toast.success('Login realizado com sucesso!');

      // REDIRECIONAMENTO
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
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
