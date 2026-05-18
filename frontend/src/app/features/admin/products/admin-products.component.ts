import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

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
  styles: [`
    /* ── KPI strip ─────────────────────────────────────────────────── */
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px 20px;
    }
    .kpi-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .kpi-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .kpi-icon--info    { background: var(--color-info-soft);    color: var(--color-info);    }
    .kpi-icon--success { background: var(--color-success-soft); color: var(--color-success); }
    .kpi-icon--neutral { background: var(--bg-surface-soft);    color: var(--text-secondary); }
    .kpi-icon--warning { background: var(--color-warning-soft); color: var(--color-warning); }
    .kpi-value { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-heading); line-height: 1.1; }
    .kpi-label { margin: 4px 0 0; font-size: 12px; color: var(--admin-muted); }

    /* ── Search toolbar ────────────────────────────────────────────── */
    .search-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    .search-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--admin-border);
      border-radius: 8px;
      padding: 0 14px;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }
    .search-wrap:focus-within {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px var(--brand-ring);
    }
    .search-icon { color: var(--admin-muted); font-size: 18px !important; width: 18px !important; height: 18px !important; flex-shrink: 0; }
    .search-input {
      flex: 1;
      background: none;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      padding: 10px 0;
      font-size: 14px;
      color: var(--text-primary);
      font-family: var(--font-sans);
    }
    .search-input:focus,
    .search-input:focus-visible {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    .search-input::placeholder { color: var(--text-placeholder); }
    .search-clear {
      display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; padding: 2px;
      color: var(--admin-muted); border-radius: 4px;
      transition: color 150ms ease, background 150ms ease;
    }
    .search-clear:hover { color: var(--text-primary); background: var(--admin-border); }
    .search-clear mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }

    /* ── Product thumbnail ─────────────────────────────────────────── */
    .prod-thumb {
      width: 44px; height: 44px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid var(--admin-border);
      display: block;
    }
    .prod-thumb-ph {
      width: 44px; height: 44px;
      border-radius: 8px;
      border: 1px solid var(--admin-border);
      background: var(--bg-surface-soft);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-placeholder);
    }
    .prod-thumb-ph mat-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; }

    /* ── Table cell content ────────────────────────────────────────── */
    .prod-name  { font-size: 14px; font-weight: 600; color: var(--text-heading); margin: 0; }
    .prod-sku   { font-size: 11px; color: var(--admin-muted); margin: 3px 0 0; letter-spacing: 0.02em; }
    .prod-price { font-size: 14px; font-weight: 700; color: var(--brand-primary); }

    /* ── Row action buttons ────────────────────────────────────────── */
    .row-actions { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
    .action-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 6px; border: none;
      background: transparent; cursor: pointer;
      color: var(--admin-muted);
      transition: background var(--motion-fast), color var(--motion-fast);
    }
    .action-btn:hover                 { background: var(--bg-surface-soft); color: var(--text-heading);   }
    .action-btn--primary:hover        { background: var(--color-info-soft);  color: var(--color-info);     }
    .action-btn--danger:hover         { background: var(--color-danger-soft); color: var(--color-danger);  }
    .action-btn mat-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; }

    /* ── Featured star ─────────────────────────────────────────────── */
    .star-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 6px; border: none;
      background: transparent; cursor: pointer;
      color: var(--admin-muted);
      transition: background var(--motion-fast), color var(--motion-fast);
    }
    .star-btn:hover { background: #fff8e1; color: #f59e0b; }
    .star-btn--on { color: #f59e0b; }
    .star-btn mat-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; }

    /* ── Empty state ───────────────────────────────────────────────── */
    .empty-icon {
      display: flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border-radius: 16px;
      background: var(--bg-surface-soft); margin: 0 auto 16px;
    }
    .empty-icon mat-icon { font-size: 28px !important; width: 28px !important; height: 28px !important; color: var(--text-placeholder); }
    .empty-title { font-size: 15px; font-weight: 600; color: var(--text-heading); margin: 0 0 6px; }
    .empty-sub   { font-size: 13px; color: var(--admin-muted); margin: 0 0 20px; }

    /* ── Material table overrides ──────────────────────────────────── */
    :host ::ng-deep .products-table { background: transparent; width: 100%; }
    :host ::ng-deep .products-table .mat-mdc-header-row {
      background: var(--bg-surface-soft);
      border-bottom: 1px solid var(--admin-border);
    }
    :host ::ng-deep .products-table .mat-mdc-header-cell {
      color: var(--text-secondary) !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      letter-spacing: 0.06em !important;
      text-transform: uppercase;
      border-bottom: none !important;
    }
    :host ::ng-deep .products-table .mat-mdc-cell {
      border-bottom: 1px solid var(--admin-border) !important;
      color: var(--text-primary);
      font-size: 14px;
    }
    :host ::ng-deep .products-table .mat-mdc-row:last-child .mat-mdc-cell {
      border-bottom: none !important;
    }
    :host ::ng-deep .products-table .mat-mdc-row {
      transition: background var(--motion-fast);
    }
    :host ::ng-deep .products-table .mat-mdc-row:hover .mat-mdc-cell {
      background: var(--bg-surface-soft);
    }

    /* ── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 900px) {
      .kpi-strip { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 500px) {
      .kpi-strip { grid-template-columns: 1fr 1fr; gap: 10px; }
      .kpi-card  { padding: 14px; gap: 10px; }
      .kpi-value { font-size: 20px; }
    }
  `],
  template: `
    <div class="animate-fade-in">

      <!-- Cabeçalho -->
      <div class="admin-page-header">
        <div>
          <h2 class="admin-page-title">{{ 'ADMIN.PRODUCTS.TITLE' | translate }}</h2>
          <p class="admin-page-subtitle">
            {{ totalCount() }} {{ 'ADMIN.PRODUCTS.TOTAL' | translate }}
          </p>
        </div>
        <button class="ui-button ui-button--primary" (click)="openCreateDialog()">
          <mat-icon style="font-size:18px;width:18px;height:18px;line-height:1">add</mat-icon>
          {{ 'ADMIN.PRODUCTS.NEW' | translate }}
        </button>
      </div>

      <!-- KPI strip -->
      <div class="kpi-strip">
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--info"><mat-icon>inventory_2</mat-icon></span>
          <div>
            <p class="kpi-value">{{ totalCount() }}</p>
            <p class="kpi-label">Total de produtos</p>
          </div>
        </div>
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--success"><mat-icon>check_circle</mat-icon></span>
          <div>
            <p class="kpi-value">{{ activeCount() }}</p>
            <p class="kpi-label">Ativos</p>
          </div>
        </div>
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--neutral"><mat-icon>unpublished</mat-icon></span>
          <div>
            <p class="kpi-value">{{ inactiveCount() }}</p>
            <p class="kpi-label">Inativos</p>
          </div>
        </div>
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--warning"><mat-icon>warning_amber</mat-icon></span>
          <div>
            <p class="kpi-value">{{ lowStockCount() }}</p>
            <p class="kpi-label">Estoque baixo</p>
          </div>
        </div>
      </div>

      <!-- Search toolbar -->
      <div class="ui-card search-toolbar">
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            class="search-input"
            type="text"
            placeholder="Buscar por nome, SKU ou categoria…"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
          />
          @if (searchQuery()) {
            <button class="search-clear" type="button" aria-label="Limpar busca"
                    (click)="searchQuery.set('')">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <!-- Tabela -->
      @if (!loading()) {
        <div class="ui-table-wrap">
          <table mat-table [dataSource]="filteredItems()" class="products-table">

            <!-- Imagem -->
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef style="width:72px"></th>
              <td mat-cell *matCellDef="let p">
                @if (p.mainImageUrl) {
                  <img [src]="p.mainImageUrl" [alt]="p.name" class="prod-thumb" loading="lazy" />
                } @else {
                  <div class="prod-thumb-ph"><mat-icon>image</mat-icon></div>
                }
              </td>
            </ng-container>

            <!-- Nome -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.NAME' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <p class="prod-name">{{ p.name }}</p>
                <p class="prod-sku">SKU: {{ p.sku }}</p>
              </td>
            </ng-container>

            <!-- Categoria -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.CATEGORY' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <span class="ui-badge ui-badge--info">{{ p.categoryName }}</span>
              </td>
            </ng-container>

            <!-- Preço -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.PRICE' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <span class="prod-price">{{ p.price | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              </td>
            </ng-container>

            <!-- Estoque -->
            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.STOCK' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <span class="ui-badge"
                  [class.ui-badge--success]="p.stockQuantity > 5"
                  [class.ui-badge--warning]="p.stockQuantity > 0 && p.stockQuantity <= 5"
                  [class.ui-badge--danger]="p.stockQuantity === 0">
                  {{ p.stockQuantity }}
                </span>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.PRODUCTS.COLUMNS.STATUS' | translate }}</th>
              <td mat-cell *matCellDef="let p">
                <span class="ui-badge"
                  [class.ui-badge--success]="p.isActive"
                  [class.ui-badge--neutral]="!p.isActive">
                  {{ p.isActive ? ('ADMIN.PRODUCTS.ACTIVE' | translate) : ('ADMIN.PRODUCTS.INACTIVE' | translate) }}
                </span>
              </td>
            </ng-container>

            <!-- Destaque -->
            <ng-container matColumnDef="featured">
              <th mat-header-cell *matHeaderCellDef style="width:48px" matTooltip="Destaque na home">
                <mat-icon style="font-size:16px;width:16px;height:16px;color:var(--admin-muted)">star</mat-icon>
              </th>
              <td mat-cell *matCellDef="let p">
                <button class="star-btn" [class.star-btn--on]="p.isFeatured"
                        [matTooltip]="p.isFeatured ? 'Remover destaque' : 'Marcar como destaque'"
                        (click)="toggleFeatured(p)" type="button">
                  <mat-icon>{{ p.isFeatured ? 'star' : 'star_outline' }}</mat-icon>
                </button>
              </td>
            </ng-container>

            <!-- Ações -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p">
                <div class="row-actions">
                  <button class="action-btn"
                          [matTooltip]="'ADMIN.PRODUCTS.MANAGE_IMAGES' | translate"
                          (click)="openImagesDialog(p)" type="button">
                    <mat-icon>photo_library</mat-icon>
                  </button>
                  <button class="action-btn action-btn--primary"
                          [matTooltip]="'ADMIN.PRODUCTS.EDIT' | translate"
                          (click)="openEditDialog(p)" type="button">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="action-btn action-btn--danger"
                          [matTooltip]="'ADMIN.PRODUCTS.DELETE' | translate"
                          (click)="confirmDelete(p)" type="button">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          @if (filteredItems().length === 0) {
            <div class="ui-empty-state" style="padding:48px 24px;flex-direction:column">
              <div class="empty-icon"><mat-icon>inventory_2</mat-icon></div>
              <p class="empty-title">
                {{ searchQuery() ? 'Nenhum resultado encontrado' : ('ADMIN.PRODUCTS.EMPTY' | translate) }}
              </p>
              <p class="empty-sub">
                {{ searchQuery() ? 'Tente buscar por um nome ou SKU diferente.' : 'Use o botão "+ Novo Produto" para começar.' }}
              </p>
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

  readonly loading    = this.productService.loading;
  readonly totalCount = this.productService.totalCount;
  readonly items      = signal<ProductSummaryDto[]>([]);
  readonly searchQuery = signal('');

  readonly activeCount   = computed(() => this.items().filter(p => p.isActive).length);
  readonly inactiveCount = computed(() => this.items().filter(p => !p.isActive).length);
  readonly lowStockCount = computed(() => this.items().filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length);
  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.sku          ?? '').toLowerCase().includes(q) ||
      (p.categoryName ?? '').toLowerCase().includes(q)
    );
  });

  readonly displayedColumns = ['image', 'name', 'category', 'price', 'stock', 'status', 'featured', 'actions'];

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe();
    this.loadProducts();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      width: '600px',
      panelClass: 'pfd-panel',
      data: { product: null, categories: this.categoryService.categories() },
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadProducts();
    });
  }

  openEditDialog(product: ProductSummaryDto): void {
    this.productService.getProductById(product.id).subscribe(full => {
      const ref = this.dialog.open(ProductFormDialogComponent, {
        width: '600px',
        panelClass: 'pfd-panel',
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
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '460px',
      panelClass: 'pfd-panel',
      data: {
        title: this.translate.instant('ADMIN.PRODUCTS.DELETE_TITLE'),
        message: this.translate.instant('ADMIN.PRODUCTS.CONFIRM_DELETE_MSG'),
        itemName: product.name,
      } satisfies ConfirmDialogData,
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('ADMIN.PRODUCTS.DELETED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
          this.loadProducts();
        },
        error: () => this.snackBar.open(this.translate.instant('ADMIN.PRODUCTS.ERROR_DELETE'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
      });
    });
  }

  toggleFeatured(product: ProductSummaryDto): void {
    const newValue = !product.isFeatured;
    this.productService.setFeatured(product.id, newValue).subscribe({
      next: updated => {
        this.items.update(list => list.map(p => p.id === updated.id ? { ...p, isFeatured: updated.isFeatured } : p));
        const msg = newValue ? 'Produto marcado como destaque.' : 'Destaque removido do produto.';
        this.snackBar.open(msg, 'Fechar', { duration: 2500, panelClass: newValue ? 'snackbar-success' : undefined });
      },
      error: () => this.snackBar.open('Erro ao atualizar destaque.', 'Fechar', { duration: 3000 }),
    });
  }

  private loadProducts(): void {
    this.productService.getProducts({ pageSize: 100 }).subscribe({
      next: result => this.items.set(result.items),
      error: () => this.snackBar.open(this.translate.instant('ADMIN.PRODUCTS.ERROR_LOAD'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
    });
  }
}
