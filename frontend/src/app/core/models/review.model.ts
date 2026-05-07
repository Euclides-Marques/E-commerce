export interface ReviewDto {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ReviewSummaryDto {
  averageRating: number;
  totalCount: number;
  starCounts: number[];
  items: ReviewDto[];
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
}
