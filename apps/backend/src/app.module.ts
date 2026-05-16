import { Module, MiddlewareConsumer, RequestMethod, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
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
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Controller('health')
class HealthController {
  @Get()
  check() { return { status: 'ok', timestamp: new Date().toISOString() }; }
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
