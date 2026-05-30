import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MarketListingStatus, Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MarketService } from './market.service';

@Controller('market')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Get('listings')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SECURITY, Role.SUPER_ADMIN)
  getListings(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: MarketListingStatus,
  ) {
    return this.marketService.getListings(search, category, status);
  }

  @Get('listings/mine')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SECURITY, Role.SUPER_ADMIN)
  getMyListings(@CurrentUser() user: any) {
    return this.marketService.getMyListings(user);
  }

  @Post('listings')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SECURITY, Role.SUPER_ADMIN)
  createListing(@CurrentUser() user: any, @Req() req: any, @Body() dto: any) {
    return this.marketService.createListing(user, req.tenantFlatId, dto);
  }

  @Get('listings/:id')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SECURITY, Role.SUPER_ADMIN)
  getListing(@Param('id') id: string, @CurrentUser() user: any) {
    return this.marketService.getListing(id, user);
  }

  @Patch('listings/:id/status')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SECURITY, Role.SUPER_ADMIN)
  updateListingStatus(@Param('id') id: string, @CurrentUser() user: any, @Body('status') status: MarketListingStatus) {
    return this.marketService.updateListingStatus(id, user, status);
  }

  @Delete('listings/:id')
  @Roles(Role.RESIDENT, Role.FLAT_ASSOCIATION, Role.SECURITY, Role.SUPER_ADMIN)
  deleteListing(@Param('id') id: string, @CurrentUser() user: any) {
    return this.marketService.deleteListing(id, user);
  }
}
