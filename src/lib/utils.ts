// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style:    'currency',
    currency: 'BRL',
  }).format(price);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

export function generateWhatsAppMessage(order: {
  customerName:    string;
  customerPhone:   string;
  deliveryAddress: string;
  items:           Array<{ name: string; quantity: number; price: number }>;
  total:           number;
  receiptUrl?:     string;
}): string {
  const itemsList = order.items
    .map(i => `  • ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`)
    .join('\n');

  return encodeURIComponent(
    `🎂 *Novo Pedido — Bolos da Dani*\n\n` +
    `👤 *Cliente:* ${order.customerName}\n` +
    `📱 *Telefone:* ${order.customerPhone}\n` +
    `📍 *Endereço:* ${order.deliveryAddress}\n\n` +
    `🛒 *Itens do Pedido:*\n${itemsList}\n\n` +
    `💰 *Total: ${formatPrice(order.total)}*\n\n` +
    `🧾 *Comprovante:* ${order.receiptUrl ?? 'Aguardando'}\n\n` +
    `_Pedido gerado via site Bolos da Dani_`
  );
}
