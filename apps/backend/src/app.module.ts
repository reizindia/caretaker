import { HttpStatus, Module, MiddlewareConsumer, RequestMethod, Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { FlatModule } from './modules/flat/flat.module';
import { UsersModule } from './modules/users/users.module';
import { GroceryModule } from './modules/grocery/grocery.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { ServicesModule } from './modules/services/services.module';
import { GatePassModule } from './modules/gate-pass/gate-pass.module';
import { ReportsModule } from './modules/reports/reports.module';
import { StorageModule } from './modules/storage/storage.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { MarketModule } from './modules/market/market.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Controller('health')
class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check(@Res() response: Response) {
    const databaseConnected = await this.prisma.checkConnection();
    const statusCode = databaseConnected ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return response.status(statusCode).json({
      status: databaseConnected ? 'ok' : 'database_not_connected',
      database: databaseConnected ? 'connected' : 'not_connected',
      timestamp: new Date().toISOString(),
    });
  }
}

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    FlatModule,
    UsersModule,
    GroceryModule,
    HotelModule,
    ServicesModule,
    GatePassModule,
    ReportsModule,
    StorageModule,
    TenantModule,
    MarketModule,
    SettingsModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/me', method: RequestMethod.GET },
        { path: 'tenant/by-hostname', method: RequestMethod.GET },
        { path: 'tenant/by-slug/:slug', method: RequestMethod.GET },
        { path: 'health', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
