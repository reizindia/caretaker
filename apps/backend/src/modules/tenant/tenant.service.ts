import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async resolveByHostname(hostname: string) {
    if (!hostname) throw new NotFoundException('Hostname required');

    // Extract subdomain: abc.caretakerapp.com → abc
    const parts = hostname.split('.');
    let slug: string;

    if (parts.length >= 3) {
      slug = parts[0];
    } else {
      // For localhost or single-part hostnames
      slug = hostname.split(':')[0];
    }

    return this.resolveBySlug(slug);
  }

  async resolveBySlug(slug: string) {
    const flat = await this.prisma.flat.findUnique({ where: { slug } });

    if (!flat) {
      throw new NotFoundException(`Apartment with slug "${slug}" not found`);
    }

    return {
      flatId: flat.id,
      flatName: flat.name,
      slug: flat.slug,
      logoUrl: flat.logoUrl,
      themeColor: flat.themeColor,
      status: flat.status,
      contactPerson: flat.contactPerson,
      contactPhone: flat.contactPhone,
      address: flat.address,
    };
  }
}
