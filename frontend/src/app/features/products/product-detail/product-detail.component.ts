import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="h-96 skeleton rounded-xl"></div>
      <div class="space-y-4">
        <div class="h-6 skeleton w-3/4"></div>
        <div class="h-8 skeleton w-1/2"></div>
        <div class="h-4 skeleton w-full"></div>
        <div class="h-4 skeleton w-full"></div>
        <p class="text-sm text-gray-400 italic">Detalhes implementados na ETAPA 4</p>
        <button mat-raised-button color="primary" disabled>
          <mat-icon>shopping_cart</mat-icon> Adicionar ao Carrinho
        </button>
      </div>
    </div>
  `,
})
export class ProductDetailComponent {}