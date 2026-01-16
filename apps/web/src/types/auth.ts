export interface User {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'lawyer' | 'assistant' | 'client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  firm_name: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  password_confirmation: string;
}
