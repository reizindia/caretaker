import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.FLAT_ASSOCIATION, Role.SECURITY)
  findAll(
    @CurrentUser() user: any,
    @Query('flatId') flatId?: string,
    @Query('role') role?: Role,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(user, flatId, role, page ? +page : 1, limit ? +limit : 20, search);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.FLAT_ASSOCIATION)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.FLAT_ASSOCIATION)
  create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(dto, user);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.FLAT_ASSOCIATION)
  update(@Param('id') id: string, @Body() dto: Partial<CreateUserDto>, @CurrentUser() user: any) {
    return this.usersService.update(id, dto, user);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.FLAT_ASSOCIATION)
  updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean, @CurrentUser() user: any) {
    return this.usersService.updateStatus(id, isActive, user);
  }
}
