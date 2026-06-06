import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FlatIsolationGuard } from '../../common/guards/flat-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('payment')
@UseGuards(JwtAuthGuard, RolesGuard, FlatIsolationGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
  @Roles(Role.RESIDENT)
  createOrder(@CurrentUser() user: any, @Body() dto: { orderType: string; dbOrderId: string }) {
    return this.paymentService.createOrder(user, dto);
  }

  @Post('verify')
  @Roles(Role.RESIDENT)
  verifyPayment(
    @CurrentUser() user: any,
    @Body()
    dto: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      dbOrderId: string;
      orderType: string;
    },
  ) {
    return this.paymentService.verifyPayment(user, dto);
  }
}
