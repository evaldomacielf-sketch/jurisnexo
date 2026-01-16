'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { clientsApi } from '@/lib/api/clients'; // Assuming this exists based on file list
import { useToast } from '@/components/ui/use-toast';
import { Plus, Check, Loader2 } from 'lucide-react';

// DTO compatible schema
const feeTypes = [
  { value: 'hourly', label: 'Por Hora' },
  { value: 'fixed', label: 'Valor Fixo' },
  { value: 'contingency', label: 'Êxito (Ad Exito)' },
  { value: 'success_fee', label: 'Taxa de Sucesso' },
  { value: 'retainer', label: 'Retainer (Mensal)' },
];

const formSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  feeType: z.enum(['hourly', 'fixed', 'contingency', 'success_fee', 'retainer']),
  contractedAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Valor deve ser maior que zero',
  }),
  dueDate: z.string().optional(),
});

interface CreateLegalFeeModalProps {
  onSuccess: () => void;
}

export function CreateLegalFeeModal({ onSuccess }: CreateLegalFeeModalProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      description: '',
      feeType: 'fixed',
      contractedAmount: '',
    },
  });

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const data = await clientsApi.getClients({ page: 1, limit: 100 });
      setClients(data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Erro ao carregar clientes',
        description: 'Não foi possível carregar a lista de clientes.',
        variant: 'destructive',
      });
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await api.post('/finance/legal-fees', {
        ...values,
        contractedAmount: Number(values.contractedAmount),
        dueDate: values.dueDate || undefined,
      });

      toast({
        title: 'Contrato criado',
        description: 'O contrato de honorários foi registrado com sucesso.',
      });
      setOpen(false);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating legal fee:', error);
      toast({
        title: 'Erro ao criar',
        description: 'Ocorreu um erro ao registrar o contrato.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white shadow-md hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Contrato de Honorários</DialogTitle>
          <DialogDescription>
            Registre um novo contrato de honorários para um cliente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={loadingClients ? 'Carregando...' : 'Selecione o Cliente'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Honorários Ação Trabalhista" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="feeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {feeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vencimento (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Contrato
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
