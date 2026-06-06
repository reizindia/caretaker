import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.email }],
        isActive: true,
      },
      include: { flat: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (dto.tenantSlug) {
      if (user.role === Role.SUPER_ADMIN || user.flat?.slug !== dto.tenantSlug) {
        throw new UnauthorizedException('This account does not belong to this apartment');
      }
    } else if (user.role !== Role.SUPER_ADMIN && process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Use your apartment login URL');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, flatId: user.flatId };
    const token = this.jwtService.sign(payload);

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      access_token: token,
      user: userWithoutPassword,
    };
  }

  async register(dto: RegisterDto) {
    const flat = await this.prisma.flat.findUnique({ where: { slug: dto.tenantSlug } });
    if (!flat) throw new NotFoundException('Apartment not found');

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        passwordHash,
        role: Role.RESIDENT,
        flatId: flat.id,
        flatNumber: dto.flatNumber.trim(),
        isActive: true,
      },
      include: { flat: true },
    });

    const payload = { sub: user.id, email: user.email, role: user.role, flatId: user.flatId };
    const token = this.jwtService.sign(payload);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      access_token: token,
      user: userWithoutPassword,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { flat: true },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
