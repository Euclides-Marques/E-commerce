export interface WishlistItemDto {
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  averageRating: number;
  reviewCount: number;
  inStock: boolean;
  addedAt: string;
}

export interface ToggleWishlistResult {
  isInWishlist: boolean;
}
