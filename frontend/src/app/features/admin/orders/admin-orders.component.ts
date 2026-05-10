import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../../core/services/admin.service';
import { AdminOrderSummaryDto } from '../../../core/models/admin.model';
import { PaginatedResult } from '../../../core/models/paginated-result.model';

// ── Dialog de status ──────────────────────────────────────────────────────────

interface StatusDialogData { currentStatus: string; orderId: string; }

@Component({
  selector: 'app-update-status-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule,
            MatSelectModule, MatDialogModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'ADMIN.ORDERS.UPDATE_STATUS' | translate }}</h2>
    <mat-dialog-content class="pt-2" style="min-width:360px">
      <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
        <mat-label>{{ 'ADMIN.ORDERS.STATUS' | translate }}</mat-label>
        <mat-select [(value)]="selected">
          @for (s of statuses; track s.value) {
            <mat-option [value]="s.value">{{ s.labelKey | translate }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2 pb-4 pr-4">
      <button mat-button (click)="dialogRef.close(null)">{{ 'ADMIN.ORDERS.CANCEL' | translate }}</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(selected)">
        {{ 'ADMIN.ORDERS.CONFIRM' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class UpdateStatusDialogComponent {
  readonly dialogRef = inject(MatDialogRef<UpdateStatusDialogComponent>);
  readonly data: StatusDialogData = inject(MAT_DIALOG_DATA);
  selected = this.data.currentStatus;
  readonly statuses = [
    { value: 'Pending',   labelKey: 'ORDER.STATUS.PENDING' },
    { value: 'Paid',      labelKey: 'ORDER.STATUS.PAID' },
    { value: 'Shipped',   labelKey: 'ORDER.STATUS.SHIPPED' },
    { value: 'Delivered', labelKey: 'ORDER.STATUS.DELIVERED' },
    { value: 'Cancelled', labelKey: 'ORDER.STATUS.CANCELLED' },
    { value: 'Refunded',  labelKey: 'ORDER.STATUS.REFUNDED' },
  ];
}

// ── Lista de pedidos ──────────────────────────────────────────────────────────

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  styles: [`
    /* ── Filter toolbar ───────────────────────────────────────────────── */
    .filter-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      margin-bottom: 20px;
    }

    .filter-search-wrap {
      flex: 1;
      min-width: 180px;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--admin-border);
      border-radius: 8px;
      padding: 0 12px;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }
    .filter-search-wrap--focused {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px var(--brand-ring);
    }
    .filter-search-icon {
      color: var(--admin-muted);
      font-size: 17px !important;
      width: 17px !important;
      height: 17px !important;
      flex-shrink: 0;
    }
    .filter-search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none !important;
      box-shadow: none !important;
      font-size: 14px;
      color: var(--text-primary);
      font-family: var(--font-sans);
    }
    .filter-search-input:focus,
    .filter-search-input:focus-visible {
      outline: none !important;
      box-shadow: none !important;
    }
    .filter-search-input::placeholder { color: var(--text-placeholder); }
    .filter-search-clear {
      display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; padding: 2px;
      color: var(--admin-muted); border-radius: 4px;
      transition: color 150ms ease, background 150ms ease;
    }
    .filter-search-clear:hover { color: var(--text-primary); background: var(--admin-border); }
    .filter-search-clear mat-icon { font-size: 15px !important; width: 15px !important; height: 15px !important; }

    .filter-sep {
      width: 1px;
      height: 28px;
      background: var(--admin-border);
      flex-shrink: 0;
    }

    .filter-select { width: 160px; flex-shrink: 0; }
    .filter-date   { width: 148px; flex-shrink: 0; }

    .filter-clear-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 12px;
      background: none;
      border: 1px solid var(--admin-border);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
      font-family: var(--font-sans);
    }
    .filter-clear-btn mat-icon { font-size: 15px !important; width: 15px !important; height: 15px !important; }
    .filter-clear-btn:hover {
      border-color: var(--border-strong);
      color: var(--text-heading);
      background: var(--bg-surface-soft);
    }

    /* ── Table cells ──────────────────────────────────────────────────── */
    .order-number {
      font-family: 'SF Mono', 'Fira Code', 'Roboto Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-heading);
      letter-spacing: 0.01em;
    }

    .customer-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .customer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F04E23 0%, #F97316 100%);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      letter-spacing: -0.2px;
    }
    .customer-name  { font-size: 13.5px; font-weight: 500; color: var(--text-heading); margin: 0 0 1px; line-height: 1.3; }
    .customer-email { font-size: 11.5px; color: var(--admin-muted); margin: 0; line-height: 1.3; }

    .badge-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }

    .items-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--admin-border);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      padding: 0 6px;
    }

    .order-total {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-heading);
      letter-spacing: -0.2px;
    }

    .order-date {
      display: block;
      font-size: 13px;
      color: var(--text-heading);
      font-weight: 500;
      line-height: 1.3;
    }
    .order-time {
      display: block;
      font-size: 11px;
      color: var(--admin-muted);
      line-height: 1.3;
    }

    /* ── Action button ────────────────────────────────────────────────── */
    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: none;
      border: 1px solid transparent;
      cursor: pointer;
      color: var(--admin-muted);
      transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
    }
    .action-btn mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
    .action-btn:hover {
      background: var(--admin-accent-soft);
      border-color: rgba(240,78,35,.16);
      color: var(--brand-primary);
    }

    /* ── Table mat overrides ──────────────────────────────────────────── */
    :host ::ng-deep .orders-table .mat-mdc-header-cell {
      background: var(--bg-surface-soft);
      color: var(--text-secondary);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .05em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--admin-border);
      padding: 13px 16px;
    }
    :host ::ng-deep .orders-table .mat-mdc-cell {
      padding: 14px 16px;
      border-bottom: 1px solid var(--admin-border);
      vertical-align: middle;
    }
    :host ::ng-deep .orders-table .mat-mdc-row {
      transition: background 130ms ease;
    }
    :host ::ng-deep .orders-table .mat-mdc-row:hover {
      background: var(--bg-surface-soft);
    }
    :host ::ng-deep .orders-table .mat-mdc-row:last-child .mat-mdc-cell {
      border-bottom: none;
    }

    /* ── Empty state ──────────────────────────────────────────────────── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 56px 24px;
      text-align: center;
    }
    .empty-icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--admin-border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .empty-icon {
      font-size: 26px !important;
      width: 26px !important;
      height: 26px !important;
      color: var(--text-placeholder) !important;
    }
    .empty-title {
      margin: 0 0 6px;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-heading);
      letter-spacing: -0.2px;
    }
    .empty-desc {
      margin: 0;
      font-size: 13px;
      color: var(--admin-muted);
      line-height: 1.55;
      max-width: 280px;
    }

    /* ── Table footer (paginator) ─────────────────────────────────────── */
    .table-footer {
      border-top: 1px solid var(--admin-border);
      background: var(--bg-surface-soft);
    }
    :host ::ng-deep .table-footer .mat-mdc-paginator {
      background: transparent;
    }

    /* ── Responsive ───────────────────────────────────────────────────── */
    @media (max-width: 767px) {
      .filter-toolbar { flex-direction: column; align-items: stretch; }
      .filter-sep     { display: none; }
      .filter-select,
      .filter-date    { width: 100%; }
    }
  `],
  template: `
    <div class="animate-fade-in">

      <!-- ── Cabeçalho ──────────────────────────────────────────────── -->
      <div class="admin-page-header">
        <div>
          <h2 class="admin-page-title">{{ 'ADMIN.ORDERS.TITLE' | translate }}</h2>
          <p class="admin-page-subtitle">
            {{ result()?.totalCount ?? 0 }} {{ 'ADMIN.ORDERS.TOTAL' | translate }}
          </p>
        </div>
      </div>

      <!-- ── Toolbar de filtros ─────────────────────────────────────── -->
      <div class="ui-card filter-toolbar">

        <div class="filter-search-wrap" [class.filter-search-wrap--focused]="searchFocused">
          <mat-icon class="filter-search-icon">search</mat-icon>
          <input
            class="filter-search-input"
            [placeholder]="'ADMIN.ORDERS.SEARCH' | translate"
            [formControl]="searchCtrl"
            (keyup.enter)="applyFilter()"
            (focus)="searchFocused = true"
            (blur)="searchFocused = false"
          />
          @if (searchCtrl.value) {
            <button class="filter-search-clear" (click)="searchCtrl.reset(''); applyFilter()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>

        <span class="filter-sep" aria-hidden="true"></span>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter-select">
          <mat-label>{{ 'ADMIN.ORDERS.STATUS' | translate }}</mat-label>
          <mat-select [formControl]="statusCtrl" (selectionChange)="applyFilter()">
            <mat-option value="">{{ 'ADMIN.ORDERS.ALL_STATUSES' | translate }}</mat-option>
            @for (s of statuses; track s.value) {
              <mat-option [value]="s.value">{{ s.labelKey | translate }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter-date">
          <mat-label>{{ 'ADMIN.ORDERS.DATE_FROM' | translate }}</mat-label>
          <input matInput type="date" [formControl]="dateFromCtrl" (change)="applyFilter()" />
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter-date">
          <mat-label>{{ 'ADMIN.ORDERS.DATE_TO' | translate }}</mat-label>
          <input matInput type="date" [formControl]="dateToCtrl" (change)="applyFilter()" />
        </mat-form-field>

        @if (hasActiveFilters) {
          <button class="filter-clear-btn" (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
            {{ 'ADMIN.ORDERS.CLEAR_FILTERS' | translate }}
          </button>
        }

      </div>

      <!-- ── Loading ─────────────────────────────────────────────────── -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <!-- ── Tabela ──────────────────────────────────────────────────── -->
      @if (!loading()) {
        <div class="ui-table-wrap">

          <table mat-table [dataSource]="orders()" class="orders-table w-full">

            <!-- Número do pedido -->
            <ng-container matColumnDef="orderNumber">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.NUMBER' | translate }}</th>
              <td mat-cell *matCellDef="let o">
                <span class="order-number">#{{ o.orderNumber }}</span>
              </td>
            </ng-container>

            <!-- Cliente -->
            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.CUSTOMER' | translate }}</th>
              <td mat-cell *matCellDef="let o">
                <div class="customer-cell">
                  <div class="customer-avatar">{{ o.userName?.charAt(0)?.toUpperCase() }}</div>
                  <div>
                    <p class="customer-name">{{ o.userName }}</p>
                    <p class="customer-email">{{ o.userEmail }}</p>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.STATUS' | translate }}</th>
              <td mat-cell *matCellDef="let o">
                <span class="ui-badge" [class]="statusBadgeClass(o.status)">
                  <span class="badge-dot"></span>
                  {{ statusLabel(o.status) }}
                </span>
              </td>
            </ng-container>

            <!-- Itens -->
            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.ITEMS' | translate }}</th>
              <td mat-cell *matCellDef="let o">
                <span class="items-count">{{ o.itemCount }}</span>
              </td>
            </ng-container>

            <!-- Total -->
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.TOTAL' | translate }}</th>
              <td mat-cell *matCellDef="let o">
                <span class="order-total">{{ o.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              </td>
            </ng-container>

            <!-- Data -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.DATE' | translate }}</th>
              <td mat-cell *matCellDef="let o">
                <span class="order-date">{{ o.createdAt | date:'dd/MM/yyyy':'':'pt-BR' }}</span>
                <span class="order-time">{{ o.createdAt | date:'HH:mm':'':'pt-BR' }}</span>
              </td>
            </ng-container>

            <!-- Ações -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let o">
                <button class="action-btn"
                        [matTooltip]="'ADMIN.ORDERS.UPDATE_STATUS' | translate"
                        (click)="openStatusDialog(o)">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <!-- Empty state -->
          @if (orders().length === 0) {
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <mat-icon class="empty-icon">receipt_long</mat-icon>
              </div>
              <h3 class="empty-title">{{ 'ADMIN.ORDERS.EMPTY' | translate }}</h3>
              <p class="empty-desc">Tente ajustar os filtros para encontrar o que procura.</p>
            </div>
          }

          <!-- Paginador -->
          <div class="table-footer">
            <mat-paginator
              [length]="result()?.totalCount ?? 0"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          </div>

        </div>
      }

    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly result = signal<PaginatedResult<AdminOrderSummaryDto> | null>(null);
  readonly orders = signal<AdminOrderSummaryDto[]>([]);

  readonly searchCtrl   = this.fb.control('');
  readonly statusCtrl   = this.fb.control('');
  readonly dateFromCtrl = this.fb.control('');
  readonly dateToCtrl   = this.fb.control('');

  searchFocused = false;
  page = 1;
  pageSize = 20;

  readonly displayedColumns = ['orderNumber', 'customer', 'status', 'items', 'total', 'date', 'actions'];

  readonly statuses = [
    { value: 'Pending',   labelKey: 'ORDER.STATUS.PENDING' },
    { value: 'Paid',      labelKey: 'ORDER.STATUS.PAID' },
    { value: 'Shipped',   labelKey: 'ORDER.STATUS.SHIPPED' },
    { value: 'Delivered', labelKey: 'ORDER.STATUS.DELIVERED' },
    { value: 'Cancelled', labelKey: 'ORDER.STATUS.CANCELLED' },
    { value: 'Refunded',  labelKey: 'ORDER.STATUS.REFUNDED' },
  ];

  get hasActiveFilters(): boolean {
    return !!(this.searchCtrl.value || this.statusCtrl.value ||
              this.dateFromCtrl.value || this.dateToCtrl.value);
  }

  ngOnInit(): void {
    this.load();
  }

  applyFilter(): void {
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.searchCtrl.reset('');
    this.statusCtrl.reset('');
    this.dateFromCtrl.reset('');
    this.dateToCtrl.reset('');
    this.page = 1;
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }

  openStatusDialog(order: AdminOrderSummaryDto): void {
    const ref = this.dialog.open(UpdateStatusDialogComponent, {
      width: '420px',
      data: { currentStatus: order.status, orderId: order.id } satisfies StatusDialogData,
    });
    ref.afterClosed().subscribe((newStatus: string | null) => {
      if (!newStatus || newStatus === order.status) return;
      this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('ADMIN.ORDERS.STATUS_UPDATED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open(this.translate.instant('ADMIN.ORDERS.ERROR_UPDATE_STATUS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
      });
    });
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      Pending:   'ui-badge--warning',
      Paid:      'ui-badge--info',
      Shipped:   'ui-badge--violet',
      Delivered: 'ui-badge--success',
      Cancelled: 'ui-badge--danger',
      Refunded:  'ui-badge--neutral',
    };
    return map[status] ?? 'ui-badge--neutral';
  }

  statusLabel(status: string): string {
    return this.translate.instant(`ORDER.STATUS.${status.toUpperCase()}`);
  }

  private load(): void {
    this.loading.set(true);
    this.adminService.getOrders({
      search:   this.searchCtrl.value ?? undefined,
      status:   this.statusCtrl.value ?? undefined,
      dateFrom: this.dateFromCtrl.value ?? undefined,
      dateTo:   this.dateToCtrl.value ?? undefined,
      page:     this.page,
      pageSize: this.pageSize,
    }).subscribe({
      next: data => {
        this.result.set(data);
        this.orders.set(data.items);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open(this.translate.instant('ADMIN.ORDERS.ERROR_LOAD'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.loading.set(false);
      },
    });
  }
}
