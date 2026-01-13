#!/bin/bash

# ============================================
# 🔧 JurisNexo - Script de Correção Automática
# ============================================

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
     _           _      _   _                 
    | |_   _ _ _(_)___ | \ | | _____  _____  
 _  | | | | | '__| / __||  \| |/ _ \ \/ / _ \ 
| |_| | |_| | |  | \__ \| |\  |  __/>  < (_) |
 \___/ \__,_|_|  |_|___/|_| \_|\___/_/\_\___/ 
                                               
    🔧 Script de Correção Automática
EOF
echo -e "${NC}"

# Verificar se está na raiz do projeto
if [ ! -d "apps/next" ]; then
    log_error "Erro: Execute este script na raiz do projeto jurisnexo/"
    exit 1
fi

log_info "Iniciando correções automáticas..."

# Navegar para o diretório do frontend
cd apps/next

# ============================================
# 1. CRIAR BACKUPS
# ============================================

log_info "Criando backups dos arquivos originais..."

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup dos arquivos que serão modificados
if [ -f "src/middleware.ts" ]; then
    cp "src/middleware.ts" "$BACKUP_DIR/middleware.ts.backup"
    log_success "Backup: middleware.ts"
fi

if [ -f "src/lib/auth/session.ts" ]; then
    cp "src/lib/auth/session.ts" "$BACKUP_DIR/session.ts.backup"
    log_success "Backup: session.ts"
fi

if [ -f "src/app/(app)/layout.tsx" ]; then
    cp "src/app/(app)/layout.tsx" "$BACKUP_DIR/layout.tsx.backup"
    log_success "Backup: layout.tsx"
fi

log_success "Backups criados em: apps/next/$BACKUP_DIR"

# ============================================
# 2. CORRIGIR MIDDLEWARE.TS
# ============================================

log_info "Corrigindo middleware.ts..."

cat > src/middleware.ts << 'EOF'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'jurisnexo_session';
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'jurisnexo_refresh';

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
];

const AUTH_ROUTES = ['/auth/login', '/auth/register'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function decodeJWT(token: string): { exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1];
    if (!payloadBase64) return null;
    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    );
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const API_URL = process.env.API_URL || 'http://localhost:4000';
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;
    const { accessToken } = await response.json();
    return accessToken;
  } catch (error) {
    console.error('[Middleware] Error refreshing token:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  const hasValidToken = accessToken && !isTokenExpired(accessToken);

  if (hasValidToken && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isTokenExpired(accessToken) && refreshToken) {
    const newAccessToken = await refreshAccessToken(refreshToken);

    if (newAccessToken) {
      const response = NextResponse.next();
      response.cookies.set(COOKIE_NAME, newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 900,
        path: '/',
      });
      return response;
    } else {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('session_expired', 'true');

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      response.cookies.delete(REFRESH_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
EOF

log_success "middleware.ts corrigido"

# ============================================
# 3. CORRIGIR SESSION.TS
# ============================================

log_info "Corrigindo session.ts..."

cat > src/lib/auth/session.ts << 'EOF'
'use server';

import { getAccessToken } from './cookies';
import type { AuthUser } from './types';

const API_URL = process.env.API_URL || 'http://localhost:4000';

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.log('[Session] No access token found');
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[Session] Error response:', response.status);
      return null;
    }

    const user: AuthUser = await response.json();
    return user;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Session] Request timeout');
    } else {
      console.error('[Session] Error:', error.message);
    }
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export async function isEmailVerified(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.emailVerified ?? false;
}

export async function getTokensForRefresh() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  return { accessToken, refreshToken };
}
EOF

log_success "session.ts corrigido"

# ============================================
# 4. CORRIGIR LAYOUT.TSX
# ============================================

log_info "Corrigindo layout.tsx..."

cat > "src/app/(app)/layout.tsx" << 'EOF'
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { getCurrentUser } from '@/lib/auth/session';
import { Suspense } from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('[Layout] Error fetching user:', error);
    redirect('/auth/login?error=session_error');
  }

  if (!user) {
    redirect('/auth/login?redirect=/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar user={user} tenantName="Silva & Associados" />
      </Suspense>

      <div className="ml-64 flex-1 transition-all duration-300">
        <Suspense fallback={<DashboardSkeleton />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="p-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </aside>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3 animate-pulse"></div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
  );
}
EOF

log_success "layout.tsx corrigido"

# ============================================
# 5. CRIAR ARQUIVOS FALTANTES
# ============================================

log_info "Criando arquivos faltantes..."

# Criar error.tsx
if [ ! -f "src/app/(app)/error.tsx" ]; then
    cat > "src/app/(app)/error.tsx" << 'EOF'
'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard] Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Algo deu errado
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Ocorreu um erro ao carregar o dashboard.
        </p>
        <button
          onClick={reset}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition mb-3"
        >
          Tentar Novamente
        </button>
        <a
          href="/auth/login"
          className="block w-full text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Voltar ao Login
        </a>
      </div>
    </div>
  );
}
EOF
    log_success "error.tsx criado"
else
    log_warning "error.tsx já existe, pulando..."
fi

# Criar loading.tsx
if [ ! -f "src/app/(app)/loading.tsx" ]; then
    cat > "src/app/(app)/loading.tsx" << 'EOF'
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
          Carregando dashboard...
        </p>
      </div>
    </div>
  );
}
EOF
    log_success "loading.tsx criado"
else
    log_warning "loading.tsx já existe, pulando..."
fi

# ============================================
# 6. LIMPAR CACHE
# ============================================

log_info "Limpando cache do Next.js..."

if [ -d ".next" ]; then
    rm -rf .next
    log_success "Cache .next removido"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    log_success "Cache node_modules removido"
fi

# ============================================
# 7. VERIFICAR .ENV.LOCAL
# ============================================

log_info "Verificando variáveis de ambiente..."

if [ ! -f ".env.local" ]; then
    log_warning ".env.local não encontrado!"
    log_info "Criando .env.local com valores padrão..."
    
    cat > .env.local << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL=http://localhost:4000

# Auth Configuration
AUTH_COOKIE_NAME=jurisnexo_session
REFRESH_COOKIE_NAME=jurisnexo_refresh
AUTH_COOKIE_MAX_AGE=900
REFRESH_COOKIE_MAX_AGE=604800

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    log_success ".env.local criado"
else
    log_success ".env.local existe"
fi

# ============================================
# 8. RESUMO
# ============================================

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ CORREÇÕES APLICADAS COM SUCESSO!     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

log_success "Arquivos corrigidos:"
echo "  • src/middleware.ts"
echo "  • src/lib/auth/session.ts"
echo "  • src/app/(app)/layout.tsx"
echo "  • src/app/(app)/error.tsx"
echo "  • src/app/(app)/loading.tsx"
echo ""

log_info "Backups salvos em: apps/next/$BACKUP_DIR"
echo ""

log_warning "PRÓXIMOS PASSOS:"
echo "  1. Verifique se o backend está rodando na porta 4000"
echo "  2. Execute: pnpm dev"
echo "  3. Acesse: http://localhost:3000/auth/login"
echo "  4. Faça login e teste o dashboard"
echo ""

log_info "Para reverter as mudanças, use os backups:"
echo "  cd apps/next/$BACKUP_DIR"
echo ""

echo -e "${BLUE}🚀 Dashboard JurisNexo pronto para uso!${NC}"
echo ""
