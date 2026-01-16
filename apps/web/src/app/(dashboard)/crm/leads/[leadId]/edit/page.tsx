'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditLeadPage() {
  const params = useParams();
  const leadId = typeof params?.leadId === 'string' ? params.leadId : '';

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Lead {leadId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade de edição (Use CreateLeadDialog como base para refatorar em um Form
            reutilizável).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
