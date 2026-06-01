import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { GatePassService } from './gate-pass.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FlatIsolationGuard } from '../../common/guards/flat-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, GatePassStatus } from '@prisma/client';

@Controller('gate-passes')
@UseGuards(JwtAuthGuard, RolesGuard, FlatIsolationGuard)
export class GatePassController {
  constructor(private gatePassService: GatePassService) {}

  @Post()
  @Roles(Role.RESIDENT, Role.SECURITY, Role.SUPER_ADMIN)
  create(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.gatePassService.create(user, req.tenantFlatId, dto);
  }

  @Get()
  @Roles(Role.RESIDENT, Role.SECURITY, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  findAll(
    @CurrentUser() user: any,
    @Req() req: any,
    @Query('status') status?: GatePassStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.gatePassService.findAll(user, req.tenantFlatId, status, search, page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id')
  @Roles(Role.RESIDENT, Role.SECURITY, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.gatePassService.findOne(id, user);
  }

  @Patch(':id/approve')
  @Roles(Role.RESIDENT, Role.SECURITY, Role.SUPER_ADMIN)
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.gatePassService.approve(id, user);
  }

  @Patch(':id/reject')
  @Roles(Role.RESIDENT, Role.SECURITY, Role.SUPER_ADMIN)
  reject(@Param('id') id: string, @CurrentUser() user: any, @Body('notes') notes?: string) {
    return this.gatePassService.reject(id, user, notes);
  }

  @Patch(':id/entry')
  @Roles(Role.SECURITY, Role.SUPER_ADMIN)
  markEntry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.gatePassService.markEntry(id, user);
  }

  @Patch(':id/exit')
  @Roles(Role.SECURITY, Role.SUPER_ADMIN)
  markExit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.gatePassService.markExit(id, user);
  }
}
