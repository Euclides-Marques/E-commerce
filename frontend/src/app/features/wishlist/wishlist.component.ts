import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DecimalPipe,
    RouterLink,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="animate-fade-in">

      <!-- ── Page header ──────────────────────────────────────── -->
      <div class="wl-header">
        <div class="wl-header__left">
          <h1 class="wl-title">{{ 'WISHLIST.TITLE' | translate }}</h1>
          @if (wishlistService.count() > 0) {
            <span class="wl-count-badge">{{ wishlistService.count() }}</span>
          }
        </div>
        @if (wishlistService.count() > 0) {
          <p class="wl-header__sub">Itens salvos para comprar depois</p>
        }
      </div>

      <!-- ── Loading skeletons ────────────────────────────────── -->
      @if (loading()) {
        <div class="wl-grid">
          @for (i of skeletons; track i) {
            <div class="wl-skeleton">
              <div class="skeleton wl-skeleton__img"></div>
              <div class="wl-skeleton__body">
                <div class="skeleton" style="height:13px;width:75%;border-radius:4px"></div>
                <div class="skeleton" style="height:18px;width:50%;border-radius:4px;margin-top:8px"></div>
                <div class="skeleton" style="height:34px;width:100%;border-radius:8px;margin-top:12px"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── Empty state ──────────────────────────────────────── -->
      @if (!loading() && wishlistService.items().length === 0) {
        <div class="wl-empty">
          <div class="wl-empty__icon-wrap">
            <mat-icon class="wl-empty__icon">favorite_border</mat-icon>
          </div>
          <h2 class="wl-empty__heading">{{ 'WISHLIST.EMPTY' | translate }}</h2>
          <p class="wl-empty__text">
            Adicione produtos que você amou para encontrá-los facilmente depois.
          </p>
          <a routerLink="/products" class="wl-empty__cta">
            <mat-icon>storefront</mat-icon>
            {{ 'WISHLIST.EMPTY_CTA' | translate }}
          </a>
        </div>
      }

      <!-- ── Products grid ────────────────────────────────────── -->
      @if (!loading() && wishlistService.items().length > 0) {
        <div class="wl-grid">
          @for (item of wishlistService.items(); track item.productId; let i = $index) {
            <div class="wl-card animate-slide-up" [style.animation-delay]="(i * 40) + 'ms'">

              <!-- Image -->
              <div class="wl-card__img-wrap">
                <a [routerLink]="['/products', item.productSlug]">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.productName"
                         class="wl-card__img" loading="lazy" />
                  } @else {
                    <div class="wl-card__img-placeholder">
                      <mat-icon>image</mat-icon>
                    </div>
                  }
                </a>

                <!-- Discount badge -->
                @if (item.originalPrice && item.originalPrice > item.price) {
                  <span class="wl-card__discount">
                    -{{ getDiscount(item.price, item.originalPrice) }}%
                  </span>
                }

                <!-- Remove button -->
                <button class="wl-card__remove-btn"
                        (click)="onRemove(item.productId)"
                        aria-label="Remover da lista de desejos">
                  <mat-icon>favorite</mat-icon>
                </button>

                <!-- Out of stock overlay -->
                @if (!item.inStock) {
                  <div class="wl-card__oos">
                    <span>{{ 'PRODUCT.OUT_OF_STOCK' | translate }}</span>
                  </div>
                }
              </div>

              <!-- Body -->
              <div class="wl-card__body">
                <a [routerLink]="['/products', item.productSlug]" class="wl-card__name">
                  {{ item.productName }}
                </a>

                @if (item.averageRating > 0) {
                  <div class="wl-card__rating">
                    <mat-icon class="wl-card__star">star</mat-icon>
                    <span class="wl-card__rating-val">{{ item.averageRating | number:'1.1-1' }}</span>
                    <span class="wl-card__rating-count">({{ item.reviewCount }})</span>
                  </div>
                }

                <div class="wl-card__price-row">
                  <span class="wl-card__price">
                    {{ item.price | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                  @if (item.originalPrice && item.originalPrice > item.price) {
                    <span class="wl-card__orig-price">
                      {{ item.originalPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </span>
                  }
                </div>

                <button class="wl-card__cart-btn"
                        [disabled]="!item.inStock || (addingToCart() === item.productId)"
                        (click)="onAddToCart(item.productId)">
                  @if (addingToCart() === item.productId) {
                    <mat-spinner diameter="15" class="wl-btn-spinner"></mat-spinner>
                  } @else {
                    <mat-icon>shopping_cart</mat-icon>
                  }
                  {{ 'PRODUCT.ADD_TO_CART' | translate }}
                </button>
              </div>

            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    /* ── Header ──────────────────────────────────────────────── */
    .wl-header {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }
    .wl-header__left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .wl-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.4px;
      margin: 0;
      line-height: 1.25;
    }
    .wl-count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 7px;
      background: var(--brand-surface);
      color: var(--brand-primary);
      font-size: 12px;
      font-weight: 700;
      border-radius: 12px;
      border: 1.5px solid rgba(240,78,35,.18);
      line-height: 1;
    }
    .wl-header__sub {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
      margin-left: auto;
    }

    /* ── Grid ────────────────────────────────────────────────── */
    .wl-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    @media (max-width: 1199px) { .wl-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px)  { .wl-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 479px)  { .wl-grid { grid-template-columns: 1fr; } }

    /* ── Skeleton ────────────────────────────────────────────── */
    .wl-skeleton {
      background: #fff;
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-subtle);
    }
    .wl-skeleton__img  { height: 200px; border-radius: 0; }
    .wl-skeleton__body { padding: 14px; display: flex; flex-direction: column; gap: 0; }

    /* ── Empty state ─────────────────────────────────────────── */
    .wl-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 72px 24px 80px;
      max-width: 340px;
      margin: 0 auto;
    }
    .wl-empty__icon-wrap {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FFF0ED 0%, #FFE4DE 100%);
      border: 1.5px solid rgba(240,78,35,.14);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
      box-shadow: 0 4px 20px rgba(240,78,35,.10);
    }
    .wl-empty__icon {
      font-size: 34px !important;
      width: 34px !important;
      height: 34px !important;
      color: var(--brand-primary) !important;
      opacity: .75;
    }
    .wl-empty__heading {
      font-size: 17px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.3px;
      margin: 0 0 8px;
      line-height: 1.35;
    }
    .wl-empty__text {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0 0 28px;
      max-width: 268px;
    }
    .wl-empty__cta {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: var(--brand-primary);
      color: #fff;
      padding: 11px 22px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      letter-spacing: -0.1px;
      border: none;
      cursor: pointer;
      transition: background .15s ease, box-shadow .15s ease, transform .15s ease;
    }
    .wl-empty__cta mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }
    .wl-empty__cta:hover {
      background: var(--brand-hover);
      box-shadow: 0 4px 18px rgba(240,78,35,.28);
      transform: translateY(-1px);
      color: #fff;
      text-decoration: none;
    }
    .wl-empty__cta:active { transform: none; box-shadow: none; }

    /* ── Cards ───────────────────────────────────────────────── */
    .wl-card {
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-subtle);
      transition: transform .2s ease, box-shadow .2s ease;
      display: flex;
      flex-direction: column;
    }
    .wl-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    /* Image */
    .wl-card__img-wrap { position: relative; overflow: hidden; }
    .wl-card__img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
      transition: transform .35s ease;
    }
    .wl-card:hover .wl-card__img { transform: scale(1.04); }
    .wl-card__img-placeholder {
      width: 100%; height: 200px;
      background: var(--bg-page);
      display: flex; align-items: center; justify-content: center;
    }
    .wl-card__img-placeholder mat-icon {
      font-size: 40px !important; width: 40px !important; height: 40px !important;
      color: var(--text-placeholder);
    }

    /* Discount badge */
    .wl-card__discount {
      position: absolute; top: 8px; left: 8px;
      background: var(--brand-primary);
      color: #fff;
      font-size: 11px; font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      letter-spacing: .2px; line-height: 1.4;
    }

    /* Remove button */
    .wl-card__remove-btn {
      position: absolute; top: 8px; right: 8px;
      width: 32px; height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,.92);
      border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,.12);
      transition: background .15s ease, transform .15s ease;
      padding: 0;
    }
    .wl-card__remove-btn:hover { background: #fff; transform: scale(1.1); }
    .wl-card__remove-btn mat-icon {
      font-size: 17px !important; width: 17px !important; height: 17px !important;
      color: var(--brand-primary);
    }

    /* Out of stock */
    .wl-card__oos {
      position: absolute; inset: 0;
      background: rgba(0,0,0,.4);
      display: flex; align-items: center; justify-content: center;
    }
    .wl-card__oos span {
      background: rgba(0,0,0,.68);
      color: #fff; font-size: 12px; font-weight: 600;
      padding: 5px 12px; border-radius: 20px; letter-spacing: .2px;
    }

    /* Body */
    .wl-card__body {
      padding: 14px;
      display: flex; flex-direction: column; gap: 6px; flex: 1;
    }
    .wl-card__name {
      font-size: 13px; font-weight: 500;
      color: var(--text-primary); line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      min-height: 38px;
      text-decoration: none;
      transition: color .15s ease;
    }
    .wl-card__name:hover { color: var(--brand-primary); }

    /* Rating */
    .wl-card__rating { display: flex; align-items: center; gap: 3px; }
    .wl-card__star {
      font-size: 14px !important; width: 14px !important; height: 14px !important;
      color: #F59E0B !important;
    }
    .wl-card__rating-val { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .wl-card__rating-count { font-size: 12px; color: var(--text-secondary); }

    /* Price */
    .wl-card__price-row {
      display: flex; align-items: baseline; gap: 6px; margin-top: 2px;
    }
    .wl-card__price {
      font-size: 16px; font-weight: 700;
      color: var(--brand-primary); letter-spacing: -0.3px;
    }
    .wl-card__orig-price {
      font-size: 12px; color: var(--text-secondary); text-decoration: line-through;
    }

    /* Cart button */
    .wl-card__cart-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      width: 100%; height: 36px;
      background: var(--brand-primary);
      color: #fff; border: none;
      border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600;
      cursor: pointer; margin-top: auto; padding: 0 12px;
      letter-spacing: -0.1px;
      transition: background .15s ease, box-shadow .15s ease;
    }
    .wl-card__cart-btn mat-icon {
      font-size: 16px !important; width: 16px !important; height: 16px !important;
    }
    .wl-card__cart-btn:hover:not(:disabled) {
      background: var(--brand-hover);
      box-shadow: 0 2px 10px rgba(240,78,35,.25);
    }
    .wl-card__cart-btn:disabled {
      background: var(--border-subtle);
      color: var(--text-placeholder);
      cursor: not-allowed;
    }

    /* Spinner inside button */
    .wl-btn-spinner { --mdc-circular-progress-active-indicator-color: #fff; }
  `],
})
export class WishlistComponent implements OnInit {
  readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly addingToCart = signal<string | null>(null);
  readonly skeletons = [1, 2, 3, 4];

  getDiscount(price: number, originalPrice: number): number {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.wishlistService.load().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  onRemove(productId: string): void {
    this.wishlistService.toggle(productId).subscribe({
      next: () => {
        this.snackBar.open('Removido da lista de desejos', 'Fechar', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Erro ao remover item', 'Fechar', { duration: 3000 });
      },
    });
  }

  onAddToCart(productId: string): void {
    this.addingToCart.set(productId);
    this.cartService.addToCart(productId).subscribe({
      next: () => {
        this.addingToCart.set(null);
        this.snackBar.open('Adicionado ao carrinho', 'Ver carrinho', {
          duration: 3000,
          panelClass: 'snackbar-success',
        }).onAction().subscribe(() => this.router.navigate(['/cart']));
      },
      error: (err) => {
        this.addingToCart.set(null);
        const msg = err?.error?.errors?.[0] ?? 'Erro ao adicionar ao carrinho';
        this.snackBar.open(msg, 'Fechar', { duration: 3000 });
      },
    });
  }
}
