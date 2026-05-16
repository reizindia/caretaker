import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
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

    const payload = { sub: user.id, email: user.email, role: user.role, flatId: user.flatId };
    const token = this.jwtService.sign(payload);

    const { passwordHash, ...userWithoutPassword } = user;

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
