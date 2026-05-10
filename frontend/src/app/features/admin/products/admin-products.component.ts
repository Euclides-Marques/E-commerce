import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductSummaryDto } from '../../../core/models/product.model';
import { ProductFormDialogComponent } from './product-form-dialog.component';
import { ProductImagesDialogComponent } from './product-images-dialog.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    TranslatePipe,
  ],
  template: `
    <div class="animate-fade-in">
      <!-- Cabeçalho -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ 'ADMIN.PRODUCTS.TITLE' | translate }}</h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ totalCount() }} {{ 'ADMIN.PRODUCTS.TOTAL' | translate }}
          </p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          {{ 'ADMIN.PRODUCTS.NEW' | translate }}
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      }

      <!-- Tabela -->
      @if (!loading()) {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table mat-table [dataSource]="items()" class="w-full">

            <!-- Imagem -->
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef class="w-16"></th>
              <td mat-cell *matCellDef="let p">
                @if (p.mainImageUrl) {
                  <img [src]="p.mainImageUrl" [alt]="p.name"
                       class="w-12 h-12 object-cover rounded border" />
                } @else {
                  <div class="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                    <mat-icon class="text-gray-300">image</mat-icon>
                  </div>
                }
              </td>
            </ng-container>

            <!-- Nome -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.NAME' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <div>
                  <p class="font-medium text-gray-800">{{ p.name }}</p>
                  <p class="text-xs text-gray-400">SKU: {{ p.sku }}</p>
                </div>
              </td>
            </ng-container>

            <!-- Categoria -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.CATEGORY' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <span class="text-sm text-gray-600">{{ p.categoryName }}</span>
              </td>
            </ng-container>

            <!-- Preço -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.PRICE' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <span class="font-semibold text-primary-500">
                  {{ p.price | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
              </td>
            </ng-container>

            <!-- Estoque -->
            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.STOCK' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <span [class]="p.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'" class="font-medium">
                  {{ p.stockQuantity }}
                </span>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.STATUS' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  [class]="p.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'">
                  {{ p.isActive ? ('ADMIN.PRODUCTS.ACTIVE' | translate) : ('ADMIN.PRODUCTS.INACTIVE' | translate) }}
                </span>
              </td>
            </ng-container>

            <!-- Ações -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'ADMIN.PRODUCTS.COLUMNS.ACTIONS' | translate }}</th>
              <td mat-cell *matCellDef="let p" class="text-right">
                <button mat-icon-button [matTooltip]="'ADMIN.PRODUCTS.MANAGE_IMAGES' | translate"
                        (click)="openImagesDialog(p)">
                  <mat-icon>photo_library</mat-icon>
                </button>
                <button mat-icon-button color="primary" [matTooltip]="'ADMIN.PRODUCTS.EDIT' | translate"
                        (click)="openEditDialog(p)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" [matTooltip]="'ADMIN.PRODUCTS.DELETE' | translate"
                        (click)="confirmDelete(p)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="hover:bg-gray-50 transition-colors"></tr>
          </table>

          @if (items().length === 0) {
            <div class="text-center py-16 text-gray-400">
              <mat-icon class="text-5xl mb-3">inventory_2</mat-icon>
              <p>{{ 'ADMIN.PRODUCTS.EMPTY' | translate }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AdminProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly loading = this.productService.loading;
  readonly totalCount = this.productService.totalCount;
  readonly items = signal<ProductSummaryDto[]>([]);

  readonly displayedColumns = ['image', 'name', 'category', 'price', 'stock', 'status', 'actions'];

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe();
    this.loadProducts();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      width: '640px',
      data: { product: null, categories: this.categoryService.categories() },
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadProducts();
    });
  }

  openEditDialog(product: ProductSummaryDto): void {
    this.productService.getProductById(product.id).subscribe(full => {
      const ref = this.dialog.open(ProductFormDialogComponent, {
        width: '640px',
        data: { product: full, categories: this.categoryService.categories() },
      });
      ref.afterClosed().subscribe(result => {
        if (result) this.loadProducts();
      });
    });
  }

  openImagesDialog(product: ProductSummaryDto): void {
    this.productService.getProductById(product.id).subscribe(full => {
      const ref = this.dialog.open(ProductImagesDialogComponent, {
        width: '720px',
        data: { product: full },
      });
      ref.afterClosed().subscribe(changed => {
        if (changed) this.loadProducts();
      });
    });
  }

  confirmDelete(product: ProductSummaryDto): void {
    if (!confirm(this.translate.instant('ADMIN.PRODUCTS.CONFIRM_DELETE', { name: product.name }))) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('ADMIN.PRODUCTS.DELETED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.loadProducts();
      },
      error: () => this.snackBar.open(this.translate.instant('ADMIN.PRODUCTS.ERROR_DELETE'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
    });
  }

  private loadProducts(): void {
    this.productService.getProducts({ pageSize: 100 }).subscribe({
      next: result => this.items.set(result.items),
      error: () => this.snackBar.open(this.translate.instant('ADMIN.PRODUCTS.ERROR_LOAD'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
    });
  }
}
