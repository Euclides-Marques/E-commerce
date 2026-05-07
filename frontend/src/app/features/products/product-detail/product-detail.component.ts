import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ReviewService } from '../../../core/services/review.service';
import { ProductImageDto } from '../../../core/models/product.model';
import { WishlistItemDto } from '../../../core/models/wishlist.model';
import { ReviewSummaryDto } from '../../../core/models/review.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
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
              <div class="flex gap-2">
                <button
                  mat-flat-button
                  color="primary"
                  class="flex-1 py-3 text-base font-semibold"
                  [disabled]="!product()!.stockQuantity || addingToCart()"
                  (click)="onAddToCart()">
                  <mat-icon>shopping_cart</mat-icon>
                  {{ 'PRODUCT.ADD_TO_CART' | translate }}
                </button>
                <button
                  mat-stroked-button
                  class="py-3 px-4"
                  [disabled]="wishlistLoading()"
                  [matTooltip]="(wishlistService.isInWishlist(product()!.id) ? 'WISHLIST.REMOVE' : 'WISHLIST.ADD') | translate"
                  (click)="onToggleWishlist()">
                  <mat-icon [class.text-red-500]="wishlistService.isInWishlist(product()!.id)">
                    {{ wishlistService.isInWishlist(product()!.id) ? 'favorite' : 'favorite_border' }}
                  </mat-icon>
                </button>
              </div>
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

        <!-- Avaliações -->
        <div class="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-6">{{ 'REVIEW.TITLE' | translate }}</h2>

          @if (reviewsLoading()) {
            <div class="space-y-3">
              <div class="h-4 skeleton w-1/3"></div>
              <div class="h-4 skeleton w-full"></div>
              <div class="h-4 skeleton w-full"></div>
            </div>
          }

          @if (!reviewsLoading()) {
            <!-- Resumo de rating -->
            @if (reviewSummary() && reviewSummary()!.totalCount > 0) {
              <div class="flex flex-col md:flex-row gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
                <div class="text-center shrink-0">
                  <p class="text-5xl font-bold text-gray-800">{{ reviewSummary()!.averageRating | number:'1.1-1' }}</p>
                  <div class="flex justify-center gap-0.5 my-1">
                    @for (s of stars; track s) {
                      <mat-icon class="text-sm" [class.text-yellow-400]="s <= reviewSummary()!.averageRating" [class.text-gray-300]="s > reviewSummary()!.averageRating">star</mat-icon>
                    }
                  </div>
                  <p class="text-sm text-gray-500">{{ reviewSummary()!.totalCount }} {{ 'PRODUCT.REVIEWS' | translate }}</p>
                </div>
                <div class="flex-1 space-y-1.5">
                  @for (s of [5, 4, 3, 2, 1]; track s) {
                    <div class="flex items-center gap-2 text-sm">
                      <span class="w-16 shrink-0 text-gray-600">{{ s }} estrela{{ s > 1 ? 's' : '' }}</span>
                      <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-yellow-400 rounded-full transition-all" [style.width.%]="getStarPercent(s)"></div>
                      </div>
                      <span class="w-5 text-gray-500 text-right text-xs">{{ reviewSummary()!.starCounts[s - 1] }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Login para avaliar -->
            @if (!authService.isAuthenticated()) {
              <div class="mb-6 p-4 bg-blue-50 rounded-lg text-center">
                <p class="text-sm text-blue-700">
                  <a routerLink="/auth/login" class="font-semibold underline">{{ 'REVIEW.LOGIN_REQUIRED' | translate }}</a>
                  {{ 'REVIEW.LOGIN_TO_REVIEW' | translate }}
                </p>
              </div>
            }

            <!-- Formulário de avaliação -->
            @if (authService.isAuthenticated() && !hasReviewed()) {
              <div class="mb-8 p-4 border border-gray-200 rounded-lg">
                <h3 class="text-base font-semibold text-gray-800 mb-4">{{ 'REVIEW.WRITE_REVIEW' | translate }}</h3>

                <!-- Seletor de estrelas -->
                <div class="mb-4">
                  <p class="text-sm text-gray-600 mb-2">{{ 'REVIEW.RATING' | translate }}</p>
                  <div class="flex gap-1">
                    @for (s of stars; track s) {
                      <button
                        type="button"
                        class="transition-colors p-0"
                        (mouseenter)="hoverRating.set(s)"
                        (mouseleave)="hoverRating.set(0)"
                        (click)="selectedRating.set(s)">
                        <mat-icon style="font-size: 28px; width: 28px; height: 28px"
                          [class.text-yellow-400]="s <= (hoverRating() || selectedRating())"
                          [class.text-gray-300]="s > (hoverRating() || selectedRating())">
                          star
                        </mat-icon>
                      </button>
                    }
                  </div>
                </div>

                <form [formGroup]="reviewForm" (ngSubmit)="onSubmitReview()" class="space-y-3">
                  <mat-form-field class="w-full">
                    <mat-label>{{ 'REVIEW.TITLE_LABEL' | translate }}</mat-label>
                    <input matInput formControlName="title" maxlength="150" />
                  </mat-form-field>
                  <mat-form-field class="w-full">
                    <mat-label>{{ 'REVIEW.COMMENT_LABEL' | translate }}</mat-label>
                    <textarea matInput formControlName="comment" rows="3" maxlength="2000"></textarea>
                  </mat-form-field>
                  <button
                    mat-flat-button
                    color="primary"
                    type="submit"
                    [disabled]="submittingReview() || selectedRating() === 0">
                    @if (submittingReview()) {
                      <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner>
                    }
                    {{ 'REVIEW.SUBMIT' | translate }}
                  </button>
                </form>
              </div>
            }

            <!-- Lista de avaliações -->
            @if (reviewSummary() && reviewSummary()!.items.length > 0) {
              <div class="space-y-4">
                @for (review of reviewSummary()!.items; track review.id) {
                  <div class="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <p class="font-semibold text-sm text-gray-800">{{ review.userName }}</p>
                        <div class="flex gap-0.5 mt-0.5">
                          @for (s of stars; track s) {
                            <mat-icon class="text-xs" style="font-size: 14px; width: 14px; height: 14px"
                              [class.text-yellow-400]="s <= review.rating"
                              [class.text-gray-300]="s > review.rating">star</mat-icon>
                          }
                        </div>
                      </div>
                      <div class="flex items-center gap-2 flex-wrap justify-end">
                        @if (review.isVerifiedPurchase) {
                          <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {{ 'REVIEW.VERIFIED_PURCHASE' | translate }}
                          </span>
                        }
                        <span class="text-xs text-gray-400">{{ review.createdAt | date:'dd/MM/yyyy' }}</span>
                        @if (review.userId === authService.currentUser()?.id) {
                          <button
                            mat-icon-button
                            color="warn"
                            (click)="onDeleteReview(review.id)"
                            [matTooltip]="'REVIEW.DELETE' | translate">
                            <mat-icon style="font-size: 16px">delete</mat-icon>
                          </button>
                        }
                      </div>
                    </div>
                    @if (review.title) {
                      <p class="font-medium text-sm text-gray-700 mb-1">{{ review.title }}</p>
                    }
                    @if (review.comment) {
                      <p class="text-sm text-gray-600 leading-relaxed">{{ review.comment }}</p>
                    }
                    <div class="mt-3 flex items-center gap-1">
                      <button mat-button class="text-xs text-gray-500 h-7 min-h-0" (click)="onMarkHelpful(review.id)">
                        <mat-icon style="font-size: 14px" class="mr-1">thumb_up</mat-icon>
                        {{ 'REVIEW.HELPFUL' | translate }} ({{ review.helpfulCount }})
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Paginação -->
              @if (reviewSummary()!.totalPages > 1) {
                <div class="flex justify-center items-center gap-3 mt-6">
                  <button mat-icon-button [disabled]="currentReviewPage() === 1" (click)="loadReviews(currentReviewPage() - 1)">
                    <mat-icon>chevron_left</mat-icon>
                  </button>
                  <span class="text-sm text-gray-600">
                    {{ currentReviewPage() }} / {{ reviewSummary()!.totalPages }}
                  </span>
                  <button mat-icon-button [disabled]="currentReviewPage() === reviewSummary()!.totalPages" (click)="loadReviews(currentReviewPage() + 1)">
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
              }
            } @else {
              <p class="text-gray-500 text-sm py-6 text-center">{{ 'REVIEW.NO_REVIEWS' | translate }}</p>
            }
          }
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
  readonly authService = inject(AuthService);
  readonly wishlistService = inject(WishlistService);
  private readonly reviewService = inject(ReviewService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly product = this.productService.currentProduct;
  readonly loading = signal(false);
  readonly addingToCart = signal(false);
  readonly wishlistLoading = signal(false);
  readonly selectedImage = signal<ProductImageDto | null>(null);

  readonly reviewSummary = signal<ReviewSummaryDto | null>(null);
  readonly reviewsLoading = signal(false);
  readonly submittingReview = signal(false);
  readonly selectedRating = signal(0);
  readonly hoverRating = signal(0);
  readonly userReviewId = signal<string | null>(null);
  readonly currentReviewPage = signal(1);
  readonly hasReviewed = computed(() => this.userReviewId() !== null);

  readonly reviewForm = this.fb.group({
    title: ['', Validators.maxLength(150)],
    comment: ['', Validators.maxLength(2000)],
  });

  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) this.loadProduct(slug);
    });
    if (this.authService.isAuthenticated()) {
      this.wishlistService.load().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.productService.clearCurrentProduct();
  }

  loadReviews(page = 1): void {
    const p = this.product();
    if (!p) return;
    this.reviewsLoading.set(true);
    this.currentReviewPage.set(page);
    this.reviewService.getProductReviews(p.id, page, 10).subscribe({
      next: summary => {
        this.reviewSummary.set(summary);
        this.reviewsLoading.set(false);
        const currentUserId = this.authService.currentUser()?.id;
        if (currentUserId) {
          const mine = summary.items.find(r => r.userId === currentUserId);
          if (mine) this.userReviewId.set(mine.id);
        }
      },
      error: () => this.reviewsLoading.set(false),
    });
  }

  onAddToCart(): void {
    const p = this.product();
    if (!p) return;

    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Faça login para adicionar ao carrinho', 'Entrar', { duration: 4000 })
        .onAction().subscribe(() => this.router.navigate(['/auth/login']));
      return;
    }

    this.addingToCart.set(true);
    this.cartService.addToCart(p.id).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.snackBar.open(`"${p.name}" adicionado ao carrinho`, 'Ver carrinho', {
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

  onToggleWishlist(): void {
    const p = this.product();
    if (!p) return;

    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Faça login para usar a lista de desejos', 'Entrar', { duration: 4000 })
        .onAction().subscribe(() => this.router.navigate(['/auth/login']));
      return;
    }

    this.wishlistLoading.set(true);
    this.wishlistService.toggle(p.id).subscribe({
      next: result => {
        this.wishlistLoading.set(false);
        if (result.isInWishlist) {
          const item: WishlistItemDto = {
            productId: p.id,
            productName: p.name,
            productSlug: p.slug,
            price: p.price,
            originalPrice: p.originalPrice,
            imageUrl: this.selectedImage()?.url,
            averageRating: p.averageRating,
            reviewCount: p.reviewCount,
            inStock: p.stockQuantity > 0,
            addedAt: new Date().toISOString(),
          };
          this.wishlistService.refreshAfterAdd(p.id, item);
          this.snackBar.open('Adicionado à lista de desejos', 'Ver lista', { duration: 3000 })
            .onAction().subscribe(() => this.router.navigate(['/wishlist']));
        } else {
          this.snackBar.open('Removido da lista de desejos', 'Fechar', { duration: 2000 });
        }
      },
      error: () => {
        this.wishlistLoading.set(false);
        this.snackBar.open('Erro ao atualizar lista de desejos', 'Fechar', { duration: 3000 });
      },
    });
  }

  onSubmitReview(): void {
    if (this.selectedRating() === 0) return;
    const p = this.product();
    if (!p) return;

    this.submittingReview.set(true);
    this.reviewService.createReview(p.id, {
      rating: this.selectedRating(),
      title: this.reviewForm.get('title')?.value || undefined,
      comment: this.reviewForm.get('comment')?.value || undefined,
    }).subscribe({
      next: review => {
        this.submittingReview.set(false);
        this.userReviewId.set(review.id);
        this.reviewForm.reset();
        this.selectedRating.set(0);
        this.snackBar.open('Avaliação publicada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: 'snackbar-success',
        });
        this.loadReviews(1);
      },
      error: (err) => {
        this.submittingReview.set(false);
        const msg = err?.error?.errors?.[0] ?? 'Erro ao publicar avaliação';
        this.snackBar.open(msg, 'Fechar', { duration: 3000 });
      },
    });
  }

  onDeleteReview(reviewId: string): void {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.userReviewId.set(null);
        this.snackBar.open('Avaliação excluída.', 'Fechar', { duration: 2000 });
        this.loadReviews(this.currentReviewPage());
      },
      error: () => {
        this.snackBar.open('Erro ao excluir avaliação', 'Fechar', { duration: 3000 });
      },
    });
  }

  onMarkHelpful(reviewId: string): void {
    this.reviewService.markHelpful(reviewId).subscribe({
      next: () => this.loadReviews(this.currentReviewPage()),
    });
  }

  getStarPercent(star: number): number {
    const s = this.reviewSummary();
    if (!s || s.totalCount === 0) return 0;
    return Math.round((s.starCounts[star - 1] / s.totalCount) * 100);
  }

  private loadProduct(slug: string): void {
    this.loading.set(true);
    this.userReviewId.set(null);
    this.reviewSummary.set(null);
    this.productService.getProductBySlug(slug).subscribe({
      next: product => {
        const mainImg = product.images.find(i => i.isMain) ?? product.images[0] ?? null;
        this.selectedImage.set(mainImg);
        this.loading.set(false);
        this.loadReviews(1);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Produto não encontrado.', 'Fechar', { duration: 3000 });
      },
    });
  }
}
