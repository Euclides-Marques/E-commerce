export interface CartItemDto {
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CartDto {
  items: CartItemDto[];
  totalItems: number;
  totalPrice: number;
}
