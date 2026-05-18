import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { CategoryDto } from '../../core/models/category.model';
import { ProductSummaryDto } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatSnackBarModule, TranslateModule, ProductCardComponent],
  template: `
    <!-- ── Hero ──────────────────────────────────────────────────────────────── -->
    <section class="hero-wrap -mt-6 -mx-4 mb-8">
      <div class="hero-grid">
        <div class="hero-copy">
          <span class="hero-eyebrow">{{ 'HOME.EYEBROW' | translate }}</span>
          <h1 class="hero-title">
            {{ 'HOME.TITLE_PART1' | translate }}<span class="hero-accent">{{ 'HOME.TITLE_ACCENT' | translate }}</span>{{ 'HOME.TITLE_PART2' | translate }}
          </h1>
          <p class="hero-body">{{ 'HOME.SUBTITLE' | translate }}</p>
          <div class="hero-ctas">
            <a routerLink="/products" class="cta-primary">{{ 'HOME.CTA_PRIMARY' | translate }}</a>
            <a routerLink="/products" [queryParams]="{isFeatured: true}" class="cta-ghost">
              {{ 'HOME.CTA_SECONDARY' | translate }} <span class="ml-1">→</span>
            </a>
          </div>
        </div>

        <div class="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=600&fit=crop&q=85&auto=format"
            alt="{{ 'HOME.SUBTITLE' | translate }}"
            loading="eager"
          />
        </div>
      </div>
    </section>

    <!-- ── Trust Bar ──────────────────────────────────────────────────────────── -->
    <section class="trust-bar mb-10">
      <div class="trust-item">
        <div class="trust-icon-wrap">
          <mat-icon>local_shipping</mat-icon>
        </div>
        <div>
          <p class="trust-title">{{ 'HOME.TRUST_SHIPPING_TITLE' | translate }}</p>
          <p class="trust-desc">{{ 'HOME.TRUST_SHIPPING_DESC' | translate }}</p>
        </div>
      </div>
      <div class="trust-item">
        <div class="trust-icon-wrap">
          <mat-icon>verified_user</mat-icon>
        </div>
        <div>
          <p class="trust-title">{{ 'HOME.TRUST_SECURITY_TITLE' | translate }}</p>
          <p class="trust-desc">{{ 'HOME.TRUST_SECURITY_DESC' | translate }}</p>
        </div>
      </div>
      <div class="trust-item">
        <div class="trust-icon-wrap">
          <mat-icon>replay</mat-icon>
        </div>
        <div>
          <p class="trust-title">{{ 'HOME.TRUST_RETURN_TITLE' | translate }}</p>
          <p class="trust-desc">{{ 'HOME.TRUST_RETURN_DESC' | translate }}</p>
        </div>
      </div>
    </section>

    <!-- ── Categorias ─────────────────────────────────────────────────────────── -->
    <section class="mb-12">
      <div class="sect-header">
        <p class="sect-eyebrow">{{ 'HOME.CATEGORIES_EYEBROW' | translate }}</p>
        <h2 class="sect-title">{{ 'HOME.CATEGORIES_TITLE' | translate }}</h2>
      </div>

      @if (loadingCategories()) {
        <div class="cat-grid">
          @for (i of skeletons; track i) {
            <div class="cat-card-skeleton rounded-2xl overflow-hidden">
              <div class="h-52 skeleton"></div>
              <div class="p-3">
                <div class="h-3 skeleton rounded-full w-3/4 mx-auto"></div>
              </div>
            </div>
          }
        </div>
      } @else if (categories().length === 0) {
        <p class="text-center text-gray-400 py-8">{{ 'HOME.CATEGORIES_EMPTY' | translate }}</p>
      } @else {
        <div class="cat-grid">
          @for (cat of categories(); track cat.id) {
            <a routerLink="/products" [queryParams]="{categoryId: cat.id}" class="cat-card">
              @if (cat.imageUrl) {
                <img [src]="cat.imageUrl" [alt]="cat.name" loading="lazy" />
              } @else {
                <div class="flex items-center justify-center bg-gray-100 h-52 text-gray-300">
                  <mat-icon style="font-size:48px;width:48px;height:48px">category</mat-icon>
                </div>
              }
              <span class="cat-label">{{ cat.name }}</span>
            </a>
          }
        </div>
      }
    </section>

    <!-- ── Produtos em Destaque ───────────────────────────────────────────────── -->
    <section class="mb-12">
      <div class="sect-header">
        <p class="sect-eyebrow">{{ 'HOME.FEATURED_EYEBROW' | translate }}</p>
        <h2 class="sect-title">{{ 'HOME.FEATURED_TITLE' | translate }}</h2>
        <a routerLink="/products" [queryParams]="{isFeatured: true}" class="ml-auto text-sm font-medium text-primary-500 hover:underline">
          {{ 'HOME.VIEW_ALL' | translate }} →
        </a>
      </div>

      @if (loadingFeatured()) {
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          @for (i of skeletons; track i) {
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div class="h-52 skeleton"></div>
              <div class="p-4">
                <div class="h-3 skeleton mb-2.5 rounded-full w-4/5"></div>
                <div class="h-3 skeleton mb-3 rounded-full w-3/5"></div>
                <div class="h-4 skeleton rounded-full w-2/5"></div>
              </div>
            </div>
          }
        </div>
      } @else if (featuredProducts().length === 0) {
        <p class="text-center text-gray-400 py-8">{{ 'HOME.PRODUCTS_EMPTY' | translate }}</p>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          @for (product of featuredProducts(); track product.id) {
            <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
          }
        </div>
      }
    </section>

    <!-- ── Todos os Produtos ─────────────────────────────────────────────────── -->
    <section class="mb-12">
      <div class="sect-header">
        <p class="sect-eyebrow">{{ 'HOME.ALL_PRODUCTS_EYEBROW' | translate }}</p>
        <h2 class="sect-title">{{ 'HOME.ALL_PRODUCTS_TITLE' | translate }}</h2>
        <a routerLink="/products" class="ml-auto text-sm font-medium text-primary-500 hover:underline">{{ 'HOME.VIEW_ALL' | translate }} →</a>
      </div>

      @if (loadingAll()) {
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          @for (i of skeletons; track i) {
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div class="h-52 skeleton"></div>
              <div class="p-4">
                <div class="h-3 skeleton mb-2.5 rounded-full w-4/5"></div>
                <div class="h-3 skeleton mb-3 rounded-full w-3/5"></div>
                <div class="h-4 skeleton rounded-full w-2/5"></div>
              </div>
            </div>
          }
        </div>
      } @else if (allProducts().length === 0) {
        <p class="text-center text-gray-400 py-8">{{ 'HOME.PRODUCTS_EMPTY' | translate }}</p>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          @for (product of allProducts(); track product.id) {
            <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
          }
        </div>
      }
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = signal<CategoryDto[]>([]);
  readonly featuredProducts = signal<ProductSummaryDto[]>([]);
  readonly allProducts = signal<ProductSummaryDto[]>([]);
  readonly loadingCategories = signal(true);
  readonly loadingFeatured = signal(true);
  readonly loadingAll = signal(true);

  readonly skeletons = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.categoryService.getCategories(true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: cats => { this.categories.set(cats); this.loadingCategories.set(false); },
        error: () => this.loadingCategories.set(false),
      });

    this.productService.getProducts({ isFeatured: true, isActive: true, pageSize: 5 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => { this.featuredProducts.set(result.items); this.loadingFeatured.set(false); },
        error: () => this.loadingFeatured.set(false),
      });

    this.productService.getProducts({ isActive: true, pageSize: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => { this.allProducts.set(result.items); this.loadingAll.set(false); },
        error: () => this.loadingAll.set(false),
      });
  }

  onAddToCart(product: ProductSummaryDto): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open(
        this.translate.instant('CART.LOGIN_REQUIRED'),
        this.translate.instant('NAV.LOGIN'),
        { duration: 4000 }
      ).onAction().subscribe(() => this.router.navigate(['/auth/login']));
      return;
    }
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => this.snackBar.open(
        this.translate.instant('CART.PRODUCT_ADDED', { name: product.name }),
        this.translate.instant('CART.VIEW_CART'),
        { duration: 3000, panelClass: 'snackbar-success' }
      ),
      error: () => this.snackBar.open(
        this.translate.instant('CART.ERROR_ADD'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      ),
    });
  }
}
