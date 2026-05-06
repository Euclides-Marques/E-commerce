import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductSummaryDto, GetProductsParams } from '../../../core/models/product.model';

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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe,
    ProductCardComponent,
  ],
  template: `
    <div class="flex gap-6 animate-fade-in">
      <!-- Filtros -->
      <aside class="w-64 hidden md:block shrink-0">
        <div class="bg-white rounded-lg shadow-sm p-4 sticky top-4">
          <h3 class="font-semibold text-gray-800 mb-4">{{ 'PRODUCT.LIST.FILTERS' | translate }}</h3>

          <mat-form-field class="w-full" appearance="outline">
            <mat-label>{{ 'PRODUCT.LIST.CATEGORY' | translate }}</mat-label>
            <mat-select [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()">
              <mat-option value="">{{ 'PRODUCT.LIST.ALL_CATEGORIES' | translate }}</mat-option>
              @for (cat of categories(); track cat.id) {
                <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field class="w-full mt-2" appearance="outline">
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
      </aside>

      <!-- Produtos -->
      <div class="flex-1 min-w-0">
        <!-- Barra de busca -->
        <div class="flex items-center gap-3 mb-4">
          <mat-form-field class="flex-1" appearance="outline">
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
            {{ 'PRODUCT.LIST.TITLE' | translate }}
          </h1>
          @if (!loading()) {
            <span class="text-sm text-gray-500">
              {{ totalCount() }} {{ 'PRODUCT.LIST.RESULTS' | translate }}
            </span>
          }
        </div>

        <!-- Loading -->
        @if (loading()) {
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

        <!-- Produtos -->
        @if (!loading()) {
          @if (items().length > 0) {
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              @for (product of items(); track product.id) {
                <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
              }
            </div>

            <!-- Paginação -->
            <mat-paginator
              class="mt-6 bg-white rounded-lg shadow-sm"
              [length]="totalCount()"
              [pageSize]="pageSize"
              [pageIndex]="currentPage - 1"
              [pageSizeOptions]="[20, 40, 60]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          } @else {
            <div class="text-center py-16 text-gray-400">
              <mat-icon class="text-6xl mb-4">search_off</mat-icon>
              <p class="text-lg">{{ 'PRODUCT.LIST.NO_RESULTS' | translate }}</p>
            </div>
          }
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

  readonly loading = this.productService.loading;
  readonly totalCount = this.productService.totalCount;
  readonly items = computed(() => this.productService.products()?.items ?? []);
  readonly categories = this.categoryService.categories;

  readonly skeletons = [1, 2, 3, 4, 5, 6, 7, 8];

  searchQuery = '';
  selectedCategory = '';
  sortBy = '';
  currentPage = 1;
  pageSize = 20;

  ngOnInit(): void {
    this.categoryService.getCategories(true).subscribe();

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] ?? '';
      this.selectedCategory = params['categoryId'] ?? '';
      this.sortBy = params['sortBy'] ?? '';
      this.currentPage = Number(params['page'] ?? 1);
      this.pageSize = Number(params['pageSize'] ?? 20);
      this.loadProducts();
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.updateQueryParams();
  }

  onAddToCart(product: ProductSummaryDto): void {
    this.snackBar.open(
      `"${product.name}" adicionado ao carrinho`,
      'Ver carrinho',
      { duration: 3000, panelClass: 'snackbar-success' }
    );
  }

  private loadProducts(): void {
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
    };

    this.productService.getProducts(params).subscribe({
      error: () => this.snackBar.open('Erro ao carregar produtos.', 'Fechar', { duration: 3000 }),
    });
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery || null,
        categoryId: this.selectedCategory || null,
        sortBy: this.sortBy || null,
        page: this.currentPage > 1 ? this.currentPage : null,
        pageSize: this.pageSize !== 20 ? this.pageSize : null,
      },
      queryParamsHandling: 'merge',
    });
  }
}
