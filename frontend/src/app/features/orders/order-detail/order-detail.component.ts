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

interface OrderStep {
  key: string;
  label: string;
  icon: string;
}

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
    <div class="max-w-5xl mx-auto px-4 py-8 animate-fade-in">

      <!-- Breadcrumb + Back -->
      <a routerLink="/orders"
         class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6 no-underline">
        <mat-icon style="font-size:16px;width:16px;height:16px;line-height:1;">arrow_back</mat-icon>
        Meus Pedidos
      </a>

      <!-- Page Header -->
      @if (!loading() && order()) {
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ 'ORDERS.DETAIL_TITLE' | translate }}</h1>
            <p class="mt-1 text-sm text-gray-400">
              {{ order()!.orderNumber }}
              &nbsp;·&nbsp;
              {{ order()!.createdAt | date:'dd/MM/yyyy · HH:mm' }}
            </p>
          </div>
          <span class="self-start sm:self-center inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl font-medium border"
                [class]="statusBadgeClass(order()!.status)">
            <mat-icon style="font-size:14px;width:14px;height:14px;line-height:1;">{{ statusIcon(order()!.status) }}</mat-icon>
            {{ 'ORDER.STATUS.' + order()!.status.toUpperCase() | translate }}
          </span>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-24 gap-3">
          <mat-spinner diameter="36"></mat-spinner>
          <p class="text-sm text-gray-400">Carregando pedido...</p>
        </div>
      }

      @if (!loading() && order()) {

        <!-- Progress Timeline (only for active orders) -->
        @if (order()!.status !== 'Cancelled' && order()!.status !== 'Refunded') {
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-6">
            <div class="flex items-center">
              @for (step of orderSteps; track step.key; let last = $last) {
                <div class="flex flex-col items-center gap-1.5 shrink-0">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                       [class]="isStepReached(step.key)
                         ? 'bg-emerald-500 text-white shadow-sm'
                         : 'bg-gray-100 text-gray-300'">
                    <mat-icon style="font-size:16px;width:16px;height:16px;line-height:1;">{{ step.icon }}</mat-icon>
                  </div>
                  <span class="text-xs whitespace-nowrap"
                        [class]="isStepReached(step.key) ? 'text-emerald-600 font-medium' : 'text-gray-400'">
                    {{ step.label }}
                  </span>
                </div>
                @if (!last) {
                  <div class="flex-1 h-0.5 mx-3 mb-5 transition-all"
                       [class]="isStepAfterReached(step.key) ? 'bg-emerald-400' : 'bg-gray-100'"></div>
                }
              }
            </div>
          </div>
        }

        <!-- Cancelled / Refunded Banner -->
        @if (order()!.status === 'Cancelled' || order()!.status === 'Refunded') {
          <div class="mb-6 px-4 py-3.5 rounded-2xl border flex items-center gap-3"
               [class]="order()!.status === 'Cancelled'
                 ? 'bg-rose-50 border-rose-200 text-rose-700'
                 : 'bg-slate-50 border-slate-200 text-slate-600'">
            <mat-icon style="font-size:20px;width:20px;height:20px;line-height:1;">
              {{ order()!.status === 'Cancelled' ? 'cancel' : 'currency_exchange' }}
            </mat-icon>
            <span class="text-sm font-medium">
              {{ order()!.status === 'Cancelled' ? 'Este pedido foi cancelado.' : 'Este pedido foi reembolsado.' }}
            </span>
          </div>
        }

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Left: Items + Financial Summary -->
          <div class="lg:col-span-2 space-y-4">

            <!-- Items Card -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50">
                <h2 class="font-semibold text-gray-900 text-sm">Itens do pedido</h2>
              </div>
              <div class="divide-y divide-gray-50">
                @for (item of order()!.items; track item.productId) {
                  <div class="flex items-center gap-4 px-5 py-4">
                    @if (item.productImageUrl) {
                      <img [src]="item.productImageUrl" [alt]="item.productName"
                           class="w-14 h-14 object-cover rounded-xl border border-gray-100 shrink-0" />
                    } @else {
                      <div class="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                        <mat-icon class="text-gray-200" style="font-size:24px;width:24px;height:24px;">image</mat-icon>
                      </div>
                    }
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 text-sm truncate">{{ item.productName }}</p>
                      <p class="text-xs text-gray-400 mt-0.5">
                        {{ item.unitPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} × {{ item.quantity }}
                      </p>
                    </div>
                    <span class="font-semibold text-gray-900 text-sm shrink-0">
                      {{ item.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </span>
                  </div>
                }
              </div>

              <!-- Financial Summary -->
              <div class="bg-gray-50 px-5 py-4 space-y-2 border-t border-gray-100">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>{{ 'CART.SUBTOTAL' | translate }}</span>
                  <span>{{ order()!.subtotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                  <span>{{ 'CHECKOUT.SHIPPING' | translate }}</span>
                  @if (order()!.shippingCost === 0) {
                    <span class="text-emerald-600 font-medium">{{ 'CHECKOUT.FREE_SHIPPING' | translate }}</span>
                  } @else {
                    <span>{{ order()!.shippingCost | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  }
                </div>
                @if (order()!.discount > 0) {
                  <div class="flex justify-between text-sm text-emerald-600">
                    <span>Desconto</span>
                    <span>-{{ order()!.discount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  </div>
                }
                <div class="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>{{ 'CART.TOTAL' | translate }}</span>
                  <span class="text-lg">{{ order()!.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                </div>
              </div>
            </div>

            <!-- Cancel Action -->
            @if (order()!.status === 'Pending') {
              <div class="flex justify-end">
                <button mat-stroked-button color="warn"
                        [disabled]="cancelling()"
                        (click)="onCancel()">
                  @if (cancelling()) {
                    <mat-spinner diameter="16"></mat-spinner>
                  } @else {
                    <mat-icon>cancel</mat-icon>
                  }
                  {{ 'ORDERS.CANCEL' | translate }}
                </button>
              </div>
            }
          </div>

          <!-- Right: Sidebar -->
          <div class="space-y-4">

            <!-- Shipping Address -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <mat-icon class="text-gray-400" style="font-size:16px;width:16px;height:16px;line-height:1;">location_on</mat-icon>
                <h3 class="font-semibold text-gray-900 text-sm">{{ 'CHECKOUT.STEP_ADDRESS' | translate }}</h3>
              </div>
              <div class="px-5 py-4 text-sm text-gray-600 space-y-0.5">
                <p class="font-semibold text-gray-900">{{ order()!.shippingAddress.recipient }}</p>
                <p>{{ order()!.shippingAddress.street }}, {{ order()!.shippingAddress.number }}</p>
                @if (order()!.shippingAddress.complement) {
                  <p>{{ order()!.shippingAddress.complement }}</p>
                }
                <p>{{ order()!.shippingAddress.neighborhood }}</p>
                <p>{{ order()!.shippingAddress.city }} / {{ order()!.shippingAddress.state }}</p>
                <p class="font-mono text-xs text-gray-400 pt-1">CEP {{ order()!.shippingAddress.zipCode }}</p>
              </div>
            </div>

            <!-- Estimated Delivery -->
            @if (order()!.estimatedDelivery) {
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                  <mat-icon class="text-gray-400" style="font-size:16px;width:16px;height:16px;line-height:1;">calendar_today</mat-icon>
                  <h3 class="font-semibold text-gray-900 text-sm">Entrega estimada</h3>
                </div>
                <div class="px-5 py-4">
                  <p class="font-semibold text-emerald-600">{{ order()!.estimatedDelivery | date:'dd/MM/yyyy' }}</p>
                </div>
              </div>
            }

            <!-- Tracking Code -->
            @if (order()!.trackingCode) {
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                  <mat-icon class="text-gray-400" style="font-size:16px;width:16px;height:16px;line-height:1;">local_shipping</mat-icon>
                  <h3 class="font-semibold text-gray-900 text-sm">Código de rastreio</h3>
                </div>
                <div class="px-5 py-4">
                  <p class="font-mono text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 select-all">
                    {{ order()!.trackingCode }}
                  </p>
                </div>
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

  readonly orderSteps: OrderStep[] = [
    { key: 'Pending', label: 'Pedido', icon: 'receipt' },
    { key: 'Paid', label: 'Pago', icon: 'payments' },
    { key: 'Shipped', label: 'Enviado', icon: 'local_shipping' },
    { key: 'Delivered', label: 'Entregue', icon: 'check_circle' },
  ];

  private readonly stepOrder: Record<string, number> = {
    'Pending': 0,
    'Paid': 1,
    'Shipped': 2,
    'Delivered': 3,
  };

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

  isStepReached(stepKey: string): boolean {
    const o = this.order();
    if (!o) return false;
    const currentStep = this.stepOrder[o.status] ?? -1;
    const targetStep = this.stepOrder[stepKey] ?? -1;
    return currentStep >= targetStep;
  }

  isStepAfterReached(stepKey: string): boolean {
    const o = this.order();
    if (!o) return false;
    const currentStep = this.stepOrder[o.status] ?? -1;
    const targetStep = this.stepOrder[stepKey] ?? -1;
    return currentStep > targetStep;
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
}
