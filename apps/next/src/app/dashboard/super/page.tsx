'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function SuperadminPage() {
  const { token } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [disableReason, setDisableReason] = useState('');

  const fetchTenants = async () => {
    try {
      const res = await fetch('http://localhost:3000/super/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTenants();
  }, [token]);

  const handleDisable = async () => {
    if (!selectedTenantId) return;
    try {
      await fetch(`http://localhost:3000/super/tenants/${selectedTenantId}/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: disableReason })
      });
      setDisableModalOpen(false);
      setDisableReason('');
      fetchTenants();
    } catch (err) {
      alert('Erro ao desabilitar');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Superadmin Dashboard</h1>
        <Button variant="outline" onClick={() => window.location.href = '/dashboard/super/audit'}>Ver Logs de Auditoria</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenants ({tenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-mono text-xs">{tenant.id}</TableCell>
                    <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={tenant.status === 'DISABLED' ? 'destructive' : 'default'}>
                        {tenant.status || 'ACTIVE'}
                      </Badge>
                      {tenant.status === 'DISABLED' && (
                        <p className="text-xs text-red-500 mt-1">{tenant.disabled_reason}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {tenant.status !== 'DISABLED' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => { setSelectedTenantId(tenant.id); setDisableModalOpen(true); }}
                        >
                          Desabilitar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={disableModalOpen} onOpenChange={setDisableModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desabilitar Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Motivo do Bloqueio</Label>
            <Input value={disableReason} onChange={(e) => setDisableReason(e.target.value)} placeholder="Ex: Falta de pagamento" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDisable}>Confirmar Bloqueio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
