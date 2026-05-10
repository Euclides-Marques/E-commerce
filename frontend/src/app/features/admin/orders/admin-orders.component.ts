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
  template: `
    <div class="animate-fade-in">

      <!-- Cabeçalho -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ 'ADMIN.ORDERS.TITLE' | translate }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ result()?.totalCount ?? 0 }} {{ 'ADMIN.ORDERS.TOTAL' | translate }}</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-56">
          <mat-label>{{ 'ADMIN.ORDERS.SEARCH' | translate }}</mat-label>
          <input matInput [formControl]="searchCtrl" (keyup.enter)="applyFilter()" />
          <mat-icon matSuffix class="cursor-pointer" (click)="applyFilter()">search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
          <mat-label>{{ 'ADMIN.ORDERS.STATUS' | translate }}</mat-label>
          <mat-select [formControl]="statusCtrl" (selectionChange)="applyFilter()">
            <mat-option value="">{{ 'ADMIN.ORDERS.ALL_STATUSES' | translate }}</mat-option>
            @for (s of statuses; track s.value) {
              <mat-option [value]="s.value">{{ s.labelKey | translate }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
          <mat-label>{{ 'ADMIN.ORDERS.DATE_FROM' | translate }}</mat-label>
          <input matInput type="date" [formControl]="dateFromCtrl" (change)="applyFilter()" />
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
          <mat-label>{{ 'ADMIN.ORDERS.DATE_TO' | translate }}</mat-label>
          <input matInput type="date" [formControl]="dateToCtrl" (change)="applyFilter()" />
        </mat-form-field>

        <button mat-stroked-button (click)="clearFilters()">
          <mat-icon>clear</mat-icon>
          {{ 'ADMIN.ORDERS.CLEAR_FILTERS' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      }

      @if (!loading()) {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table mat-table [dataSource]="orders()" class="w-full">

            <ng-container matColumnDef="orderNumber">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.NUMBER' | translate }}</th>
              <td mat-cell *matCellDef="let o">
                <span class="font-mono text-sm font-medium text-gray-700">#{{ o.orderNumber }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.CUSTOMER' | translate }}</th>
              <td mat-cell *matCellDef="let o">
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ o.userName }}</p>
                  <p class="text-xs text-gray-400">{{ o.userEmail }}</p>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.STATUS' | translate }}</th>
              <td mat-cell *matCellDef="let o">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      [class]="statusClass(o.status)">
                  {{ statusLabel(o.status) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef class="text-center">{{ 'ADMIN.ORDERS.COLUMNS.ITEMS' | translate }}</th>
              <td mat-cell *matCellDef="let o" class="text-center text-sm text-gray-600">{{ o.itemCount }}</td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'ADMIN.ORDERS.COLUMNS.TOTAL' | translate }}</th>
              <td mat-cell *matCellDef="let o" class="text-right font-semibold text-gray-800">
                {{ o.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.ORDERS.COLUMNS.DATE' | translate }}</th>
              <td mat-cell *matCellDef="let o" class="text-sm text-gray-500">
                {{ o.createdAt | date:'dd/MM/yyyy HH:mm':'':'pt-BR' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'ADMIN.ORDERS.COLUMNS.ACTIONS' | translate }}</th>
              <td mat-cell *matCellDef="let o" class="text-right">
                <button mat-icon-button color="primary"
                        [matTooltip]="'ADMIN.ORDERS.UPDATE_STATUS' | translate"
                        (click)="openStatusDialog(o)">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="hover:bg-gray-50 transition-colors"></tr>
          </table>

          @if (orders().length === 0) {
            <div class="text-center py-16 text-gray-400">
              <mat-icon class="text-5xl mb-3">receipt_long</mat-icon>
              <p>{{ 'ADMIN.ORDERS.EMPTY' | translate }}</p>
            </div>
          }

          <mat-paginator
            [length]="result()?.totalCount ?? 0"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
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

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending:   'bg-yellow-100 text-yellow-700',
      Paid:      'bg-blue-100 text-blue-700',
      Shipped:   'bg-indigo-100 text-indigo-700',
      Delivered: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700',
      Refunded:  'bg-gray-100 text-gray-600',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
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
