import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  flatId?: string;

  @IsOptional()
  @IsString()
  flatNumber?: string;
}
