import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
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
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">{{ 'WISHLIST.TITLE' | translate }}</h1>
        @if (wishlistService.count() > 0) {
          <span class="text-sm text-gray-500">{{ wishlistService.count() }} {{ 'PRODUCT.REVIEWS' | translate }}</span>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (i of skeletons; track i) {
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="h-48 skeleton"></div>
              <div class="p-3 space-y-2">
                <div class="h-4 skeleton w-3/4"></div>
                <div class="h-5 skeleton w-1/2"></div>
                <div class="h-8 skeleton w-full"></div>
              </div>
            </div>
          }
        </div>
      }

      @if (!loading() && wishlistService.items().length === 0) {
        <div class="text-center py-20 text-gray-400">
          <mat-icon style="font-size: 80px; width: 80px; height: 80px" class="mb-4 text-gray-300">favorite_border</mat-icon>
          <p class="text-lg text-gray-500 mb-2">{{ 'WISHLIST.EMPTY' | translate }}</p>
          <a routerLink="/products" mat-flat-button color="primary" class="mt-4">
            {{ 'WISHLIST.EMPTY_CTA' | translate }}
          </a>
        </div>
      }

      @if (!loading() && wishlistService.items().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (item of wishlistService.items(); track item.productId) {
            <div class="bg-white rounded-lg shadow-sm overflow-hidden group animate-slide-up">
              <div class="relative">
                <a [routerLink]="['/products', item.productSlug]" class="block">
                  @if (item.imageUrl) {
                    <img
                      [src]="item.imageUrl"
                      [alt]="item.productName"
                      class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  } @else {
                    <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <mat-icon class="text-gray-300 text-5xl">image</mat-icon>
                    </div>
                  }
                </a>

                <!-- Botão remover -->
                <button
                  mat-icon-button
                  class="absolute top-1 right-1 bg-white/80 hover:bg-white"
                  style="width: 32px; height: 32px;"
                  (click)="onRemove(item.productId)">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px" class="text-red-500">favorite</mat-icon>
                </button>

                @if (!item.inStock) {
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">{{ 'PRODUCT.OUT_OF_STOCK' | translate }}</span>
                  </div>
                }
              </div>

              <div class="p-3">
                <a [routerLink]="['/products', item.productSlug]"
                   class="text-sm text-gray-700 line-clamp-2 mb-1 min-h-[2.5rem] block hover:text-primary-500 transition-colors">
                  {{ item.productName }}
                </a>

                <div class="flex items-center gap-1 mb-1">
                  <span class="text-primary-500 font-bold text-lg">
                    {{ item.price | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                  @if (item.originalPrice && item.originalPrice > item.price) {
                    <span class="text-gray-400 text-xs line-through">
                      {{ item.originalPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </span>
                  }
                </div>

                @if (item.averageRating > 0) {
                  <div class="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <mat-icon class="text-yellow-400 text-sm">star</mat-icon>
                    <span>{{ item.averageRating | number:'1.1-1' }}</span>
                    <span>({{ item.reviewCount }})</span>
                  </div>
                }

                <button
                  mat-flat-button
                  color="primary"
                  class="w-full text-sm"
                  [disabled]="!item.inStock || (addingToCart() === item.productId)"
                  (click)="onAddToCart(item.productId)">
                  @if (addingToCart() === item.productId) {
                    <mat-spinner diameter="16" class="inline-block mr-1"></mat-spinner>
                  } @else {
                    <mat-icon class="text-sm">shopping_cart</mat-icon>
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
})
export class WishlistComponent implements OnInit {
  readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly addingToCart = signal<string | null>(null);
  readonly skeletons = [1, 2, 3, 4];

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
