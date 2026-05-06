import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductImageDto } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
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
      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-500 mb-6">
        <a routerLink="/" class="hover:text-primary-500">Início</a>
        <span class="mx-2">/</span>
        <a routerLink="/products" class="hover:text-primary-500">{{ 'NAV.PRODUCTS' | translate }}</a>
        @if (product()) {
          <span class="mx-2">/</span>
          <span class="text-gray-800">{{ product()!.name }}</span>
        }
      </nav>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="h-96 skeleton rounded-xl"></div>
          <div class="space-y-4">
            <div class="h-6 skeleton w-3/4"></div>
            <div class="h-8 skeleton w-1/2"></div>
            <div class="h-4 skeleton w-full"></div>
            <div class="h-4 skeleton w-full"></div>
          </div>
        </div>
      }

      @if (!loading() && product()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Galeria de imagens -->
          <div>
            <div class="relative bg-gray-50 rounded-xl overflow-hidden mb-3" style="height: 400px">
              @if (selectedImage()) {
                <img
                  [src]="selectedImage()!.url"
                  [alt]="selectedImage()!.altText ?? product()!.name"
                  class="w-full h-full object-contain"
                />
              } @else {
                <div class="w-full h-full flex items-center justify-center text-gray-300">
                  <mat-icon style="font-size: 80px; width: 80px; height: 80px">image</mat-icon>
                </div>
              }
            </div>

            @if (product()!.images.length > 1) {
              <div class="flex gap-2 overflow-x-auto pb-1">
                @for (img of product()!.images; track img.id) {
                  <button
                    class="shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all"
                    [class.border-primary-500]="selectedImage()?.id === img.id"
                    [class.border-transparent]="selectedImage()?.id !== img.id"
                    (click)="selectedImage.set(img)">
                    <img [src]="img.url" [alt]="img.altText ?? ''" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Informações do produto -->
          <div class="space-y-4">
            <div>
              <span class="text-sm text-primary-500 font-medium">{{ product()!.categoryName }}</span>
              <h1 class="text-2xl font-bold text-gray-900 mt-1">{{ product()!.name }}</h1>
            </div>

            <!-- Rating -->
            @if (product()!.averageRating > 0) {
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-0.5">
                  @for (star of stars; track star) {
                    <mat-icon class="text-yellow-400 text-sm">
                      {{ star <= product()!.averageRating ? 'star' : 'star_border' }}
                    </mat-icon>
                  }
                </div>
                <span class="text-sm text-gray-600">
                  {{ product()!.averageRating | number:'1.1-1' }}
                  ({{ product()!.reviewCount }} {{ 'PRODUCT.REVIEWS' | translate }})
                </span>
                <span class="text-sm text-gray-400">· {{ product()!.soldCount }} vendidos</span>
              </div>
            }

            <!-- Preço -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-end gap-3">
                <span class="text-3xl font-bold text-primary-500">
                  {{ product()!.price | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
                @if (product()!.originalPrice && product()!.originalPrice! > product()!.price) {
                  <span class="text-lg text-gray-400 line-through">
                    {{ product()!.originalPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                  <span class="bg-primary-500 text-white text-sm font-bold px-2 py-0.5 rounded">
                    -{{ product()!.discountPercent | number:'1.0-0' }}%
                  </span>
                }
              </div>
            </div>

            <!-- Estoque -->
            <div class="flex items-center gap-2">
              @if (product()!.stockQuantity > 0) {
                <mat-icon class="text-green-500 text-sm">check_circle</mat-icon>
                <span class="text-sm text-green-600 font-medium">{{ 'PRODUCT.IN_STOCK' | translate }}</span>
                <span class="text-sm text-gray-400">({{ product()!.stockQuantity }} disponíveis)</span>
              } @else {
                <mat-icon class="text-red-400 text-sm">cancel</mat-icon>
                <span class="text-sm text-red-500 font-medium">{{ 'PRODUCT.OUT_OF_STOCK' | translate }}</span>
              }
            </div>

            <!-- Botões de ação -->
            <div class="flex flex-col gap-3 pt-2">
              <button
                mat-flat-button
                color="primary"
                class="py-3 text-base font-semibold"
                [disabled]="!product()!.stockQuantity || addingToCart()"
                (click)="onAddToCart()">
                <mat-icon>shopping_cart</mat-icon>
                {{ 'PRODUCT.ADD_TO_CART' | translate }}
              </button>
              <button
                mat-stroked-button
                color="primary"
                class="py-3 text-base font-semibold"
                [disabled]="!product()!.stockQuantity">
                <mat-icon>flash_on</mat-icon>
                {{ 'PRODUCT.BUY_NOW' | translate }}
              </button>
            </div>

            <!-- Descrição curta -->
            @if (product()!.shortDescription) {
              <p class="text-gray-600 text-sm">{{ product()!.shortDescription }}</p>
            }

            <!-- SKU -->
            <p class="text-xs text-gray-400">SKU: {{ product()!.sku }}</p>
          </div>
        </div>

        <!-- Descrição completa -->
        <div class="mt-10 bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">{{ 'PRODUCT.DETAIL.DESCRIPTION' | translate }}</h2>
          <div class="text-gray-600 leading-relaxed whitespace-pre-line">{{ product()!.description }}</div>
        </div>
      }

      @if (!loading() && !product()) {
        <div class="text-center py-20 text-gray-400">
          <mat-icon class="text-6xl mb-4">search_off</mat-icon>
          <p class="text-lg">{{ 'PRODUCT.DETAIL.NOT_FOUND' | translate }}</p>
          <a routerLink="/products" mat-stroked-button color="primary" class="mt-4">
            {{ 'PRODUCT.LIST.TITLE' | translate }}
          </a>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly product = this.productService.currentProduct;
  readonly loading = signal(false);
  readonly addingToCart = signal(false);
  readonly selectedImage = signal<ProductImageDto | null>(null);

  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) this.loadProduct(slug);
    });
  }

  ngOnDestroy(): void {
    this.productService.clearCurrentProduct();
  }

  onAddToCart(): void {
    const p = this.product();
    if (!p) return;

    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('CART.LOGIN_REQUIRED', 'Fazer login', { duration: 4000 })
        .onAction().subscribe(() => this.router.navigate(['/auth/login']));
      return;
    }

    this.addingToCart.set(true);
    this.cartService.addToCart(p.id).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.snackBar.open(`"${p.name}" ${'adicionado ao carrinho'}`, 'Ver carrinho', {
          duration: 3000,
          panelClass: 'snackbar-success',
        }).onAction().subscribe(() => this.router.navigate(['/cart']));
      },
      error: (err) => {
        this.addingToCart.set(false);
        const msg = err?.error?.errors?.[0] ?? 'Erro ao adicionar ao carrinho';
        this.snackBar.open(msg, 'Fechar', { duration: 3000 });
      },
    });
  }

  private loadProduct(slug: string): void {
    this.loading.set(true);
    this.productService.getProductBySlug(slug).subscribe({
      next: product => {
        const mainImg = product.images.find(i => i.isMain) ?? product.images[0] ?? null;
        this.selectedImage.set(mainImg);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Produto não encontrado.', 'Fechar', { duration: 3000 });
      },
    });
  }
}
