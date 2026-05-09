import { Component, inject, signal, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-profile-favorites',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    RouterLink,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="fav">

      <!-- ── Loading skeletons ──────────────────────────────────── -->
      @if (loading()) {
        <div class="fav-grid">
          @for (i of skeletons; track i) {
            <div class="fav-skeleton">
              <div class="skeleton fav-skeleton__img"></div>
              <div class="fav-skeleton__body">
                <div class="skeleton" style="height:12px;width:70%;border-radius:4px"></div>
                <div class="skeleton" style="height:18px;width:45%;border-radius:4px;margin-top:8px"></div>
                <div class="skeleton" style="height:34px;width:100%;border-radius:6px;margin-top:12px"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── Empty state ────────────────────────────────────────── -->
      @if (!loading() && svc.items().length === 0) {
        <div class="fav-empty">
          <div class="fav-empty__icon-wrap">
            <mat-icon class="fav-empty__icon">favorite_border</mat-icon>
          </div>
          <h3 class="fav-empty__heading">{{ 'PROFILE.FAVORITES.EMPTY_HEADING' | translate }}</h3>
          <p class="fav-empty__text">{{ 'PROFILE.FAVORITES.EMPTY_TEXT' | translate }}</p>
          <a routerLink="/products" class="fav-empty__cta">
            <mat-icon>storefront</mat-icon>
            {{ 'PROFILE.FAVORITES.EXPLORE' | translate }}
          </a>
        </div>
      }

      <!-- ── Count badge ─────────────────────────────────────────── -->
      @if (!loading() && svc.items().length > 0) {
        <div class="fav__head">
          <span class="fav__count-badge">{{ svc.count() }}</span>
          <span class="fav__head-sub">
            {{ 'PROFILE.FAVORITES.COUNT' | translate:{ count: svc.count() } }}
          </span>
        </div>
      }

      <!-- ── Grid ──────────────────────────────────────────────── -->
      @if (!loading() && svc.items().length > 0) {
        <div class="fav-grid">
          @for (item of svc.items(); track item.productId; let i = $index) {
            <div class="fav-card animate-slide-up" [style.animation-delay]="(i * 35) + 'ms'">

              <!-- Image -->
              <div class="fav-card__img-wrap">
                <a [routerLink]="['/products', item.productSlug]">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.productName"
                         class="fav-card__img" loading="lazy" />
                  } @else {
                    <div class="fav-card__img-placeholder">
                      <mat-icon>image</mat-icon>
                    </div>
                  }
                </a>

                @if (item.originalPrice && item.originalPrice > item.price) {
                  <span class="fav-card__discount">
                    -{{ getDiscount(item.price, item.originalPrice) }}%
                  </span>
                }

                <button class="fav-card__remove"
                        [attr.aria-label]="'WISHLIST.REMOVE' | translate"
                        (click)="onRemove(item.productId)">
                  <mat-icon>favorite</mat-icon>
                </button>

                @if (!item.inStock) {
                  <div class="fav-card__oos">
                    <span>{{ 'PROFILE.FAVORITES.OUT_OF_STOCK' | translate }}</span>
                  </div>
                }
              </div>

              <!-- Body -->
              <div class="fav-card__body">
                <a [routerLink]="['/products', item.productSlug]" class="fav-card__name">
                  {{ item.productName }}
                </a>

                @if (item.averageRating > 0) {
                  <div class="fav-card__rating">
                    <mat-icon class="fav-card__star">star</mat-icon>
                    <span class="fav-card__rating-val">{{ item.averageRating | number:'1.1-1' }}</span>
                    <span class="fav-card__rating-ct">({{ item.reviewCount }})</span>
                  </div>
                }

                <div class="fav-card__price-row">
                  <span class="fav-card__price">
                    {{ item.price | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                  @if (item.originalPrice && item.originalPrice > item.price) {
                    <span class="fav-card__orig">
                      {{ item.originalPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </span>
                  }
                </div>

                <button class="fav-card__cart-btn"
                        [disabled]="!item.inStock || (adding() === item.productId)"
                        (click)="onAddToCart(item.productId)">
                  @if (adding() === item.productId) {
                    <mat-spinner diameter="14" class="fav-btn-spinner"></mat-spinner>
                  } @else {
                    <mat-icon>shopping_cart</mat-icon>
                  }
                  {{ 'PROFILE.FAVORITES.ADD_TO_CART' | translate }}
                </button>
              </div>

            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    /* ── Head ────────────────────────────────────────────────────── */
    .fav__head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 18px;
    }
    .fav__count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 7px;
      background: rgba(240,78,35,.08);
      color: var(--brand-primary);
      font-size: 12px;
      font-weight: 700;
      border-radius: 12px;
      border: 1.5px solid rgba(240,78,35,.16);
    }
    .fav__head-sub {
      font-size: 13px;
      color: var(--text-secondary);
    }

    /* ── Grid ────────────────────────────────────────────────────── */
    .fav-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    @media (max-width: 1100px) { .fav-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 720px)  { .fav-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 420px)  { .fav-grid { grid-template-columns: 1fr; } }

    /* ── Skeleton ────────────────────────────────────────────────── */
    .fav-skeleton {
      background: var(--bg-page);
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-subtle);
    }
    .fav-skeleton__img { height: 180px; border-radius: 0; }
    .fav-skeleton__body { padding: 12px; display: flex; flex-direction: column; gap: 0; }

    /* ── Empty state ─────────────────────────────────────────────── */
    .fav-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 52px 24px 64px;
      max-width: 320px;
      margin: 0 auto;
    }
    .fav-empty__icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FFF0ED 0%, #FFE4DE 100%);
      border: 1.5px solid rgba(240,78,35,.14);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      box-shadow: 0 4px 18px rgba(240,78,35,.1);
    }
    .fav-empty__icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
      color: var(--brand-primary) !important;
      opacity: .75;
    }
    .fav-empty__heading {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px;
      letter-spacing: -0.3px;
    }
    .fav-empty__text {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.65;
      margin: 0 0 24px;
    }
    .fav-empty__cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--brand-primary);
      color: #fff;
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      font-size: 13.5px;
      font-weight: 600;
      text-decoration: none;
      transition: background .15s, box-shadow .15s, transform .15s;
    }
    .fav-empty__cta mat-icon {
      font-size: 17px !important;
      width: 17px !important;
      height: 17px !important;
    }
    .fav-empty__cta:hover {
      background: var(--brand-hover);
      box-shadow: 0 4px 16px rgba(240,78,35,.28);
      transform: translateY(-1px);
      color: #fff;
      text-decoration: none;
    }

    /* ── Card ────────────────────────────────────────────────────── */
    .fav-card {
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      transition: transform .2s, box-shadow .2s;
      display: flex;
      flex-direction: column;
    }
    .fav-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    .fav-card__img-wrap { position: relative; overflow: hidden; }
    .fav-card__img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
      transition: transform .35s ease;
    }
    .fav-card:hover .fav-card__img { transform: scale(1.04); }
    .fav-card__img-placeholder {
      width: 100%;
      height: 180px;
      background: var(--bg-page);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fav-card__img-placeholder mat-icon {
      font-size: 36px !important;
      width: 36px !important;
      height: 36px !important;
      color: var(--text-placeholder);
    }

    .fav-card__discount {
      position: absolute;
      top: 8px;
      left: 8px;
      background: var(--brand-primary);
      color: #fff;
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 7px;
      border-radius: 5px;
      letter-spacing: .2px;
    }

    .fav-card__remove {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(255,255,255,.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,.12);
      transition: background .15s, transform .15s;
      padding: 0;
    }
    .fav-card__remove:hover { background: #fff; transform: scale(1.1); }
    .fav-card__remove mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      color: var(--brand-primary);
    }

    .fav-card__oos {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,.38);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fav-card__oos span {
      background: rgba(0,0,0,.65);
      color: #fff;
      font-size: 11.5px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
    }

    .fav-card__body {
      padding: 13px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .fav-card__name {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text-primary);
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 36px;
      text-decoration: none;
      transition: color .15s;
    }
    .fav-card__name:hover { color: var(--brand-primary); }

    .fav-card__rating { display: flex; align-items: center; gap: 3px; }
    .fav-card__star {
      font-size: 13px !important;
      width: 13px !important;
      height: 13px !important;
      color: #F59E0B !important;
    }
    .fav-card__rating-val { font-size: 11.5px; font-weight: 600; color: var(--text-primary); }
    .fav-card__rating-ct  { font-size: 11.5px; color: var(--text-secondary); }

    .fav-card__price-row { display: flex; align-items: baseline; gap: 6px; margin-top: 1px; }
    .fav-card__price {
      font-size: 15px;
      font-weight: 700;
      color: var(--brand-primary);
      letter-spacing: -0.3px;
    }
    .fav-card__orig {
      font-size: 11.5px;
      color: var(--text-placeholder);
      text-decoration: line-through;
    }

    .fav-card__cart-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      height: 34px;
      background: var(--brand-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      margin-top: auto;
      padding: 0 10px;
      font-family: 'Inter', sans-serif;
      transition: background .15s, box-shadow .15s;
    }
    .fav-card__cart-btn mat-icon {
      font-size: 15px !important;
      width: 15px !important;
      height: 15px !important;
    }
    .fav-card__cart-btn:hover:not(:disabled) {
      background: var(--brand-hover);
      box-shadow: 0 2px 10px rgba(240,78,35,.25);
    }
    .fav-card__cart-btn:disabled {
      background: var(--border-subtle);
      color: var(--text-placeholder);
      cursor: not-allowed;
    }
    .fav-btn-spinner { --mdc-circular-progress-active-indicator-color: #fff; }
  `],
})
export class ProfileFavoritesComponent implements OnInit {
  readonly svc = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly adding  = signal<string | null>(null);
  readonly skeletons = [1, 2, 3, 4];

  getDiscount(price: number, original: number): number {
    return Math.round(((original - price) / original) * 100);
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.svc.load().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  onRemove(productId: string): void {
    this.svc.toggle(productId).subscribe({
      next: () => this.snackBar.open(
        this.translate.instant('PROFILE.FAVORITES.REMOVED'),
        this.translate.instant('PROFILE.FAVORITES.OK'),
        { duration: 2000 }
      ),
      error: () => this.snackBar.open(
        this.translate.instant('PROFILE.FAVORITES.REMOVE_ERROR'),
        this.translate.instant('PROFILE.FAVORITES.CLOSE'),
        { duration: 3000 }
      ),
    });
  }

  onAddToCart(productId: string): void {
    this.adding.set(productId);
    this.cartService.addToCart(productId).subscribe({
      next: () => {
        this.adding.set(null);
        this.snackBar.open(
          this.translate.instant('PROFILE.FAVORITES.ADD_TO_CART'),
          this.translate.instant('PROFILE.FAVORITES.VIEW_CART'),
          { duration: 3000, panelClass: 'snackbar-success' }
        ).onAction().subscribe(() => this.router.navigate(['/cart']));
      },
      error: (err) => {
        this.adding.set(null);
        const msg = err?.error?.errors?.[0] ?? this.translate.instant('PROFILE.FAVORITES.CART_ERROR');
        this.snackBar.open(msg, this.translate.instant('PROFILE.FAVORITES.CLOSE'), { duration: 3000 });
      },
    });
  }
}
