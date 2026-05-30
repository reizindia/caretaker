import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const MARKET_ADMIN_PHONE_KEY = 'flee_market_admin_phone';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getPublicSettings() {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { key: MARKET_ADMIN_PHONE_KEY },
    });

    return {
      fleeMarketAdminPhone: setting?.value || '',
    };
  }

  async updateSettings(dto: { fleeMarketAdminPhone?: string }) {
    const phone = dto.fleeMarketAdminPhone?.trim() || '';

    await this.prisma.platformSetting.upsert({
      where: { key: MARKET_ADMIN_PHONE_KEY },
      update: { value: phone },
      create: { key: MARKET_ADMIN_PHONE_KEY, value: phone },
    });

    return this.getPublicSettings();
  }
}
