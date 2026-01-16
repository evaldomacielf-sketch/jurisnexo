/**
 * Tipos TypeScript gerados automaticamente do backend .NET
 * ⚠️ NÃO EDITE ESTE ARQUIVO MANUALMENTE
 * Para atualizar: pnpm generate:types
 */

// Placeholder - será substituído pelo script generate.sh
export interface components {
  schemas: {
    // DTOs serão gerados automaticamente
    CaseDto: {
      id: string;
      title: string;
      number: string;
      description?: string;
      status: string;
      clientId: string;
      clientName?: string;
      responsibleUserId?: string;
      responsibleUserName?: string;
      court?: string;
      distributionDate?: string;
      createdAt: string;
      updatedAt: string;
    };
    ClientDto: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      document?: string;
      type: 'individual' | 'company';
      createdAt: string;
      updatedAt: string;
    };
    CreateCaseDto: {
      title: string;
      number: string;
      description?: string;
      clientId: string;
      responsibleUserId?: string;
      court?: string;
      distributionDate?: string;
    };
    UpdateCaseDto: {
      title?: string;
      number?: string;
      description?: string;
      status?: string;
      responsibleUserId?: string;
      court?: string;
    };
    UserDto: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatarUrl?: string;
      tenantId: string;
    };
    TenantDto: {
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
    };
  };
}

export interface paths {
  '/api/cases': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': {
              data: components['schemas']['CaseDto'][];
              page: number;
              pageSize: number;
              total: number;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          'application/json': components['schemas']['CreateCaseDto'];
        };
      };
      responses: {
        201: {
          content: {
            'application/json': components['schemas']['CaseDto'];
          };
        };
      };
    };
  };
  '/api/cases/{id}': {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['CaseDto'];
          };
        };
        404: {};
      };
    };
    put: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['UpdateCaseDto'];
        };
      };
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['CaseDto'];
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: {};
      };
    };
  };
}

export interface operations {}

// Re-exports convenientes
export type CaseDto = components['schemas']['CaseDto'];
export type ClientDto = components['schemas']['ClientDto'];
export type CreateCaseDto = components['schemas']['CreateCaseDto'];
export type UpdateCaseDto = components['schemas']['UpdateCaseDto'];
export type UserDto = components['schemas']['UserDto'];
export type TenantDto = components['schemas']['TenantDto'];
