'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

export default function PaymentPortalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form State
  const [firmName, setFirmName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [enablePix, setEnablePix] = useState(false);
  const [enableCreditCard, setEnableCreditCard] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/finance/payment-portal/settings');
        if (response.data) {
          setFirmName(response.data.firm_name || '');
          setPrimaryColor(response.data.primary_color || '#000000');
          const methods = response.data.enabled_payment_methods || [];
          setEnablePix(methods.includes('pix'));
          setEnableCreditCard(methods.includes('credit_card'));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const enabledPaymentMethods = [];
      if (enablePix) enabledPaymentMethods.push('pix');
      if (enableCreditCard) enabledPaymentMethods.push('credit_card');

      await api.put('/finance/payment-portal/settings', {
        firmName,
        primaryColor,
        enabledPaymentMethods,
      });

      toast({
        title: 'Configurações salvas',
        description: 'As configurações do portal de pagamentos foram atualizadas.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 duration-500 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Portal de Pagamentos
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Configure a aparência e os métodos de pagamento do portal do cliente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
          <CardDescription>
            Personalize como seus clientes visualizam a página de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firmName">Nome do Escritório</Label>
            <Input
              id="firmName"
              placeholder="Ex: Silva & Associados"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Cor Primária</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                className="h-10 w-12 p-1"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-32 font-mono uppercase"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Métodos de Pagamento
          </CardTitle>
          <CardDescription>
            Selecione os métodos aceitos para pagamento de honorários.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">PIX</Label>
              <p className="text-sm text-muted-foreground">Recebimento instantâneo via QR Code.</p>
            </div>
            <Switch checked={enablePix} onCheckedChange={setEnablePix} />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Cartão de Crédito</Label>
              <p className="text-sm text-muted-foreground">
                Permite parcelamento conforme configuração do gateway.
              </p>
            </div>
            <Switch checked={enableCreditCard} onCheckedChange={setEnableCreditCard} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-white">
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
