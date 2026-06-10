// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateWhatsAppMessage } from '@/lib/utils';
import { z } from 'zod';

const OrderSchema = z.object({
  customerName:    z.string().min(1),
  customerPhone:   z.string().min(1),
  deliveryAddress: z.string().min(1),
  items: z.array(z.object({
    productId: z.string(),
    quantity:  z.number().int().positive(),
    price:     z.number().positive(),
    name:      z.string(),
  })),
  totalAmount: z.number().positive(),
  receiptUrl:  z.string().optional(),
  pixKey:      z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const orders = await prisma.order.findMany({
      where:   status ? { status: status as never } : undefined,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = OrderSchema.parse(body);

    // Create order
    const order = await prisma.order.create({
      data: {
        customerName:    data.customerName,
        customerPhone:   data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        totalAmount:     data.totalAmount,
        receiptUrl:      data.receiptUrl,
        pixKey:          data.pixKey,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity:  item.quantity,
            price:     item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Get WhatsApp number from settings
    const whatsappSetting = await prisma.settings.findUnique({
      where: { key: 'whatsapp_number' },
    });
    const whatsappNumber = whatsappSetting?.value ?? '5511999999999';

    // Generate WhatsApp URL
    const message = generateWhatsAppMessage({
      customerName:    data.customerName,
      customerPhone:   data.customerPhone,
      deliveryAddress: data.deliveryAddress,
      items:           data.items,
      total:           data.totalAmount,
      receiptUrl:      data.receiptUrl,
    });
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    return NextResponse.json({ id: order.id, whatsappUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
