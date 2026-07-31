import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, withTenant, TenantPrismaClient } from '@photoos/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  getTenantClient(tenantId: string): TenantPrismaClient {
    return withTenant(this, tenantId);
  }
}
