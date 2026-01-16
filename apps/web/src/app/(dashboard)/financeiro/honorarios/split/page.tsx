'use client';

import { useEffect, useState } from 'react';
import { Plus, Users, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api-client';
// import { CreateSplitRuleModal } from "@/components/finance/CreateSplitRuleModal"; // To be implemented

export default function FeeSplitPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await api.get('/finance/fee-split/rules');
        setRules(response.data);
      } catch (error) {
        console.error('Error fetching split rules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Divisão de Honorários
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Configure regras de comissionamento e repasse entre advogados.
          </p>
        </div>
        <Button className="bg-primary text-white shadow-md hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Regra
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Regras Ativas
            </CardTitle>
            <CardDescription>
              Regras aplicadas automaticamente ao receber honorários.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Regra</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Automática</TableHead>
                    <TableHead>Beneficiários</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhuma regra configurada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {rule.split_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              rule.is_automatic
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {rule.is_automatic ? 'Sim' : 'Não'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {rule.configuration?.splits?.length || 0} advogados
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
