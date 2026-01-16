"use client";

import { useState } from "react";
import { useHonorarios } from "../hooks/useHonorarios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Honorario } from "@/types/financeiro.types";

export function HonorariosList() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data, isLoading, isError } = useHonorarios({ search: searchTerm });

    if (isError) {
        return <div className="p-4 text-red-500">Erro ao carregar honorários.</div>;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Honorários Advocatícios</CardTitle>
                <div className="flex space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar cliente ou caso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-[250px]"
                        />
                    </div>
                    {/* O Modal de criação será injetado/chamado aqui posteriormente */}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Descrição/Caso</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead>Recebido</TableHead>
                                <TableHead>Pendente</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.items?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        Nenhum honorário encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.items?.map((honorario: Honorario) => (
                                    <TableRow key={honorario.id}>
                                        <TableCell className="font-medium">{honorario.cliente_id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{honorario.descricao}</span>
                                                <span className="text-xs text-muted-foreground">{honorario.processo_id || 'Avulso'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(honorario.valor_total)}</TableCell>
                                        <TableCell className="text-green-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(honorario.valor_pago)}</TableCell>
                                        <TableCell className="text-red-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(honorario.valor_pendente)}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={honorario.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/financeiro/honorarios/${honorario.id}`}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Detalhes
                                                </Link>
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
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        paid: "bg-green-100 text-green-800 hover:bg-green-100",
        pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        overdue: "bg-red-100 text-red-800 hover:bg-red-100",
        partial_paid: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    };

    const labels: Record<string, string> = {
        paid: "Pago",
        pending: "Pendente",
        overdue: "Atrasado",
        partial_paid: "Parcial",
        cancelled: "Cancelado",
    };

    return (
        <Badge className={styles[status] || styles.pending} variant="outline">
            {labels[status] || status}
        </Badge>
    );
}
