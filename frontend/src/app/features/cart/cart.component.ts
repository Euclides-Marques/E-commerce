import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Meu Carrinho</h1>
      <div class="bg-white rounded-xl shadow-sm p-8 text-center">
        <mat-icon class="text-6xl text-gray-300" style="font-size:64px;width:64px;height:64px;">shopping_cart</mat-icon>
        <p class="text-gray-500 mt-4 mb-6">Seu carrinho está vazio.</p>
        <a routerLink="/products" mat-raised-button color="primary">Ver Produtos</a>
        <p class="text-xs text-gray-400 mt-4 italic">Funcionalidade completa implementada na ETAPA 6</p>
      </div>
    </div>
  `,
})
export class CartComponent {}