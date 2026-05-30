import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private connected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
    } catch (error) {
      this.connected = false;
      console.error('Database connection failed. Live database is unavailable.', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.connected = false;
  }

  async checkConnection() {
    try {
      await this.$queryRaw`SELECT 1`;
      this.connected = true;
      return true;
    } catch {
      this.connected = false;
      return false;
    }
  }

  isConnected() {
    return this.connected;
  }
}
