import React from 'react';
import { LivroCaixaEntry } from '@/types/financeiro.types';
import { Button } from '@/components/ui/button';

interface LivroCaixaFormProps {
    entry?: LivroCaixaEntry;
    onSuccess: () => void;
}

export const LivroCaixaForm: React.FC<LivroCaixaFormProps> = ({ entry, onSuccess }) => {
    return (
        <div className="space-y-4">
            <div className="p-4 border rounded bg-gray-50 text-center">
                <p className="text-muted-foreground">Formulário de Livro Caixa (Placeholder)</p>
                {entry && <p>Editando: {entry.descricao}</p>}
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onSuccess}>Cancelar</Button>
                <Button onClick={onSuccess}>Salvar (Simulado)</Button>
            </div>
        </div>
    );
};
