import React from 'react';
import { Button } from '@/components/ui/button';

interface HonorarioFormProps {
    honorario?: any;
    onSuccess: () => void;
}

export const HonorarioForm: React.FC<HonorarioFormProps> = ({ honorario, onSuccess }) => {
    return (
        <div className="space-y-4">
            <div className="p-4 border rounded bg-gray-50 text-center">
                <p className="text-muted-foreground">Formulário de Honorário (Placeholder)</p>
                {honorario && <p>Editando: {honorario.descricao || honorario.id}</p>}
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onSuccess}>Cancelar</Button>
                <Button onClick={onSuccess}>Salvar (Simulado)</Button>
            </div>
        </div>
    );
};
