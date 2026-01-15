'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function SuperadminAuditPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3000/super/audit', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setLogs(data); setLoading(false); })
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Auditoria Global</h1>
        <Button variant="outline" onClick={() => window.location.href = '/dashboard/super'}>Voltar</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="font-mono text-xs">{log.actor_id}</TableCell>
                    <TableCell className="font-mono text-xs">{log.tenant_id}</TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.old_value || log.new_value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
