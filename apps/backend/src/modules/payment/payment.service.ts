import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createOrder(user: any, dto: { orderType: string; dbOrderId: string }) {
    const { orderType, dbOrderId } = dto;
    let amount = 0;

    if (orderType === 'grocery') {
      const order = await this.prisma.groceryOrder.findUnique({
        where: { id: dbOrderId },
      });
      if (!order) throw new NotFoundException('Grocery order not found');
      if (order.residentId !== user.id) throw new ForbiddenException();
      amount = Number(order.totalAmount);
    } else if (orderType === 'food') {
      const order = await this.prisma.foodOrder.findUnique({
        where: { id: dbOrderId },
      });
      if (!order) throw new NotFoundException('Food order not found');
      if (order.residentId !== user.id) throw new ForbiddenException();
      amount = Number(order.totalAmount);
    } else if (orderType === 'service') {
      const booking = await this.prisma.serviceBooking.findUnique({
        where: { id: dbOrderId },
        include: { service: true },
      });
      if (!booking) throw new NotFoundException('Service booking not found');
      if (booking.residentId !== user.id) throw new ForbiddenException();
      if (!booking.service.basePrice) {
        throw new BadRequestException('This service does not require payment');
      }
      amount = Number(booking.service.basePrice);
    } else {
      throw new BadRequestException('Invalid order type');
    }

    if (amount <= 0) {
      throw new BadRequestException('Invalid order amount');
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new BadRequestException('Razorpay credentials not configured');
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        receipt: dbOrderId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadRequestException(`Failed to create Razorpay order: ${errorText}`);
    }

    const data = await response.json();
    return {
      razorpayOrderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
    };
  }

  async verifyPayment(
    user: any,
    dto: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      dbOrderId: string;
      orderType: string;
    },
  ) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, dbOrderId, orderType } = dto;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new BadRequestException('Razorpay credentials not configured');
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    if (orderType === 'grocery') {
      const order = await this.prisma.groceryOrder.findUnique({ where: { id: dbOrderId } });
      if (!order) throw new NotFoundException('Grocery order not found');
      if (order.residentId !== user.id) throw new ForbiddenException();

      const newNotes = (order.notes ? order.notes + '\n' : '') + `[Paid via Razorpay. Payment ID: ${razorpay_payment_id}]`;
      await this.prisma.groceryOrder.update({
        where: { id: dbOrderId },
        data: {
          status: 'CONFIRMED',
          notes: newNotes,
        },
      });
    } else if (orderType === 'food') {
      const order = await this.prisma.foodOrder.findUnique({ where: { id: dbOrderId } });
      if (!order) throw new NotFoundException('Food order not found');
      if (order.residentId !== user.id) throw new ForbiddenException();

      const newNotes = (order.notes ? order.notes + '\n' : '') + `[Paid via Razorpay. Payment ID: ${razorpay_payment_id}]`;
      await this.prisma.foodOrder.update({
        where: { id: dbOrderId },
        data: {
          status: 'CONFIRMED',
          notes: newNotes,
        },
      });
    } else if (orderType === 'service') {
      const booking = await this.prisma.serviceBooking.findUnique({ where: { id: dbOrderId } });
      if (!booking) throw new NotFoundException('Service booking not found');
      if (booking.residentId !== user.id) throw new ForbiddenException();

      const newNotes = (booking.notes ? booking.notes + '\n' : '') + `[Paid via Razorpay. Payment ID: ${razorpay_payment_id}]`;
      await this.prisma.serviceBooking.update({
        where: { id: dbOrderId },
        data: {
          status: 'CONFIRMED',
          notes: newNotes,
        },
      });
    } else {
      throw new BadRequestException('Invalid order type');
    }

    return { success: true };
  }
}
