import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const slug = req.headers['x-tenant-slug'] as string;

    if (!slug) {
      return next();
    }

    try {
      const flat = await this.prisma.flat.findUnique({ where: { slug } });

      if (!flat) {
        return res.status(404).json({ message: 'Apartment not found', code: 'FLAT_NOT_FOUND' });
      }

      if (flat.status === 'INACTIVE') {
        return res.status(403).json({ message: 'This apartment account is inactive.', code: 'FLAT_INACTIVE' });
      }

      (req as any).tenantFlatId = flat.id;
      (req as any).tenantFlat = flat;
    } catch {
      return res.status(503).json({
        message: 'Database not connected. Please check the live database connection.',
        code: 'DATABASE_NOT_CONNECTED',
      });
    }

    next();
  }
}
