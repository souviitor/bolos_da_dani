// src/types/index.ts
export interface Product {
  id:          string;
  name:        string;
  description: string;
  price:       number;
  imageUrl:    string;
  category:    string;
  available:   boolean;
}

export interface CartItem {
  product:  Product;
  quantity: number;
}

export interface Order {
  id:              string;
  customerName:    string;
  customerPhone:   string;
  deliveryAddress: string;
  items:           OrderItem[];
  totalAmount:     number;
  status:          OrderStatus;
  receiptUrl?:     string;
  createdAt:       Date;
}

export interface OrderItem {
  id:        string;
  productId: string;
  product:   Product;
  quantity:  number;
  price:     number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';

export interface Settings {
  pix_key:          string;
  whatsapp_number:  string;
  pix_name:         string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:   'Aguardando',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export const CATEGORY_LABELS: Record<string, string> = {
  CAKE:   'Bolo',
  SAVORY: 'Salgado',
  BREAD:  'Pães',
  SWEET:  'Doce',
  OTHER:  'Outro',
};
