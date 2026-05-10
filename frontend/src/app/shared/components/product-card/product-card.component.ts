import { Component, inject, input, output } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ProductSummaryDto } from '../../../core/models/product.model';
import { WishlistItemDto } from '../../../core/models/wishlist.model';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, MatIconModule, MatTooltipModule, MatSnackBarModule, TranslatePipe],
  template: `
    <div class="pcard" [routerLink]="['/products', product().slug]">

      <!-- Imagem -->
      <div class="pcard-img-wrap">
        @if (product().mainImageUrl) {
          <img class="pcard-img" [src]="product().mainImageUrl" [alt]="product().name" loading="lazy" />
        } @else {
          <div class="pcard-placeholder">
            <mat-icon>image</mat-icon>
          </div>
        }

        @if (product().discountPercent && product().discountPercent! > 0) {
          <span class="pcard-badge">-{{ product().discountPercent | number:'1.0-0' }}%</span>
        }

        <button
          class="pcard-wishlist"
          [class.pcard-wishlist-on]="wishlistService.isInWishlist(product().id)"
          [matTooltip]="(wishlistService.isInWishlist(product().id) ? 'WISHLIST.REMOVE' : 'WISHLIST.ADD') | translate"
          (click)="onToggleWishlist($event)">
          <mat-icon>{{ wishlistService.isInWishlist(product().id) ? 'favorite' : 'favorite_border' }}</mat-icon>
        </button>

        @if (!product().stockQuantity) {
          <div class="pcard-out-overlay">
            <span>{{ 'PRODUCT.OUT_OF_STOCK' | translate }}</span>
          </div>
        }
      </div>

      <!-- Info -->
      <div class="pcard-body">
        <p class="pcard-name">{{ product().name }}</p>

        <div class="pcard-prices">
          <span class="pcard-price">{{ product().price | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
          @if (product().originalPrice && product().originalPrice! > product().price) {
            <span class="pcard-original">{{ product().originalPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
          }
        </div>

        <div class="pcard-meta">
          @if (product().averageRating > 0) {
            <span class="pcard-star-wrap">
              <mat-icon>star</mat-icon>
              {{ product().averageRating | number:'1.1-1' }}
            </span>
            <span>({{ product().reviewCount }})</span>
            <span>·</span>
          }
          <span>{{ product().soldCount }} vendidos</span>
        </div>

        <button
          class="pcard-cta"
          [disabled]="!product().stockQuantity"
          (click)="addToCart.emit(product()); $event.stopPropagation()">
          <mat-icon>shopping_cart</mat-icon>
          {{ 'PRODUCT.ADD_TO_CART' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<ProductSummaryDto>();
  readonly addToCart = output<ProductSummaryDto>();

  readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open(this.translate.instant('WISHLIST.LOGIN_REQUIRED'), this.translate.instant('NAV.LOGIN'), { duration: 4000 })
        .onAction().subscribe(() => this.router.navigate(['/auth/login']));
      return;
    }
    const p = this.product();
    this.wishlistService.toggle(p.id).subscribe({
      next: result => {
        if (result.isInWishlist) {
          const item: WishlistItemDto = {
            productId: p.id,
            productName: p.name,
            productSlug: p.slug,
            price: p.price,
            originalPrice: p.originalPrice,
            imageUrl: p.mainImageUrl,
            averageRating: p.averageRating,
            reviewCount: p.reviewCount,
            inStock: p.stockQuantity > 0,
            addedAt: new Date().toISOString(),
          };
          this.wishlistService.refreshAfterAdd(p.id, item);
          this.snackBar.open(this.translate.instant('WISHLIST.ADDED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000, panelClass: 'snackbar-success' });
        } else {
          this.snackBar.open(this.translate.instant('WISHLIST.REMOVED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
        }
      },
    });
  }
}
