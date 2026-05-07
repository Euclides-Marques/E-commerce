import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReviewRequest, ReviewDto, ReviewSummaryDto } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);

  getProductReviews(productId: string, page = 1, pageSize = 10): Observable<ReviewSummaryDto> {
    return this.http.get<ReviewSummaryDto>(
      `${environment.apiUrl}/products/${productId}/reviews`,
      { params: { page, pageSize } }
    );
  }

  createReview(productId: string, body: CreateReviewRequest): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(`${environment.apiUrl}/products/${productId}/reviews`, body);
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/reviews/${reviewId}`);
  }

  markHelpful(reviewId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/reviews/${reviewId}/helpful`, {});
  }
}
