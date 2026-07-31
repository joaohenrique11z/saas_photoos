import { Prisma, PrismaClient } from '@prisma/client';

const TENANT_SCOPED_MODELS = [
  'Usuario',
  'Cliente',
  'InteracaoTimeline',
  'Servico',
  'Ensaio',
  'TarefaWorkflow',
  'DespesaEnsaio',
  'TransacaoFinanceira',
  'ContratoModelo',
  'Contrato',
  'Documento',
  'Galeria',
  'FotoGaleria',
  'LeadPipeline',
  'TemplateMensagem',
  'Equipamento',
];

export function withTenant(prisma: PrismaClient, tenantId: string) {
  if (!tenantId) {
    throw new Error('Tenant ID is required to initialize multitenant Prisma Client extension.');
  }

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_SCOPED_MODELS.includes(model)) {
            return query(args);
          }

          const anyArgs = (args || {}) as any;

          // Inject tenantId in WHERE clause for read/update/delete operations
          if (
            [
              'findMany',
              'findFirst',
              'findUnique',
              'update',
              'updateMany',
              'delete',
              'deleteMany',
              'count',
              'aggregate',
              'groupBy',
            ].includes(operation)
          ) {
            anyArgs.where = {
              ...(anyArgs.where || {}),
              tenantId,
            };
          }

          // Inject tenantId in DATA clause for create operations
          if (operation === 'create') {
            anyArgs.data = {
              ...anyArgs.data,
              tenantId,
            };
          }

          if (operation === 'createMany') {
            if (Array.isArray(anyArgs.data)) {
              anyArgs.data = anyArgs.data.map((item: any) => ({
                ...item,
                tenantId,
              }));
            } else if (anyArgs.data) {
              anyArgs.data = {
                ...anyArgs.data,
                tenantId,
              };
            }
          }

          return query(anyArgs);
        },
      },
    },
  });
}

export type TenantPrismaClient = ReturnType<typeof withTenant>;
