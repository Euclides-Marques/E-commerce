import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductSummaryDto } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm overflow-hidden product-card group cursor-pointer"
         [routerLink]="['/products', product().slug]">
      <div class="relative overflow-hidden">
        @if (product().mainImageUrl) {
          <img
            [src]="product().mainImageUrl"
            [alt]="product().name"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        } @else {
          <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
            <mat-icon class="text-gray-300 text-5xl">image</mat-icon>
          </div>
        }

        @if (product().discountPercent && product().discountPercent! > 0) {
          <span class="absolute top-2 left-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{{ product().discountPercent | number:'1.0-0' }}%
          </span>
        }

        @if (!product().stockQuantity) {
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span class="text-white font-semibold text-sm">{{ 'PRODUCT.OUT_OF_STOCK' | translate }}</span>
          </div>
        }
      </div>

      <div class="p-3">
        <p class="text-sm text-gray-700 line-clamp-2 mb-1 min-h-[2.5rem]">{{ product().name }}</p>

        <div class="flex items-center gap-1 mb-1">
          <span class="text-primary-500 font-bold text-lg">
            {{ product().price | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
          </span>
          @if (product().originalPrice && product().originalPrice! > product().price) {
            <span class="text-gray-400 text-xs line-through">
              {{ product().originalPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
            </span>
          }
        </div>

        <div class="flex items-center gap-1 text-xs text-gray-500 mb-2">
          @if (product().averageRating > 0) {
            <mat-icon class="text-yellow-400 text-sm">star</mat-icon>
            <span>{{ product().averageRating | number:'1.1-1' }}</span>
            <span>({{ product().reviewCount }})</span>
            <span class="mx-1">·</span>
          }
          <span>{{ product().soldCount }} vendidos</span>
        </div>

        <button
          mat-flat-button
          color="primary"
          class="w-full text-sm"
          [disabled]="!product().stockQuantity"
          (click)="addToCart.emit(product()); $event.stopPropagation()">
          <mat-icon class="text-sm">shopping_cart</mat-icon>
          {{ 'PRODUCT.ADD_TO_CART' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<ProductSummaryDto>();
  readonly addToCart = output<ProductSummaryDto>();
}
