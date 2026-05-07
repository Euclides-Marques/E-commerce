import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardSummaryDto } from '../../../core/models/admin.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    TranslatePipe,
  ],
  template: `
    <div class="animate-fade-in">

      <!-- Cabeçalho -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ 'ADMIN.DASHBOARD.TITLE' | translate }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ 'ADMIN.DASHBOARD.SUBTITLE' | translate }}</p>
        </div>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
          <mat-label>{{ 'ADMIN.DASHBOARD.PERIOD' | translate }}</mat-label>
          <mat-select [value]="daysBack()" (selectionChange)="changePeriod($event.value)">
            <mat-option [value]="7">{{ 'ADMIN.DASHBOARD.LAST_7' | translate }}</mat-option>
            <mat-option [value]="30">{{ 'ADMIN.DASHBOARD.LAST_30' | translate }}</mat-option>
            <mat-option [value]="90">{{ 'ADMIN.DASHBOARD.LAST_90' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      }

      @if (!loading() && summary()) {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <mat-card class="p-5">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-500">{{ 'ADMIN.DASHBOARD.TOTAL_REVENUE' | translate }}</p>
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <mat-icon class="text-green-600">attach_money</mat-icon>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-800">
              {{ summary()!.totalRevenue | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ 'ADMIN.DASHBOARD.RECENT_REVENUE' | translate }}:
              {{ summary()!.recentRevenue | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
            </p>
          </mat-card>

          <mat-card class="p-5">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-500">{{ 'ADMIN.DASHBOARD.TOTAL_ORDERS' | translate }}</p>
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <mat-icon class="text-blue-600">receipt_long</mat-icon>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ summary()!.totalOrders }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ summary()!.pendingOrders }} {{ 'ADMIN.DASHBOARD.PENDING' | translate }}
            </p>
          </mat-card>

          <mat-card class="p-5">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-500">{{ 'ADMIN.DASHBOARD.TOTAL_PRODUCTS' | translate }}</p>
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <mat-icon class="text-purple-600">inventory_2</mat-icon>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ summary()!.totalProducts }}</p>
          </mat-card>

          <mat-card class="p-5">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-500">{{ 'ADMIN.DASHBOARD.TOTAL_USERS' | translate }}</p>
              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <mat-icon class="text-orange-500">people</mat-icon>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ summary()!.totalUsers }}</p>
          </mat-card>

        </div>

        <!-- Status de Pedidos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

          <mat-card class="p-5">
            <h3 class="text-base font-semibold text-gray-700 mb-4">{{ 'ADMIN.DASHBOARD.ORDER_STATUS' | translate }}</h3>
            <div class="space-y-3">
              @for (stat of orderStats(); track stat.label) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">{{ stat.label }}</span>
                    <span class="font-medium text-gray-800">{{ stat.count }}</span>
                  </div>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="stat.percent"
                    [color]="stat.color">
                  </mat-progress-bar>
                </div>
              }
            </div>
          </mat-card>

          <!-- Vendas dos últimos 7 dias -->
          <mat-card class="p-5">
            <h3 class="text-base font-semibold text-gray-700 mb-4">{{ 'ADMIN.DASHBOARD.DAILY_SALES' | translate }}</h3>
            <div class="space-y-2">
              @for (day of summary()!.dailySales; track day.date) {
                <div class="flex items-center gap-3">
                  <span class="text-xs text-gray-400 w-20 shrink-0">{{ day.date | date:'dd/MM':'':'pt-BR' }}</span>
                  <div class="flex-1">
                    <mat-progress-bar
                      mode="determinate"
                      [value]="maxDailyRevenue() > 0 ? (day.totalRevenue / maxDailyRevenue()) * 100 : 0"
                      color="primary">
                    </mat-progress-bar>
                  </div>
                  <span class="text-xs font-medium text-gray-700 w-24 text-right shrink-0">
                    {{ day.totalRevenue | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                </div>
              }
            </div>
          </mat-card>

        </div>

        <!-- Top Produtos + Pedidos Recentes -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <mat-card class="p-5">
            <h3 class="text-base font-semibold text-gray-700 mb-4">{{ 'ADMIN.DASHBOARD.TOP_PRODUCTS' | translate }}</h3>
            @if (summary()!.topProducts.length === 0) {
              <p class="text-sm text-gray-400 text-center py-4">{{ 'ADMIN.DASHBOARD.NO_DATA' | translate }}</p>
            } @else {
              <div class="space-y-3">
                @for (product of summary()!.topProducts; track product.productId; let i = $index) {
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-bold text-gray-400 w-5">{{ i + 1 }}</span>
                    <div class="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                      @if (product.imageUrl) {
                        <img [src]="product.imageUrl" [alt]="product.productName" class="w-full h-full object-cover" />
                      } @else {
                        <div class="w-full h-full flex items-center justify-center">
                          <mat-icon class="text-gray-400 text-lg">image</mat-icon>
                        </div>
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-800 truncate">{{ product.productName }}</p>
                      <p class="text-xs text-gray-400">{{ product.totalSold }} {{ 'ADMIN.DASHBOARD.SOLD' | translate }}</p>
                    </div>
                    <span class="text-sm font-semibold text-gray-700 shrink-0">
                      {{ product.totalRevenue | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </span>
                  </div>
                }
              </div>
            }
          </mat-card>

          <mat-card class="p-5">
            <h3 class="text-base font-semibold text-gray-700 mb-4">{{ 'ADMIN.DASHBOARD.RECENT_ORDERS' | translate }}</h3>
            @if (summary()!.recentOrders.length === 0) {
              <p class="text-sm text-gray-400 text-center py-4">{{ 'ADMIN.DASHBOARD.NO_DATA' | translate }}</p>
            } @else {
              <div class="space-y-3">
                @for (order of summary()!.recentOrders; track order.id) {
                  <div class="flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-gray-800">#{{ order.orderNumber }}</p>
                      <p class="text-xs text-gray-400 truncate">{{ order.userName }}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="statusClass(order.status)">
                        {{ statusLabel(order.status) }}
                      </span>
                      <span class="text-sm font-semibold text-gray-700">
                        {{ order.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card>

        </div>
      }

    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly loading = signal(false);
  readonly summary = signal<DashboardSummaryDto | null>(null);
  readonly daysBack = signal(30);

  readonly orderStats = computed(() => {
    const s = this.summary();
    if (!s) return [];
    const total = s.totalOrders || 1;
    return [
      { label: 'Pendente',   count: s.pendingOrders,   percent: (s.pendingOrders / total) * 100,   color: 'accent' as const },
      { label: 'Pago',       count: s.paidOrders,      percent: (s.paidOrders / total) * 100,      color: 'primary' as const },
      { label: 'Enviado',    count: s.shippedOrders,   percent: (s.shippedOrders / total) * 100,   color: 'primary' as const },
      { label: 'Entregue',   count: s.deliveredOrders, percent: (s.deliveredOrders / total) * 100, color: 'primary' as const },
      { label: 'Cancelado',  count: s.cancelledOrders, percent: (s.cancelledOrders / total) * 100, color: 'warn' as const },
    ];
  });

  readonly maxDailyRevenue = computed(() => {
    const s = this.summary();
    if (!s || s.dailySales.length === 0) return 1;
    return Math.max(...s.dailySales.map(d => d.totalRevenue), 1);
  });

  ngOnInit(): void {
    this.loadData();
  }

  changePeriod(days: number): void {
    this.daysBack.set(days);
    this.loadData();
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
    const map: Record<string, string> = {
      Pending:   'Pendente',
      Paid:      'Pago',
      Shipped:   'Enviado',
      Delivered: 'Entregue',
      Cancelled: 'Cancelado',
      Refunded:  'Reembolsado',
    };
    return map[status] ?? status;
  }

  private loadData(): void {
    this.loading.set(true);
    this.adminService.getDashboardSummary(this.daysBack()).subscribe({
      next: data => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
