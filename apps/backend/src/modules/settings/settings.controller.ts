import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SECURITY, Role.SUPER_ADMIN)
  getSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Patch()
  @Roles(Role.SUPER_ADMIN)
  updateSettings(@Body() dto: { fleeMarketAdminPhone?: string }) {
    return this.settingsService.updateSettings(dto);
  }
}
