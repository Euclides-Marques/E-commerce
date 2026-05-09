import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule, TranslateModule],
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
            <a routerLink="/products" [queryParams]="{featured: true}" class="cta-ghost">
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
      <div class="cat-grid">
        @for (cat of categories; track cat.nameKey) {
          <a routerLink="/products" [queryParams]="{category: cat.slug}" class="cat-card">
            <img [src]="cat.img" [alt]="cat.nameKey | translate" loading="lazy" />
            <span class="cat-label">{{ cat.nameKey | translate }}</span>
          </a>
        }
      </div>
    </section>

    <!-- ── Produtos em Destaque ───────────────────────────────────────────────── -->
    <section class="mb-12">
      <div class="sect-header">
        <p class="sect-eyebrow">{{ 'HOME.FEATURED_EYEBROW' | translate }}</p>
        <h2 class="sect-title">{{ 'HOME.FEATURED_TITLE' | translate }}</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
        @for (i of [1,2,3,4,5]; track i) {
          <div class="bg-white rounded-2xl overflow-hidden product-card shadow-sm">
            <div class="h-52 skeleton"></div>
            <div class="p-4">
              <div class="h-3 skeleton mb-2.5 rounded-full w-4/5"></div>
              <div class="h-3 skeleton mb-3 rounded-full w-3/5"></div>
              <div class="h-4 skeleton rounded-full w-2/5"></div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class HomeComponent {
  readonly categories = [
    {
      nameKey: 'HOME.CATEGORIES.ELETRONICOS',
      slug: 'eletronicos',
      img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=540&fit=crop&q=80&auto=format',
    },
    {
      nameKey: 'HOME.CATEGORIES.MODA',
      slug: 'moda',
      img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=540&fit=crop&q=80&auto=format',
    },
    {
      nameKey: 'HOME.CATEGORIES.CASA',
      slug: 'casa',
      img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=540&fit=crop&q=80&auto=format',
    },
    {
      nameKey: 'HOME.CATEGORIES.ESPORTES',
      slug: 'esportes',
      img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=540&fit=crop&q=80&auto=format',
    },
    {
      nameKey: 'HOME.CATEGORIES.BELEZA',
      slug: 'beleza',
      img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=540&fit=crop&q=80&auto=format',
    },
    {
      nameKey: 'HOME.CATEGORIES.LIVROS',
      slug: 'livros',
      img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=540&fit=crop&q=80&auto=format',
    },
  ];
}
