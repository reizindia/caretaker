import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FlatIsolationGuard } from '../../common/guards/flat-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, BookingStatus } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, FlatIsolationGuard)
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get('services')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getServices(@CurrentUser() user: any, @Req() req: any) {
    return this.servicesService.getServices(user, req.tenantFlatId);
  }

  @Post('services')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  createService(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.servicesService.createService(user, req.tenantFlatId, dto);
  }

  @Patch('services/:id')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  updateService(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.servicesService.updateService(id, user, dto);
  }

  @Get('time-slots')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getTimeSlots(
    @CurrentUser() user: any,
    @Req() req: any,
    @Query('serviceId') serviceId?: string,
    @Query('date') date?: string,
  ) {
    return this.servicesService.getTimeSlots(user, req.tenantFlatId, serviceId, date);
  }

  @Post('time-slots')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  createTimeSlot(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.servicesService.createTimeSlot(user, req.tenantFlatId, dto);
  }

  @Patch('time-slots/:id')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  updateTimeSlot(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.servicesService.updateTimeSlot(id, user, dto);
  }

  @Post('service-bookings')
  @Roles(Role.RESIDENT)
  createBooking(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.servicesService.createBooking(user, req.tenantFlatId, dto);
  }

  @Get('service-bookings')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getBookings(@CurrentUser() user: any, @Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.servicesService.getBookings(user, req.tenantFlatId, page ? +page : 1, limit ? +limit : 20);
  }

  @Patch('service-bookings/:id/status')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  updateBookingStatus(@Param('id') id: string, @Body('status') status: BookingStatus, @CurrentUser() user: any) {
    return this.servicesService.updateBookingStatus(id, status, user);
  }
}
