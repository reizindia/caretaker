import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { GroceryService } from './grocery.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FlatIsolationGuard } from '../../common/guards/flat-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, OrderStatus, RequestStatus } from '@prisma/client';

@Controller('grocery')
@UseGuards(JwtAuthGuard, RolesGuard, FlatIsolationGuard)
export class GroceryController {
  constructor(private groceryService: GroceryService) {}

  @Get('items')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getItems(@CurrentUser() user: any, @Req() req: any, @Query('search') search?: string, @Query('category') category?: string) {
    if (user.role === Role.FLAT_ASSOCIATION || user.role === Role.SUPER_ADMIN) {
      return this.groceryService.getAllItems(user, req.tenantFlatId, search, category);
    }
    return this.groceryService.getItems(user, req.tenantFlatId, search, category);
  }

  @Post('items')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  createItem(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.groceryService.createItem(user, req.tenantFlatId, dto);
  }

  @Patch('items/:id')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  updateItem(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.groceryService.updateItem(id, user, dto);
  }

  @Delete('items/:id')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  deleteItem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groceryService.deleteItem(id, user);
  }

  @Post('orders')
  @Roles(Role.RESIDENT)
  createOrder(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.groceryService.createOrder(user, req.tenantFlatId, dto);
  }

  @Get('orders')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getOrders(@CurrentUser() user: any, @Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.groceryService.getOrders(user, req.tenantFlatId, page ? +page : 1, limit ? +limit : 20);
  }

  @Patch('orders/:id/status')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  updateOrderStatus(@Param('id') id: string, @Body('status') status: OrderStatus, @CurrentUser() user: any) {
    return this.groceryService.updateOrderStatus(id, status, user);
  }

  @Post('requests')
  @Roles(Role.RESIDENT)
  createRequest(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.groceryService.createRequest(user, req.tenantFlatId, dto);
  }

  @Get('requests')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  getRequests(@CurrentUser() user: any, @Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.groceryService.getRequests(user, req.tenantFlatId, page ? +page : 1, limit ? +limit : 20);
  }

  @Patch('requests/:id/status')
  @Roles(Role.FLAT_ASSOCIATION, Role.SUPER_ADMIN)
  updateRequestStatus(@Param('id') id: string, @Body('status') status: RequestStatus, @CurrentUser() user: any) {
    return this.groceryService.updateRequestStatus(id, status, user);
  }
}
