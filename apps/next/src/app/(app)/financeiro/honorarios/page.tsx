"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/utils/format";
import { CreateLegalFeeModal } from "@/components/finance/CreateLegalFeeModal";

export default function LegalFeesPage() {
    const [fees, setFees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchFees = async () => {
        try {
            setLoading(true);
            const response = await api.get("/finance/legal-fees");
            setFees(response.data);
        } catch (error) {
            console.error("Error fetching legal fees:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Legal Fees
    useEffect(() => {
        fetchFees();
    }, []);

    const filteredFees = fees.filter(fee => {
        const matchesSearch = fee.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fee.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Honorários
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie contratos de honorários e pagamentos.
                    </p>
                </div>
                <CreateLegalFeeModal onSuccess={fetchFees} />
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Contratado</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(fees.reduce((acc, curr) => acc + Number(curr.contracted_amount), 0))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valor total de contratos ativos
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recebido</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {/* Placeholder calculation */}
                            {formatCurrency(0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valor já liquidado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">A Receber</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {/* Placeholder calculation */}
                            {formatCurrency(fees.reduce((acc, curr) => acc + Number(curr.contracted_amount), 0))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Saldo pendente
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and List */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente ou descrição..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="completed">Concluído</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Valor Contrato</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                Nenhum contrato encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredFees.map((fee) => (
                                            <TableRow key={fee.id}>
                                                <TableCell className="font-medium">
                                                    {fee.client?.name || 'Cliente N/A'}
                                                </TableCell>
                                                <TableCell>{fee.description}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {fee.fee_type?.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatCurrency(fee.contracted_amount)}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            fee.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' :
                                                                fee.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-slate-100 text-slate-800'
                                                        }
                                                    >
                                                        {fee.status === 'active' ? 'Ativo' : fee.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">
                                                        Detalhes
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
