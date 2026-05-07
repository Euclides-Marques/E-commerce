export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface GetProductsCursorParams {
  cursor?: string | null;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  inStockOnly?: boolean;
}
