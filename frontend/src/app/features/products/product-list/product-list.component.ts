import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
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
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSnackBarModule,
    TranslatePipe,
    ProductCardComponent,
  ],
  template: `
    <div class="flex gap-6 animate-fade-in">
      <!-- Filtros -->
      <aside class="w-64 hidden md:block shrink-0">
        <div class="bg-white rounded-lg shadow-sm p-4 sticky top-4 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-800">{{ 'PRODUCT.LIST.FILTERS' | translate }}</h3>
            @if (hasActiveFilters()) {
              <button mat-button color="warn" class="text-xs" (click)="clearFilters()">
                {{ 'PRODUCT.LIST.CLEAR_FILTERS' | translate }}
              </button>
            }
          </div>

          <!-- Categoria hierárquica -->
          <div>
            <p class="text-sm font-medium text-gray-600 mb-2">{{ 'PRODUCT.LIST.CATEGORY' | translate }}</p>
            <div class="space-y-1 max-h-64 overflow-y-auto">
              <button
                class="w-full text-left text-sm px-2 py-1 rounded transition-colors"
                [class.bg-orange-100]="selectedCategory === ''"
                [class.text-orange-700]="selectedCategory === ''"
                [class.font-medium]="selectedCategory === ''"
                [class.hover:bg-gray-100]="selectedCategory !== ''"
                (click)="selectCategory('')">
                {{ 'PRODUCT.LIST.ALL_CATEGORIES' | translate }}
              </button>
              @for (cat of hierarchy(); track cat.id) {
                <button
                  class="w-full text-left text-sm px-2 py-1 rounded transition-colors"
                  [class.bg-orange-100]="selectedCategory === cat.id"
                  [class.text-orange-700]="selectedCategory === cat.id"
                  [class.font-medium]="selectedCategory === cat.id"
                  [class.hover:bg-gray-100]="selectedCategory !== cat.id"
                  (click)="selectCategory(cat.id)">
                  {{ cat.name }}
                </button>
                @for (sub of cat.children; track sub.id) {
                  <button
                    class="w-full text-left text-sm pl-6 pr-2 py-1 rounded transition-colors"
                    [class.bg-orange-100]="selectedCategory === sub.id"
                    [class.text-orange-700]="selectedCategory === sub.id"
                    [class.font-medium]="selectedCategory === sub.id"
                    [class.hover:bg-gray-100]="selectedCategory !== sub.id"
                    (click)="selectCategory(sub.id)">
                    {{ sub.name }}
                  </button>
                }
              }
            </div>
          </div>

          <mat-divider />

          <!-- Faixa de preço -->
          <div>
            <p class="text-sm font-medium text-gray-600 mb-2">{{ 'PRODUCT.LIST.PRICE_RANGE' | translate }}</p>
            <div class="flex gap-2">
              <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
                <mat-label>{{ 'PRODUCT.LIST.PRICE_MIN' | translate }}</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="priceMin" (change)="onFilterChange()" />
              </mat-form-field>
              <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
                <mat-label>{{ 'PRODUCT.LIST.PRICE_MAX' | translate }}</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="priceMax" (change)="onFilterChange()" />
              </mat-form-field>
            </div>
          </div>

          <mat-divider />

          <!-- Avaliação mínima -->
          <div>
            <p class="text-sm font-medium text-gray-600 mb-2">{{ 'PRODUCT.LIST.MIN_RATING' | translate }}</p>
            <div class="flex gap-1">
              @for (star of [1,2,3,4,5]; track star) {
                <button
                  class="flex items-center gap-0.5 px-2 py-1 rounded border text-xs transition-colors"
                  [class.bg-orange-500]="ratingMin === star"
                  [class.text-white]="ratingMin === star"
                  [class.border-orange-500]="ratingMin === star"
                  [class.border-gray-200]="ratingMin !== star"
                  [class.hover:border-orange-300]="ratingMin !== star"
                  (click)="selectRating(star)">
                  {{ star }}★
                </button>
              }
            </div>
          </div>

          <mat-divider />

          <!-- Em estoque -->
          <mat-checkbox [(ngModel)]="inStockOnly" (change)="onFilterChange()" color="primary">
            {{ 'PRODUCT.LIST.IN_STOCK_ONLY' | translate }}
          </mat-checkbox>

          <mat-divider />

          <!-- Ordenação (desativa cursor quando ordenação custom) -->
          <div>
            <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
              <mat-label>{{ 'PRODUCT.LIST.SORT_BY' | translate }}</mat-label>
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

      <!-- Produtos -->
      <div class="flex-1 min-w-0">
        <!-- Barra de busca -->
        <div class="flex items-center gap-3 mb-4">
          <mat-form-field class="flex-1" appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ 'PRODUCT.LIST.SEARCH_PLACEHOLDER' | translate }}</mat-label>
            <input matInput [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" />
            <button matSuffix mat-icon-button (click)="onSearch()">
              <mat-icon>search</mat-icon>
            </button>
          </mat-form-field>
        </div>

        <!-- Cabeçalho de resultados -->
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-bold text-gray-800">
            {{ selectedCategoryName() || ('PRODUCT.LIST.TITLE' | translate) }}
          </h1>
          @if (!isLoading()) {
            <span class="text-sm text-gray-500">
              @if (useCursor()) {
                {{ items().length }} {{ 'PRODUCT.LIST.RESULTS' | translate }}
              } @else {
                {{ totalCount() }} {{ 'PRODUCT.LIST.RESULTS' | translate }}
              }
            </span>
          }
        </div>

        <!-- Loading inicial -->
        @if (isLoading() && items().length === 0) {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            @for (i of skeletons; track i) {
              <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="h-48 skeleton"></div>
                <div class="p-3 space-y-2">
                  <div class="h-4 skeleton w-3/4"></div>
                  <div class="h-5 skeleton w-1/2"></div>
                  <div class="h-3 skeleton w-full"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Grid de produtos -->
        @if (items().length > 0) {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            @for (product of items(); track product.id) {
              <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
            }
          </div>

          <!-- Paginação offset (quando ordenação custom) -->
          @if (!useCursor()) {
            <div class="flex justify-center mt-6 gap-2">
              @if (currentPage > 1) {
                <button mat-stroked-button (click)="changePage(currentPage - 1)">
                  <mat-icon>chevron_left</mat-icon>
                </button>
              }
              <span class="flex items-center px-4 text-sm text-gray-600">
                {{ currentPage }} / {{ totalPages() }}
              </span>
              @if (currentPage < totalPages()) {
                <button mat-stroked-button (click)="changePage(currentPage + 1)">
                  <mat-icon>chevron_right</mat-icon>
                </button>
              }
            </div>
          }

          <!-- Carregar mais (cursor) -->
          @if (useCursor()) {
            <div class="flex justify-center mt-8">
              @if (hasMore()) {
                <button
                  mat-flat-button
                  color="primary"
                  class="px-8"
                  [disabled]="isLoading()"
                  (click)="loadMore()">
                  @if (isLoading()) {
                    <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                    {{ 'PRODUCT.LIST.LOADING' | translate }}
                  } @else {
                    {{ 'PRODUCT.LIST.LOAD_MORE' | translate }}
                  }
                </button>
              } @else {
                <p class="text-sm text-gray-400">{{ 'PRODUCT.LIST.NO_MORE' | translate }}</p>
              }
            </div>
          }
        }

        <!-- Sem resultados -->
        @if (!isLoading() && items().length === 0) {
          <div class="text-center py-16 text-gray-400">
            <mat-icon class="text-6xl mb-4">search_off</mat-icon>
            <p class="text-lg">{{ 'PRODUCT.LIST.NO_RESULTS' | translate }}</p>
          </div>
        }
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
