import { Controller, Get, Param, Query } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get('by-hostname')
  byHostname(@Query('hostname') hostname: string) {
    return this.tenantService.resolveByHostname(hostname);
  }

  @Get('by-slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.tenantService.resolveBySlug(slug);
  }
}
