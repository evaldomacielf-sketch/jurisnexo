import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/tests/utils';
import { ClientForm } from '../ClientForm';
import { clientsApi } from '@/lib/api/clients';
import { ClientStatus, ClientType, ClientPriority } from '@/lib/types/client';

// Mock da API
vi.mock('@/lib/api/clients', () => ({
  clientsApi: {
    createClient: vi.fn(),
    updateClient: vi.fn(),
    getClientById: vi.fn(),
  },
}));

// Mock do router (next/navigation)
const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
    back: mocks.back,
  }),
}));

describe('ClientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário corretamente', () => {
    render(<ClientForm />);

    expect(screen.getByPlaceholderText('Ex: João da Silva')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('joao@exemplo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('(11) 99999-9999')).toBeInTheDocument();
  });

  it('deve exibir erros de validação ao submeter vazio', async () => {
    const user = userEvent.setup();
    render(<ClientForm />);

    const submitButton = screen.getByRole('button', { name: /criar cliente/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome deve ter no mínimo 3 caracteres/i)).toBeInTheDocument();
      // Phone is optional in the schema but test expected invalid.
      // Schema says: phone: z.string().min(10, 'Telefone inválido').optional().or(z.literal('')),
      // If empty it's valid.
      // So let's skip phone validation check for empty submit or check name only.
    });
  });

  it('deve criar cliente com sucesso', async () => {
    const user = userEvent.setup();
    const mockCreate = vi.mocked(clientsApi.createClient);

    mockCreate.mockResolvedValue({
      id: '1',
      name: 'João Silva',
      phone: '11999999999',
      email: 'joao@teste.com',
      source: 'whatsapp',
      status: ClientStatus.ACTIVE,
      type: ClientType.INDIVIDUAL,
      priority: ClientPriority.NORMAL,
      tags: [],
      notes: '',
      tenantId: 'tenant-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<ClientForm />);

    // Preenche formulário
    await user.type(screen.getByPlaceholderText('Ex: João da Silva'), 'João Silva');
    await user.type(screen.getByPlaceholderText('joao@exemplo.com'), 'joao@teste.com');
    await user.type(screen.getByPlaceholderText('(11) 99999-9999'), '11999999999');

    // Submete
    const submitButton = screen.getByRole('button', { name: /criar cliente/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'João Silva',
          email: 'joao@teste.com',
          phone: '11999999999',
        })
      );
    });
  });

  it('deve validar formato de e-mail', async () => {
    const user = userEvent.setup();
    render(<ClientForm />);

    const emailInput = screen.getByPlaceholderText('joao@exemplo.com');
    await user.type(emailInput, 'email-invalido');
    await user.tab(); // Trigger blur

    // Submete para ver validação (default mode onSubmit)
    const submitButton = screen.getByRole('button', { name: /criar cliente/i });
    await user.click(submitButton);

    expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
  });

  it('deve permitir adicionar e remover tags', async () => {
    const user = userEvent.setup();
    render(<ClientForm />);

    // Adiciona tag
    const vipTag = screen.getByText('VIP');
    await user.click(vipTag);

    expect(vipTag).toHaveClass('bg-blue-100'); // Tag selecionada (adjusted class)

    // Remove tag
    await user.click(vipTag);
    expect(vipTag).not.toHaveClass('bg-blue-100'); // Tag desselecionada
  });
});
