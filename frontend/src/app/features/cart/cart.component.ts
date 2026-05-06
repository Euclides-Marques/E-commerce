import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItemDto } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    TranslatePipe,
  ],
  template: `
    <div class="max-w-5xl mx-auto animate-fade-in">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ 'CART.TITLE' | translate }}</h1>

      @if (loading) {
        <div class="flex justify-center py-20">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      }

      @if (!loading && cartService.isEmpty()) {
        <div class="bg-white rounded-xl shadow-sm p-12 text-center">
          <mat-icon class="text-gray-300 mb-4" style="font-size:80px;width:80px;height:80px;">shopping_cart</mat-icon>
          <p class="text-gray-500 text-lg mb-6">{{ 'CART.EMPTY' | translate }}</p>
          <a routerLink="/products" mat-raised-button color="primary">
            {{ 'CART.EMPTY_CTA' | translate }}
          </a>
        </div>
      }

      @if (!loading && !cartService.isEmpty()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Lista de itens -->
          <div class="lg:col-span-2 space-y-3">
            @for (item of cartService.cart()!.items; track item.productId) {
              <div class="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                <!-- Imagem -->
                <a [routerLink]="['/products', item.productSlug]" class="shrink-0">
                  @if (item.productImageUrl) {
                    <img [src]="item.productImageUrl" [alt]="item.productName"
                      class="w-20 h-20 object-cover rounded-lg border border-gray-100" />
                  } @else {
                    <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <mat-icon class="text-gray-300">image</mat-icon>
                    </div>
                  }
                </a>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <a [routerLink]="['/products', item.productSlug]"
                    class="font-semibold text-gray-800 hover:text-primary-500 line-clamp-2 block">
                    {{ item.productName }}
                  </a>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ 'CART.UNIT_PRICE' | translate }}: {{ item.unitPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </p>

                  <div class="flex items-center justify-between mt-3">
                    <!-- Controles de quantidade -->
                    <div class="flex items-center gap-2">
                      <button mat-icon-button class="!w-8 !h-8 !min-w-0 border border-gray-200 rounded-full"
                        (click)="onDecrement(item)"
                        [disabled]="updatingId === item.productId">
                        <mat-icon class="text-sm">remove</mat-icon>
                      </button>
                      <span class="w-8 text-center font-semibold text-gray-800">{{ item.quantity }}</span>
                      <button mat-icon-button class="!w-8 !h-8 !min-w-0 border border-gray-200 rounded-full"
                        (click)="onIncrement(item)"
                        [disabled]="updatingId === item.productId">
                        <mat-icon class="text-sm">add</mat-icon>
                      </button>
                    </div>

                    <!-- Subtotal + Remover -->
                    <div class="flex items-center gap-4">
                      <span class="font-bold text-primary-500">
                        {{ item.subtotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </span>
                      <button mat-icon-button color="warn" (click)="onRemove(item)"
                        [disabled]="updatingId === item.productId">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Limpar carrinho -->
            <div class="flex justify-end pt-2">
              <button mat-stroked-button color="warn" (click)="onClear()" [disabled]="clearing">
                <mat-icon>delete_sweep</mat-icon>
                {{ 'CART.CLEAR' | translate }}
              </button>
            </div>
          </div>

          <!-- Resumo -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 class="text-lg font-bold text-gray-800 mb-4">Resumo do pedido</h2>
              <mat-divider class="mb-4"></mat-divider>

              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span>{{ 'CART.TOTAL_ITEMS' | translate:{ count: cartService.cart()!.totalItems } }}</span>
                </div>
                <div class="flex justify-between font-bold text-lg text-gray-800 pt-2">
                  <span>{{ 'CART.TOTAL' | translate }}</span>
                  <span class="text-primary-500">
                    {{ cartService.totalPrice() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                </div>
              </div>

              <mat-divider class="my-4"></mat-divider>

              <div class="space-y-3">
                <button mat-raised-button color="primary" class="w-full py-3 text-base font-semibold"
                  (click)="onCheckout()">
                  <mat-icon>lock</mat-icon>
                  {{ 'CART.CHECKOUT' | translate }}
                </button>
                <a routerLink="/products" mat-stroked-button color="primary" class="w-full text-center block">
                  {{ 'CART.CONTINUE_SHOPPING' | translate }}
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartComponent implements OnInit {
  readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  loading = false;
  clearing = false;
  updatingId: string | null = null;

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) return;
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: () => { this.loading = false; },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar carrinho.', 'Fechar', { duration: 3000 });
      },
    });
  }

  onIncrement(item: CartItemDto): void {
    this.updatingId = item.productId;
    this.cartService.updateItem(item.productId, item.quantity + 1).subscribe({
      next: () => { this.updatingId = null; },
      error: () => {
        this.updatingId = null;
        this.snackBar.open('CART.ERROR_UPDATE' , 'Fechar', { duration: 3000 });
      },
    });
  }

  onDecrement(item: CartItemDto): void {
    this.updatingId = item.productId;
    const next = item.quantity - 1;
    const obs = next === 0
      ? this.cartService.removeItem(item.productId)
      : this.cartService.updateItem(item.productId, next);
    obs.subscribe({
      next: () => { this.updatingId = null; },
      error: () => {
        this.updatingId = null;
        this.snackBar.open('CART.ERROR_UPDATE', 'Fechar', { duration: 3000 });
      },
    });
  }

  onRemove(item: CartItemDto): void {
    this.updatingId = item.productId;
    this.cartService.removeItem(item.productId).subscribe({
      next: () => { this.updatingId = null; },
      error: () => {
        this.updatingId = null;
        this.snackBar.open('CART.ERROR_REMOVE', 'Fechar', { duration: 3000 });
      },
    });
  }

  onClear(): void {
    this.clearing = true;
    this.cartService.clearCart().subscribe({
      next: () => { this.clearing = false; },
      error: () => {
        this.clearing = false;
        this.snackBar.open('Erro ao limpar carrinho.', 'Fechar', { duration: 3000 });
      },
    });
  }

  onCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
