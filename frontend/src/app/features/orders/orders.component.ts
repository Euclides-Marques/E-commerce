import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8 animate-fade-in">

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ 'ORDERS.TITLE' | translate }}</h1>
        <p class="mt-1 text-sm text-gray-500">Acompanhe o status e o histórico dos seus pedidos</p>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-24 gap-3">
          <mat-spinner diameter="36"></mat-spinner>
          <p class="text-sm text-gray-400">Carregando pedidos...</p>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && orders().length === 0) {
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-8 py-20">
          <div class="mx-auto mb-5 w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <mat-icon class="text-orange-400" style="font-size:32px;width:32px;height:32px;">receipt_long</mat-icon>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Nenhum pedido ainda</h2>
          <p class="text-gray-400 text-sm max-w-xs mx-auto mb-8">{{ 'ORDERS.EMPTY' | translate }}</p>
          <a routerLink="/products"
             style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);color:white;border-radius:12px;padding:13px 28px;font-weight:600;font-size:14px;text-decoration:none;letter-spacing:0.01em;box-shadow:0 4px 16px rgba(249,115,22,0.32);transition:box-shadow 0.2s ease,transform 0.2s ease;"
             onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(249,115,22,0.42)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(249,115,22,0.32)'">
            <mat-icon style="font-size:18px;width:18px;height:18px">storefront</mat-icon>
            {{ 'CART.EMPTY_CTA' | translate }}
          </a>
        </div>
      }

      <!-- Orders List -->
      @if (!loading() && orders().length > 0) {
        <div class="space-y-3">
          @for (order of orders(); track order.id) {
            <div class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden">
              <div class="flex flex-col sm:flex-row sm:items-center gap-4 p-5">

                <!-- Icon + Info -->
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" [class]="statusIconBg(order.status)">
                    <mat-icon [class]="statusIconColor(order.status)" style="font-size:20px;width:20px;height:20px;line-height:1;">
                      {{ statusIcon(order.status) }}
                    </mat-icon>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-semibold text-gray-900 text-sm">{{ order.orderNumber }}</span>
                      <span class="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium border" [class]="statusBadgeClass(order.status)">
                        {{ 'ORDER.STATUS.' + order.status.toUpperCase() | translate }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5">
                      {{ order.createdAt | date:'dd/MM/yyyy · HH:mm' }}
                      &nbsp;·&nbsp;
                      {{ order.itemCount }} {{ order.itemCount === 1 ? 'item' : 'itens' }}
                    </p>
                  </div>
                </div>

                <!-- Price + CTA -->
                <div class="flex items-center gap-4 sm:shrink-0 pl-14 sm:pl-0">
                  <span class="font-bold text-gray-900">{{ order.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  <a [routerLink]="['/orders', order.id]"
                     class="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors no-underline"
                     [class]="statusLinkClass(order.status)">
                    Ver detalhes
                    <mat-icon style="font-size:13px;width:13px;height:13px;line-height:1;">east</mat-icon>
                  </a>
                </div>
              </div>

              <!-- Status accent bar -->
              <div class="h-[2px]" [class]="statusBarClass(order.status)"></div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly snackBar = inject(MatSnackBar);

  readonly orders = this.orderService.orders;
  readonly loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.orderService.getOrders().subscribe({
      next: () => { this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar pedidos.', 'Fechar', { duration: 3000 });
      },
    });
  }

  statusIcon(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'schedule',
      'Paid': 'payments',
      'Shipped': 'local_shipping',
      'Delivered': 'check_circle',
      'Cancelled': 'cancel',
      'Refunded': 'currency_exchange',
    };
    return map[status] ?? 'receipt';
  }

  statusIconBg(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'bg-amber-50',
      'Paid': 'bg-blue-50',
      'Shipped': 'bg-violet-50',
      'Delivered': 'bg-emerald-50',
      'Cancelled': 'bg-rose-50',
      'Refunded': 'bg-slate-50',
    };
    return map[status] ?? 'bg-slate-50';
  }

  statusIconColor(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'text-amber-500',
      'Paid': 'text-blue-500',
      'Shipped': 'text-violet-500',
      'Delivered': 'text-emerald-500',
      'Cancelled': 'text-rose-500',
      'Refunded': 'text-slate-400',
    };
    return map[status] ?? 'text-slate-400';
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'Paid': 'bg-blue-50 text-blue-700 border-blue-200',
      'Shipped': 'bg-violet-50 text-violet-700 border-violet-200',
      'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200',
      'Refunded': 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return map[status] ?? 'bg-slate-50 text-slate-600 border-slate-200';
  }

  statusLinkClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'text-amber-700 bg-amber-50 hover:bg-amber-100',
      'Paid': 'text-blue-700 bg-blue-50 hover:bg-blue-100',
      'Shipped': 'text-violet-700 bg-violet-50 hover:bg-violet-100',
      'Delivered': 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
      'Cancelled': 'text-rose-700 bg-rose-50 hover:bg-rose-100',
      'Refunded': 'text-slate-600 bg-slate-50 hover:bg-slate-100',
    };
    return map[status] ?? 'text-slate-600 bg-slate-50 hover:bg-slate-100';
  }

  statusBarClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'bg-amber-300',
      'Paid': 'bg-blue-300',
      'Shipped': 'bg-violet-400',
      'Delivered': 'bg-emerald-400',
      'Cancelled': 'bg-rose-300',
      'Refunded': 'bg-slate-200',
    };
    return map[status] ?? 'bg-slate-200';
  }
}
