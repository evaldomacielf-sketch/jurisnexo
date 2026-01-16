'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClientComponentClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // VALIDAÇÕES
            if (!email || !password) {
                toast.error('Preencha todos os campos')
                return
            }

            console.log('🔐 Tentando login com:', email)

            // AUTENTICAÇÃO
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('❌ Erro de autenticação:', error)
                toast.error(error.message)
                return
            }

            console.log('✅ Login bem-sucedido:', data)
            toast.success('Login realizado com sucesso!')

            // REDIRECIONAMENTO
            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            console.error('❌ Erro inesperado:', error)
            toast.error('Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">JurisNexo</h1>
                    <p className="text-sm text-muted-foreground mt-2">Faça login na sua conta</p>
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
                            onClick={() => router.push('/auth/register')}
                            className="font-medium text-primary hover:underline"
                        >
                            Cadastre-se
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
