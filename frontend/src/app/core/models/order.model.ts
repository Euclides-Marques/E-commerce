import { AddressDto } from './address.model';

export interface OrderItemDto {
  productId: string;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode?: string;
  trackingCode?: string;
  notes?: string;
  createdAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  shippingAddress: AddressDto;
  items: OrderItemDto[];
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}
