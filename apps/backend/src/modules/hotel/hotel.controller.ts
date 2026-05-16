import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FlatIsolationGuard } from '../../common/guards/flat-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, OrderStatus } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, FlatIsolationGuard)
export class HotelController {
  constructor(private hotelService: HotelService) {}

  @Get('hotels')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getHotels(@CurrentUser() user: any, @Req() req: any) {
    return this.hotelService.getHotels(user, req.tenantFlatId);
  }

  @Get('hotels/:id')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getHotel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.hotelService.getHotel(id, user);
  }

  @Post('hotels')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  createHotel(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.hotelService.createHotel(user, req.tenantFlatId, dto);
  }

  @Patch('hotels/:id')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  updateHotel(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.hotelService.updateHotel(id, user, dto);
  }

  @Get('hotels/:hotelId/foods')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getFoodItems(@Param('hotelId') hotelId: string, @CurrentUser() user: any, @Query('category') category?: string) {
    return this.hotelService.getFoodItems(hotelId, user, category);
  }

  @Post('hotels/:hotelId/foods')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  createFoodItem(@Param('hotelId') hotelId: string, @CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.hotelService.createFoodItem(hotelId, user, req.tenantFlatId, dto);
  }

  @Patch('foods/:id')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  updateFoodItem(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.hotelService.updateFoodItem(id, user, dto);
  }

  @Delete('foods/:id')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  deleteFoodItem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.hotelService.deleteFoodItem(id, user);
  }

  @Post('food/orders')
  @Roles(Role.RESIDENT)
  createFoodOrder(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.hotelService.createFoodOrder(user, req.tenantFlatId, dto);
  }

  @Get('food/orders')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getFoodOrders(@CurrentUser() user: any, @Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.hotelService.getFoodOrders(user, req.tenantFlatId, page ? +page : 1, limit ? +limit : 20);
  }

  @Patch('food/orders/:id/status')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  updateFoodOrderStatus(@Param('id') id: string, @Body('status') status: OrderStatus, @CurrentUser() user: any) {
    return this.hotelService.updateFoodOrderStatus(id, status, user);
  }
}
