import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProductDto,
  ProductSummaryDto,
  ProductImageDto,
  CreateProductDto,
  UpdateProductDto,
  GetProductsParams,
} from '../models/product.model';
import { PaginatedResult, CursorPaginatedResult, GetProductsCursorParams } from '../models/paginated-result.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  private readonly _products = signal<PaginatedResult<ProductSummaryDto> | null>(null);
  private readonly _currentProduct = signal<ProductDto | null>(null);
  private readonly _loading = signal(false);

  // Cursor pagination state
  private readonly _cursorItems = signal<ProductSummaryDto[]>([]);
  private readonly _nextCursor = signal<string | null>(null);
  private readonly _cursorHasMore = signal(false);
  private readonly _cursorLoading = signal(false);

  readonly products = this._products.asReadonly();
  readonly currentProduct = this._currentProduct.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalCount = computed(() => this._products()?.totalCount ?? 0);

  // Cursor pagination readonly signals
  readonly cursorItems = this._cursorItems.asReadonly();
  readonly cursorHasMore = this._cursorHasMore.asReadonly();
  readonly cursorLoading = this._cursorLoading.asReadonly();

  getProducts(params: GetProductsParams = {}): Observable<PaginatedResult<ProductSummaryDto>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive);
    if (params.isFeatured !== undefined) httpParams = httpParams.set('isFeatured', params.isFeatured);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending);

    this._loading.set(true);
    return this.http.get<PaginatedResult<ProductSummaryDto>>(this.baseUrl, { params: httpParams }).pipe(
      tap({
        next: result => {
          this._products.set(result);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  resetCursor(): void {
    this._cursorItems.set([]);
    this._nextCursor.set(null);
    this._cursorHasMore.set(false);
  }

  getProductsCursor(params: GetProductsCursorParams = {}): Observable<CursorPaginatedResult<ProductSummaryDto>> {
    let httpParams = new HttpParams();
    if (params.cursor) httpParams = httpParams.set('cursor', params.cursor);
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.priceMin !== undefined) httpParams = httpParams.set('priceMin', params.priceMin);
    if (params.priceMax !== undefined) httpParams = httpParams.set('priceMax', params.priceMax);
    if (params.ratingMin !== undefined) httpParams = httpParams.set('ratingMin', params.ratingMin);
    if (params.inStockOnly) httpParams = httpParams.set('inStockOnly', params.inStockOnly);

    this._cursorLoading.set(true);
    return this.http.get<CursorPaginatedResult<ProductSummaryDto>>(`${this.baseUrl}/cursor`, { params: httpParams }).pipe(
      tap({
        next: result => {
          // Primeiro carregamento (sem cursor) substitui; com cursor faz append
          if (!params.cursor) {
            this._cursorItems.set(result.items);
          } else {
            this._cursorItems.update(items => [...items, ...result.items]);
          }
          this._nextCursor.set(result.nextCursor);
          this._cursorHasMore.set(result.hasMore);
          this._cursorLoading.set(false);
        },
        error: () => this._cursorLoading.set(false),
      })
    );
  }

  loadMoreCursor(params: Omit<GetProductsCursorParams, 'cursor'> = {}): Observable<CursorPaginatedResult<ProductSummaryDto>> {
    return this.getProductsCursor({ ...params, cursor: this._nextCursor() ?? undefined });
  }

  getProductById(id: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/${id}`).pipe(
      tap(product => this._currentProduct.set(product))
    );
  }

  getProductBySlug(slug: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/slug/${slug}`).pipe(
      tap(product => this._currentProduct.set(product))
    );
  }

  createProduct(dto: CreateProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>(this.baseUrl, dto);
  }

  updateProduct(id: string, dto: UpdateProductDto): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.baseUrl}/${id}`, dto);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadImage(productId: string, file: File, altText?: string, setAsMain = false): Observable<ProductImageDto> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    formData.append('setAsMain', String(setAsMain));
    return this.http.post<ProductImageDto>(`${this.baseUrl}/${productId}/images`, formData);
  }

  deleteImage(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}/images/${imageId}`);
  }

  setMainImage(productId: string, imageId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${productId}/images/${imageId}/main`, {});
  }

  clearCurrentProduct(): void {
    this._currentProduct.set(null);
  }
}
