import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LoginPage from '../page';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

// Mock Supabase
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: vi.fn(),
}));

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('Login Page', () => {
  const mockSignInWithPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (createClientComponentClient as any).mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    });
  });

  it.skip('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it.skip('should show error on empty fields', async () => {
    const { container } = render(<LoginPage />);
    const form = container.querySelector('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Preencha todos os campos');
    });
  });

  it.skip('should login successfully and redirect', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: {} }, error: null });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'password123' } });

    const form = screen.getByRole('button', { name: /entrar/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password123',
      });
      expect(toast.success).toHaveBeenCalledWith('Login realizado com sucesso!');
    });
  });

  it.skip('should show error on invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'wrong' } });

    const form = screen.getByRole('button', { name: /entrar/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid login credentials');
    });
  });
});
