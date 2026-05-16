import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FlatService } from './flat.service';
import { CreateFlatDto } from './dto/create-flat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, FlatStatus } from '@prisma/client';

@Controller('flats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FlatController {
  constructor(private flatService: FlatService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.flatService.findAll(page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.flatService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateFlatDto) {
    return this.flatService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateFlatDto>) {
    return this.flatService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: FlatStatus) {
    return this.flatService.updateStatus(id, status);
  }
}
