export interface ProductImageDto {
  id: string;
  url: string;
  altText?: string;
  isMain: boolean;
  displayOrder: number;
}

export interface ProductSummaryDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stockQuantity: number;
  soldCount: number;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  categoryName: string;
  mainImageUrl?: string;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stockQuantity: number;
  soldCount: number;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  weight: number;
  width?: number;
  height?: number;
  length?: number;
  categoryId: string;
  categoryName: string;
  images: ProductImageDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  weight: number;
}

export interface UpdateProductDto extends CreateProductDto {
  id: string;
}

export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  inStockOnly?: boolean;
}
