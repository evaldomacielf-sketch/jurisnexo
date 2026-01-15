"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CashBookPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        const fetchEntries = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/finance/cash-book?year=${year}`);
                setEntries(response.data);
            } catch (error) {
                console.error("Error fetching cash book:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, [year]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Livro Caixa (IR)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Visualize lançamentos dedutíveis para Imposto de Renda.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Lançamentos do Período</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data Comp.</TableHead>
                                    <TableHead>Categoria Fiscal</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Valor Total</TableHead>
                                    <TableHead>% Dedutível</TableHead>
                                    <TableHead>Valor Dedutível</TableHead>
                                    <TableHead>Comprovante</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Nenhum lançamento fiscal encontrado para este ano.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    entries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>{new Date(entry.fiscal_competence_date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{entry.fiscal_category}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{entry.notes || '-'}</TableCell>
                                            <TableCell>{formatCurrency(entry.transaction?.amount || 0)}</TableCell>
                                            <TableCell>{entry.deductible_percentage}%</TableCell>
                                            <TableCell className="font-bold text-slate-700 dark:text-slate-300">
                                                {formatCurrency(entry.deductible_amount)}
                                            </TableCell>
                                            <TableCell>
                                                {entry.proof_url ? (
                                                    <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                                                        Ver Anexo
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Pendente</span>
                                                )}
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
    );
}
