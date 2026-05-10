import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductSummaryDto, GetProductsParams } from '../../../core/models/product.model';
import { CategoryDto } from '../../../core/models/category.model';
import { GetProductsCursorParams } from '../../../core/models/paginated-result.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe,
    ProductCardComponent,
  ],
  template: `
    <div class="animate-fade-in">

      <!-- Search bar -->
      <div class="pl-search-wrap">
        <div class="pl-search-inner">
          <mat-icon class="pl-search-icon">search</mat-icon>
          <input
            class="pl-search-input"
            type="text"
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            [placeholder]="'PRODUCT.LIST.SEARCH_PLACEHOLDER' | translate" />
          @if (searchQuery) {
            <button class="pl-search-clear" (click)="searchQuery = ''; onSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
          <button class="pl-search-btn" (click)="onSearch()">
            <mat-icon>arrow_forward</mat-icon>
            Buscar
          </button>
        </div>
      </div>

      <div class="flex gap-6">

        <!-- ── Sidebar de filtros ─────────────────────────────────────────── -->
        <aside class="w-[252px] hidden md:block shrink-0">
          <div class="pl-filter-panel">

            <div class="pl-filter-head">
              <span class="pl-filter-title">
                <mat-icon>tune</mat-icon>
                {{ 'PRODUCT.LIST.FILTERS' | translate }}
              </span>
              @if (hasActiveFilters()) {
                <button class="pl-filter-clear" (click)="clearFilters()">
                  {{ 'PRODUCT.LIST.CLEAR_FILTERS' | translate }}
                </button>
              }
            </div>

            <!-- Categoria -->
            <div class="pl-filter-section">
              <p class="pl-filter-label">{{ 'PRODUCT.LIST.CATEGORY' | translate }}</p>
              <div class="pl-cat-list">
                <button class="pl-cat-btn" [class.pl-cat-active]="selectedCategory === ''" (click)="selectCategory('')">
                  <mat-icon>grid_view</mat-icon>
                  {{ 'PRODUCT.LIST.ALL_CATEGORIES' | translate }}
                </button>
                @for (cat of hierarchy(); track cat.id) {
                  <button class="pl-cat-btn" [class.pl-cat-active]="selectedCategory === cat.id" (click)="selectCategory(cat.id)">
                    <mat-icon>chevron_right</mat-icon>
                    {{ cat.name }}
                  </button>
                  @for (sub of cat.children; track sub.id) {
                    <button class="pl-cat-btn pl-cat-sub" [class.pl-cat-active]="selectedCategory === sub.id" (click)="selectCategory(sub.id)">
                      {{ sub.name }}
                    </button>
                  }
                }
              </div>
            </div>

            <div class="pl-filter-sep"></div>

            <!-- Faixa de preço -->
            <div class="pl-filter-section">
              <p class="pl-filter-label">{{ 'PRODUCT.LIST.PRICE_RANGE' | translate }}</p>
              <div class="pl-price-row">
                <div class="pl-price-field">
                  <span class="pl-price-prefix">R$</span>
                  <input
                    class="pl-price-input"
                    type="number"
                    min="0"
                    [(ngModel)]="priceMin"
                    (change)="onFilterChange()"
                    [placeholder]="'PRODUCT.LIST.PRICE_MIN' | translate" />
                </div>
                <span class="pl-price-dash">–</span>
                <div class="pl-price-field">
                  <span class="pl-price-prefix">R$</span>
                  <input
                    class="pl-price-input"
                    type="number"
                    min="0"
                    [(ngModel)]="priceMax"
                    (change)="onFilterChange()"
                    [placeholder]="'PRODUCT.LIST.PRICE_MAX' | translate" />
                </div>
              </div>
            </div>

            <div class="pl-filter-sep"></div>

            <!-- Avaliação mínima -->
            <div class="pl-filter-section">
              <p class="pl-filter-label">{{ 'PRODUCT.LIST.MIN_RATING' | translate }}</p>
              <div class="pl-rating-row">
                @for (star of [1,2,3,4,5]; track star) {
                  <button class="pl-rating-btn" [class.pl-rating-active]="ratingMin === star" (click)="selectRating(star)">
                    <span class="pl-rating-star">★</span>{{ star }}+
                  </button>
                }
              </div>
            </div>

            <div class="pl-filter-sep"></div>

            <!-- Em estoque -->
            <div class="pl-filter-section">
              <div class="pl-toggle-row" (click)="inStockOnly = !inStockOnly; onFilterChange()">
                <span class="pl-toggle-label">{{ 'PRODUCT.LIST.IN_STOCK_ONLY' | translate }}</span>
                <div class="pl-toggle-track" [class.pl-toggle-on]="inStockOnly"></div>
              </div>
            </div>

            <div class="pl-filter-sep"></div>

            <!-- Ordenação -->
            <div class="pl-filter-section">
              <p class="pl-filter-label">{{ 'PRODUCT.LIST.SORT_BY' | translate }}</p>
              <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
                <mat-select [(ngModel)]="sortBy" (ngModelChange)="onFilterChange()">
                  <mat-option value="">{{ 'PRODUCT.LIST.RELEVANCE' | translate }}</mat-option>
                  <mat-option value="price">{{ 'PRODUCT.LIST.PRICE_ASC' | translate }}</mat-option>
                  <mat-option value="price_desc">{{ 'PRODUCT.LIST.PRICE_DESC' | translate }}</mat-option>
                  <mat-option value="sold">{{ 'PRODUCT.LIST.BEST_SELLING' | translate }}</mat-option>
                  <mat-option value="rating">{{ 'PRODUCT.LIST.TOP_RATED' | translate }}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

          </div>
        </aside>

        <!-- ── Conteúdo principal ─────────────────────────────────────────── -->
        <div class="flex-1 min-w-0">

          <!-- Cabeçalho de resultados -->
          <div class="pl-results-header">
            <h1 class="pl-results-title">
              {{ selectedCategoryName() || ('PRODUCT.LIST.TITLE' | translate) }}
            </h1>
            @if (!isLoading()) {
              <span class="pl-results-count">
                @if (useCursor()) {
                  {{ items().length }} {{ 'PRODUCT.LIST.RESULTS' | translate }}
                } @else {
                  {{ totalCount() }} {{ 'PRODUCT.LIST.RESULTS' | translate }}
                }
              </span>
            }
          </div>

          <!-- Loading skeleton -->
          @if (isLoading() && items().length === 0) {
            <div class="pl-grid">
              @for (i of skeletons; track i) {
                <div class="pl-skeleton-card">
                  <div class="pl-skeleton-img skeleton"></div>
                  <div class="p-3 space-y-2">
                    <div class="skeleton rounded" style="height:13px;width:72%"></div>
                    <div class="skeleton rounded" style="height:17px;width:48%"></div>
                    <div class="skeleton rounded" style="height:11px;width:100%"></div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Grid de produtos -->
          @if (items().length > 0) {
            <div class="pl-grid">
              @for (product of items(); track product.id) {
                <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
              }
            </div>

            <!-- Paginação offset -->
            @if (!useCursor()) {
              <div class="pl-pagination">
                @if (currentPage > 1) {
                  <button class="pl-page-btn" (click)="changePage(currentPage - 1)">
                    <mat-icon>chevron_left</mat-icon>
                  </button>
                }
                <span class="pl-page-label">{{ currentPage }} / {{ totalPages() }}</span>
                @if (currentPage < totalPages()) {
                  <button class="pl-page-btn" (click)="changePage(currentPage + 1)">
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                }
              </div>
            }

            <!-- Load more (cursor) -->
            @if (useCursor()) {
              <div class="pl-load-more-row">
                @if (hasMore()) {
                  <button class="pl-load-more-btn" [disabled]="isLoading()" (click)="loadMore()">
                    @if (isLoading()) {
                      <mat-spinner diameter="17" class="inline-block"></mat-spinner>
                      {{ 'PRODUCT.LIST.LOADING' | translate }}
                    } @else {
                      {{ 'PRODUCT.LIST.LOAD_MORE' | translate }}
                    }
                  </button>
                } @else {
                  <span class="pl-no-more">{{ 'PRODUCT.LIST.NO_MORE' | translate }}</span>
                }
              </div>
            }
          }

          <!-- Estado vazio -->
          @if (!isLoading() && items().length === 0) {
            <div class="pl-empty">
              <div class="pl-empty-ring">
                <mat-icon>search_off</mat-icon>
              </div>
              <h3 class="pl-empty-title">{{ 'PRODUCT.LIST.NO_RESULTS' | translate }}</h3>
              <p class="pl-empty-sub">Tente outros termos ou remova alguns filtros.</p>
              @if (hasActiveFilters()) {
                <button class="pl-empty-action" (click)="clearFilters()">
                  {{ 'PRODUCT.LIST.CLEAR_FILTERS' | translate }}
                </button>
              }
            </div>
          }

        </div>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  // Cursor mode: ativo quando não há sortBy custom
  readonly useCursor = computed(() => !this.sortBy);

  readonly isLoading = computed(() =>
    this.useCursor() ? this.productService.cursorLoading() : this.productService.loading()
  );
  readonly items = computed<ProductSummaryDto[]>(() =>
    this.useCursor()
      ? this.productService.cursorItems()
      : (this.productService.products()?.items ?? [])
  );
  readonly hasMore = this.productService.cursorHasMore;
  readonly totalCount = this.productService.totalCount;
  readonly totalPages = computed(() => {
    const p = this.productService.products();
    return p ? p.totalPages : 1;
  });
  readonly hierarchy = this.categoryService.hierarchy;

  readonly selectedCategoryName = computed(() => {
    if (!this.selectedCategory) return '';
    const all = this.flattenCategories(this.hierarchy());
    return all.find(c => c.id === this.selectedCategory)?.name ?? '';
  });

  readonly hasActiveFilters = computed(() =>
    !!this.selectedCategory || !!this.searchQuery ||
    this.priceMin !== null || this.priceMax !== null ||
    this.ratingMin !== null || this.inStockOnly
  );

  readonly skeletons = [1, 2, 3, 4, 5, 6, 7, 8];

  searchQuery = '';
  selectedCategory = '';
  sortBy = '';
  currentPage = 1;
  pageSize = 20;
  priceMin: number | null = null;
  priceMax: number | null = null;
  ratingMin: number | null = null;
  inStockOnly = false;

  ngOnInit(): void {
    this.categoryService.getCategoriesHierarchy(true).subscribe();

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] ?? '';
      this.selectedCategory = params['categoryId'] ?? '';
      this.sortBy = params['sortBy'] ?? '';
      this.currentPage = Number(params['page'] ?? 1);
      this.pageSize = Number(params['pageSize'] ?? 20);
      this.priceMin = params['priceMin'] ? Number(params['priceMin']) : null;
      this.priceMax = params['priceMax'] ? Number(params['priceMax']) : null;
      this.ratingMin = params['ratingMin'] ? Number(params['ratingMin']) : null;
      this.inStockOnly = params['inStockOnly'] === 'true';
      this.loadProducts();
    });
  }

  selectCategory(id: string): void {
    this.selectedCategory = id;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  selectRating(star: number): void {
    this.ratingMin = this.ratingMin === star ? null : star;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updateQueryParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadMore(): void {
    const params = this.buildCursorParams();
    this.productService.loadMoreCursor(params).subscribe({
      error: () => this.snackBar.open(this.translate.instant('PRODUCT.LIST.ERROR_LOAD_MORE'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
    });
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.priceMin = null;
    this.priceMax = null;
    this.ratingMin = null;
    this.inStockOnly = false;
    this.sortBy = '';
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onAddToCart(product: ProductSummaryDto): void {
    this.snackBar.open(
      this.translate.instant('CART.PRODUCT_ADDED', { name: product.name }),
      this.translate.instant('CART.VIEW_CART'),
      { duration: 3000, panelClass: 'snackbar-success' }
    );
  }

  private loadProducts(): void {
    if (this.useCursor()) {
      this.productService.resetCursor();
      this.productService.getProductsCursor(this.buildCursorParams()).subscribe({
        error: () => this.snackBar.open(this.translate.instant('PRODUCT.LIST.ERROR_LOAD'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
      });
    } else {
      this.loadProductsOffset();
    }
  }

  private buildCursorParams(): Omit<GetProductsCursorParams, 'cursor'> {
    return {
      pageSize: 20,
      search: this.searchQuery || undefined,
      categoryId: this.selectedCategory || undefined,
      priceMin: this.priceMin ?? undefined,
      priceMax: this.priceMax ?? undefined,
      ratingMin: this.ratingMin ?? undefined,
      inStockOnly: this.inStockOnly || undefined,
    };
  }

  private loadProductsOffset(): void {
    const sortDescending = this.sortBy === 'price_desc';
    const sortByField = this.sortBy === 'price_desc' ? 'price' : (this.sortBy || undefined);

    const params: GetProductsParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery || undefined,
      categoryId: this.selectedCategory || undefined,
      isActive: true,
      sortBy: sortByField,
      sortDescending,
      priceMin: this.priceMin ?? undefined,
      priceMax: this.priceMax ?? undefined,
      ratingMin: this.ratingMin ?? undefined,
      inStockOnly: this.inStockOnly || undefined,
    };

    this.productService.getProducts(params).subscribe({
      error: () => this.snackBar.open(this.translate.instant('PRODUCT.LIST.ERROR_LOAD'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
    });
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery || null,
        categoryId: this.selectedCategory || null,
        sortBy: this.sortBy || null,
        page: (!this.sortBy && this.currentPage > 1) ? this.currentPage : null,
        pageSize: this.pageSize !== 20 ? this.pageSize : null,
        priceMin: this.priceMin ?? null,
        priceMax: this.priceMax ?? null,
        ratingMin: this.ratingMin ?? null,
        inStockOnly: this.inStockOnly || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private flattenCategories(categories: CategoryDto[]): CategoryDto[] {
    const result: CategoryDto[] = [];
    for (const cat of categories) {
      result.push(cat);
      if (cat.children?.length) {
        result.push(...this.flattenCategories(cat.children));
      }
    }
    return result;
  }
}
