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
import { OrderSummaryDto } from '../../core/models/order.model';

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
    <div class="max-w-4xl mx-auto animate-fade-in">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ 'ORDERS.TITLE' | translate }}</h1>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (!loading() && orders().length === 0) {
        <div class="bg-white rounded-xl shadow-sm p-12 text-center">
          <mat-icon class="text-gray-300 mb-4" style="font-size:80px;width:80px;height:80px;">receipt_long</mat-icon>
          <p class="text-gray-500 text-lg mb-6">{{ 'ORDERS.EMPTY' | translate }}</p>
          <a routerLink="/products" mat-raised-button color="primary">{{ 'CART.EMPTY_CTA' | translate }}</a>
        </div>
      }

      @if (!loading() && orders().length > 0) {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div class="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-3">
                  <span class="font-bold text-gray-800">{{ order.orderNumber }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="statusClass(order.status)">
                    {{ 'ORDER.STATUS.' + order.status.toUpperCase() | translate }}
                  </span>
                </div>
                <p class="text-sm text-gray-500">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                <p class="text-sm text-gray-600">{{ order.itemCount }} item(s)</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-bold text-primary-500 text-lg">{{ order.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                <a [routerLink]="['/orders', order.id]" mat-stroked-button color="primary">
                  {{ 'ORDERS.VIEW_DETAIL' | translate }}
                </a>
              </div>
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

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Paid': 'bg-blue-100 text-blue-700',
      'Shipped': 'bg-purple-100 text-purple-700',
      'Delivered': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'Refunded': 'bg-gray-100 text-gray-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }
}
