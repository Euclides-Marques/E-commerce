import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderService } from '../../../core/services/order.service';
import { OrderDto } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/orders" mat-icon-button>
          <mat-icon>arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-bold text-gray-800">{{ 'ORDERS.DETAIL_TITLE' | translate }}</h1>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (!loading() && order()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Itens do pedido -->
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-white rounded-xl shadow-sm p-5">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="font-bold text-gray-800">{{ order()!.orderNumber }}</h2>
                  <p class="text-sm text-gray-500">{{ order()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <span class="text-sm px-3 py-1 rounded-full font-medium" [class]="statusClass(order()!.status)">
                  {{ 'ORDER.STATUS.' + order()!.status.toUpperCase() | translate }}
                </span>
              </div>

              <mat-divider class="mb-4"></mat-divider>

              <div class="space-y-3">
                @for (item of order()!.items; track item.productId) {
                  <div class="flex items-center gap-4">
                    @if (item.productImageUrl) {
                      <img [src]="item.productImageUrl" [alt]="item.productName"
                        class="w-14 h-14 object-cover rounded-lg border border-gray-100 shrink-0" />
                    } @else {
                      <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <mat-icon class="text-gray-300">image</mat-icon>
                      </div>
                    }
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-800 truncate">{{ item.productName }}</p>
                      <p class="text-sm text-gray-500">{{ item.unitPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} × {{ item.quantity }}</p>
                    </div>
                    <span class="font-bold text-gray-800 shrink-0">{{ item.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  </div>
                }
              </div>

              <mat-divider class="my-4"></mat-divider>

              <div class="space-y-1 text-sm">
                <div class="flex justify-between text-gray-600">
                  <span>{{ 'CART.SUBTOTAL' | translate }}</span>
                  <span>{{ order()!.subtotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>{{ 'CHECKOUT.SHIPPING' | translate }}</span>
                  @if (order()!.shippingCost === 0) {
                    <span class="text-green-600">{{ 'CHECKOUT.FREE_SHIPPING' | translate }}</span>
                  } @else {
                    <span>{{ order()!.shippingCost | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  }
                </div>
                @if (order()!.discount > 0) {
                  <div class="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>-{{ order()!.discount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  </div>
                }
                <div class="flex justify-between font-bold text-lg pt-1">
                  <span>{{ 'CART.TOTAL' | translate }}</span>
                  <span class="text-primary-500">{{ order()!.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                </div>
              </div>
            </div>

            <!-- Cancelar -->
            @if (order()!.status === 'Pending') {
              <div class="flex justify-end">
                <button mat-stroked-button color="warn" [disabled]="cancelling()" (click)="onCancel()">
                  <mat-icon>cancel</mat-icon>
                  {{ 'ORDERS.CANCEL' | translate }}
                </button>
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="space-y-4">
            <!-- Endereço de entrega -->
            <div class="bg-white rounded-xl shadow-sm p-5">
              <h3 class="font-bold text-gray-800 mb-3">{{ 'CHECKOUT.STEP_ADDRESS' | translate }}</h3>
              <div class="text-sm text-gray-600 space-y-1">
                <p class="font-medium text-gray-800">{{ order()!.shippingAddress.recipient }}</p>
                <p>{{ order()!.shippingAddress.street }}, {{ order()!.shippingAddress.number }}</p>
                @if (order()!.shippingAddress.complement) {
                  <p>{{ order()!.shippingAddress.complement }}</p>
                }
                <p>{{ order()!.shippingAddress.neighborhood }}</p>
                <p>{{ order()!.shippingAddress.city }}/{{ order()!.shippingAddress.state }}</p>
                <p>CEP {{ order()!.shippingAddress.zipCode }}</p>
              </div>
            </div>

            <!-- Entrega estimada -->
            @if (order()!.estimatedDelivery) {
              <div class="bg-white rounded-xl shadow-sm p-5">
                <h3 class="font-bold text-gray-800 mb-2">Entrega estimada</h3>
                <p class="text-primary-500 font-semibold">{{ order()!.estimatedDelivery | date:'dd/MM/yyyy' }}</p>
              </div>
            }

            <!-- Rastreio -->
            @if (order()!.trackingCode) {
              <div class="bg-white rounded-xl shadow-sm p-5">
                <h3 class="font-bold text-gray-800 mb-2">Código de rastreio</h3>
                <p class="font-mono text-sm text-gray-700">{{ order()!.trackingCode }}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly order = signal<OrderDto | null>(null);
  readonly loading = signal(false);
  readonly cancelling = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (!id) return;
    this.loading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: order => { this.order.set(order); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Pedido não encontrado.', 'Fechar', { duration: 3000 });
      },
    });
  }

  onCancel(): void {
    const o = this.order();
    if (!o) return;
    this.cancelling.set(true);
    this.orderService.cancelOrder(o.id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.order.update(ord => ord ? { ...ord, status: 'Cancelled' } : ord);
        this.snackBar.open('Pedido cancelado com sucesso.', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        this.cancelling.set(false);
        const msg = err?.error?.errors?.[0] ?? 'Erro ao cancelar pedido.';
        this.snackBar.open(msg, 'Fechar', { duration: 3000 });
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
