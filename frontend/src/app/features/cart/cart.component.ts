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
  styles: [`
    .cart-page { animation: cartFadeIn 0.3s ease; }
    @keyframes cartFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }


    /* ── Cart item card ── */
    .item-card {
      background: white; border-radius: 16px;
      border: 1px solid #f3f4f6; padding: 16px;
      display: flex; gap: 16px;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .item-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-1px); }

    .prod-img {
      width: 88px; height: 88px; object-fit: cover;
      border-radius: 12px; border: 1px solid #f3f4f6;
      transition: transform 0.2s ease; flex-shrink: 0;
    }
    .prod-img:hover { transform: scale(1.04); }
    .prod-img-placeholder {
      width: 88px; height: 88px; flex-shrink: 0;
      background: linear-gradient(135deg, #f9fafb, #f3f4f6);
      border-radius: 12px; border: 1px solid #f3f4f6;
      display: flex; align-items: center; justify-content: center;
    }

    /* ── Quantity controls ── */
    .qty-wrap { display: flex; align-items: center; gap: 6px; }
    .qty-btn {
      width: 30px; height: 30px; border-radius: 8px;
      border: 1.5px solid #e5e7eb; background: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #6b7280; transition: all 0.15s ease; flex-shrink: 0;
    }
    .qty-btn:hover:not(:disabled) { border-color: #f97316; color: #f97316; background: #fff7ed; }
    .qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .qty-value { width: 28px; text-align: center; font-weight: 700; font-size: 14px; color: #111827; }

    /* ── Remove button ── */
    .remove-btn { color: #d1d5db !important; transition: color 0.15s ease !important; }
    .remove-btn:hover { color: #ef4444 !important; }

    /* ── Checkout progress ── */
    .progress-row { display: flex; align-items: center; margin-top: 20px; }
    .prog-step { display: flex; align-items: center; gap: 7px; }
    .prog-dot {
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; flex-shrink: 0;
    }
    .prog-active .prog-dot  { background: #f97316; color: white; box-shadow: 0 2px 8px rgba(249,115,22,0.4); }
    .prog-inactive .prog-dot { background: #f3f4f6; color: #9ca3af; }
    .prog-active  .prog-label { color: #f97316; font-weight: 600; font-size: 12px; }
    .prog-inactive .prog-label { color: #9ca3af; font-size: 12px; }
    .prog-line { flex: 1; height: 2px; background: #f3f4f6; margin: 0 10px; }

    /* ── Summary card ── */
    .summary-card {
      background: white; border-radius: 16px;
      border: 1px solid #f3f4f6; padding: 24px;
      position: sticky; top: 88px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    /* ── Coupon input ── */
    .coupon-field {
      border: 1.5px solid #e5e7eb; border-radius: 10px;
      padding: 10px 14px; font-size: 13px; flex: 1;
      outline: none; color: #374151; background: white;
      transition: border-color 0.2s ease;
    }
    .coupon-field:focus { border-color: #f97316; }
    .coupon-field::placeholder { color: #d1d5db; }
    .coupon-apply {
      border: 1.5px solid #e5e7eb; border-radius: 10px;
      padding: 10px 14px; font-size: 13px; font-weight: 600;
      color: #374151; background: #f9fafb; cursor: pointer;
      white-space: nowrap; transition: all 0.15s ease;
    }
    .coupon-apply:hover { border-color: #f97316; color: #f97316; background: #fff7ed; }

    /* ── Summary rows ── */
    .summary-row { display: flex; justify-content: space-between; align-items: center; }

    /* ── Checkout button ── */
    .btn-checkout {
      width: 100%; height: 52px; border-radius: 12px;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-size: 15px; font-weight: 700; letter-spacing: 0.01em;
      box-shadow: 0 4px 16px rgba(249,115,22,0.32);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
      margin-top: 20px;
    }
    .btn-checkout:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(249,115,22,0.42); }

    /* ── Trust badges ── */
    .trust-item { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
    .trust-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; color: #10b981; }
    .trust-text { font-size: 12px; color: #6b7280; }

    /* ── Clear button ── */
    .btn-clear { font-size: 13px; color: #9ca3af; cursor: pointer; background: none; border: none;
      display: flex; align-items: center; gap: 4px; padding: 6px 8px; border-radius: 8px;
      transition: color 0.15s ease, background 0.15s ease; }
    .btn-clear:hover:not(:disabled) { color: #ef4444; background: #fef2f2; }
    .btn-clear:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
  template: `
    <div class="cart-page max-w-5xl mx-auto px-4 py-6">

      <!-- Page header + breadcrumb + progress -->
      <div class="mb-8">
        <div style="display:flex;align-items:center;gap:6px;font-size:13px;color:#9ca3af;margin-bottom:12px">
          <a routerLink="/" style="color:#9ca3af;text-decoration:none;transition:color 0.15s"
            onmouseover="this.style.color='#f97316'" onmouseout="this.style.color='#9ca3af'">Início</a>
          <mat-icon style="font-size:14px;width:14px;height:14px;line-height:1">chevron_right</mat-icon>
          <span style="color:#374151;font-weight:500">{{ 'CART.TITLE' | translate }}</span>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between">
          <h1 style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.02em">
            {{ 'CART.TITLE' | translate }}
          </h1>
          @if (!loading && !cartService.isEmpty()) {
            <span style="font-size:13px;color:#9ca3af">
              {{ cartService.cart()!.totalItems }}
              {{ cartService.cart()!.totalItems === 1 ? 'item' : 'itens' }}
            </span>
          }
        </div>

        <div class="progress-row">
          <div class="prog-step prog-active">
            <div class="prog-dot">1</div>
            <span class="prog-label">Carrinho</span>
          </div>
          <div class="prog-line"></div>
          <div class="prog-step prog-inactive">
            <div class="prog-dot">2</div>
            <span class="prog-label">Dados</span>
          </div>
          <div class="prog-line"></div>
          <div class="prog-step prog-inactive">
            <div class="prog-dot">3</div>
            <span class="prog-label">Pagamento</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div style="display:flex;justify-content:center;padding:80px 0">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <!-- Empty state -->
      @if (!loading && cartService.isEmpty()) {
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-8 py-20">
          <div class="mx-auto mb-5 w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <mat-icon class="text-orange-400" style="font-size:32px;width:32px;height:32px;">shopping_cart</mat-icon>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ 'CART.EMPTY' | translate }}</h2>
          <p class="text-gray-400 text-sm max-w-xs mx-auto mb-8">
            Explore nosso catálogo e adicione produtos ao carrinho para continuar.
          </p>
          <a routerLink="/products"
             style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);color:white;border-radius:12px;padding:13px 28px;font-weight:600;font-size:14px;text-decoration:none;letter-spacing:0.01em;box-shadow:0 4px 16px rgba(249,115,22,0.32);transition:box-shadow 0.2s ease,transform 0.2s ease;"
             onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(249,115,22,0.42)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(249,115,22,0.32)'">
            <mat-icon style="font-size:18px;width:18px;height:18px">storefront</mat-icon>
            {{ 'CART.EMPTY_CTA' | translate }}
          </a>
        </div>
      }

      <!-- Cart with items -->
      @if (!loading && !cartService.isEmpty()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Items list -->
          <div class="lg:col-span-2" style="display:flex;flex-direction:column;gap:12px">

            @for (item of cartService.cart()!.items; track item.productId) {
              <div class="item-card">

                <!-- Product image -->
                <a [routerLink]="['/products', item.productSlug]" style="flex-shrink:0">
                  @if (item.productImageUrl) {
                    <img [src]="item.productImageUrl" [alt]="item.productName" class="prod-img" />
                  } @else {
                    <div class="prod-img-placeholder">
                      <mat-icon style="font-size:28px;width:28px;height:28px;color:#d1d5db">image</mat-icon>
                    </div>
                  }
                </a>

                <!-- Product info -->
                <div style="flex:1;min-width:0">
                  <a [routerLink]="['/products', item.productSlug]"
                    style="font-size:14px;font-weight:600;color:#111827;text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;transition:color 0.15s"
                    onmouseover="this.style.color='#f97316'" onmouseout="this.style.color='#111827'">
                    {{ item.productName }}
                  </a>
                  <p style="font-size:12px;color:#9ca3af;margin:4px 0 0">
                    {{ item.unitPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} / un.
                  </p>

                  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">

                    <!-- Quantity controls -->
                    <div class="qty-wrap">
                      <button class="qty-btn" (click)="onDecrement(item)"
                        [disabled]="updatingId === item.productId" type="button">
                        <mat-icon style="font-size:15px;width:15px;height:15px">remove</mat-icon>
                      </button>
                      <span class="qty-value">{{ item.quantity }}</span>
                      <button class="qty-btn" (click)="onIncrement(item)"
                        [disabled]="updatingId === item.productId" type="button">
                        <mat-icon style="font-size:15px;width:15px;height:15px">add</mat-icon>
                      </button>
                    </div>

                    <!-- Subtotal + remove -->
                    <div style="display:flex;align-items:center;gap:12px">
                      <span style="font-size:17px;font-weight:800;color:#f97316;letter-spacing:-0.02em">
                        {{ item.subtotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </span>
                      <button mat-icon-button class="remove-btn"
                        style="width:32px;height:32px"
                        (click)="onRemove(item)"
                        [disabled]="updatingId === item.productId"
                        title="Remover item">
                        <mat-icon style="font-size:18px;width:18px;height:18px">delete_outline</mat-icon>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            }

            <!-- Clear cart -->
            <div style="display:flex;justify-content:flex-end;padding-top:4px">
              <button class="btn-clear" (click)="onClear()" [disabled]="clearing" type="button">
                <mat-icon style="font-size:16px;width:16px;height:16px">delete_sweep</mat-icon>
                {{ 'CART.CLEAR' | translate }}
              </button>
            </div>

          </div>

          <!-- Order summary -->
          <div class="lg:col-span-1">
            <div class="summary-card">

              <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 18px">Resumo do pedido</h2>

              <!-- Coupon -->
              <div style="display:flex;gap:8px;margin-bottom:20px">
                <input class="coupon-field" type="text" placeholder="Código de cupom" />
                <button class="coupon-apply" type="button">Aplicar</button>
              </div>

              <!-- Subtotals -->
              <div style="border-top:1px solid #f3f4f6;padding-top:16px;display:flex;flex-direction:column;gap:10px">
                <div class="summary-row">
                  <span style="font-size:13px;color:#6b7280">
                    {{ 'CART.TOTAL_ITEMS' | translate:{ count: cartService.cart()!.totalItems } }}
                  </span>
                  <span style="font-size:13px;color:#374151;font-weight:500">
                    {{ cartService.totalPrice() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                </div>
                <div class="summary-row">
                  <span style="font-size:13px;color:#6b7280">Frete</span>
                  <span style="font-size:13px;font-weight:600;color:#10b981">Grátis</span>
                </div>
              </div>

              <!-- Total -->
              <div style="border-top:1px solid #f3f4f6;margin-top:14px;padding-top:14px" class="summary-row">
                <span style="font-size:14px;font-weight:600;color:#111827">{{ 'CART.TOTAL' | translate }}</span>
                <span style="font-size:22px;font-weight:800;color:#f97316;letter-spacing:-0.03em">
                  {{ cartService.totalPrice() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
              </div>

              <!-- Checkout button -->
              <button class="btn-checkout" (click)="onCheckout()" type="button">
                <mat-icon style="font-size:18px;width:18px;height:18px">lock</mat-icon>
                {{ 'CART.CHECKOUT' | translate }}
              </button>

              <!-- Continue shopping -->
              <a routerLink="/products"
                style="display:block;text-align:center;font-size:13px;color:#9ca3af;text-decoration:none;margin-top:12px;padding:8px;border-radius:8px;transition:color 0.15s"
                onmouseover="this.style.color='#f97316'" onmouseout="this.style.color='#9ca3af'">
                {{ 'CART.CONTINUE_SHOPPING' | translate }}
              </a>

              <!-- Trust signals -->
              <div style="border-top:1px solid #f3f4f6;margin-top:16px;padding-top:8px">
                <div class="trust-item">
                  <mat-icon class="trust-icon">lock</mat-icon>
                  <span class="trust-text">Pagamento 100% seguro</span>
                </div>
                <div class="trust-item">
                  <mat-icon class="trust-icon">local_shipping</mat-icon>
                  <span class="trust-text">Entrega rápida e rastreável</span>
                </div>
                <div class="trust-item">
                  <mat-icon class="trust-icon">replay</mat-icon>
                  <span class="trust-text">Devolução grátis em 30 dias</span>
                </div>
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
