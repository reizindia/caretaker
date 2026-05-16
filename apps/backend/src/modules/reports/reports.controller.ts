import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getDashboard(@CurrentUser() user: any, @Req() req: any) {
    return this.reportsService.getDashboard(user, req.tenantFlatId);
  }

  @Get('orders')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getOrdersReport(@CurrentUser() user: any, @Req() req: any) {
    return this.reportsService.getOrdersReport(user, req.tenantFlatId);
  }

  @Get('services')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getServicesReport(@CurrentUser() user: any, @Req() req: any) {
    return this.reportsService.getServicesReport(user, req.tenantFlatId);
  }

  @Get('gate-passes')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getGatePassReport(@CurrentUser() user: any, @Req() req: any) {
    return this.reportsService.getGatePassReport(user, req.tenantFlatId);
  }
}
