import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <!-- Hero Banner -->
    <section class="bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl p-10 mb-8 animate-fade-in">
      <div class="max-w-xl">
        <h1 class="text-4xl font-bold mb-4">As melhores ofertas estão aqui</h1>
        <p class="text-lg mb-6 text-primary-100">Compre com segurança, entrega rápida e os menores preços.</p>
        <a routerLink="/products" mat-raised-button class="bg-white text-primary-600 font-semibold px-8 py-3">
          Ver Produtos
        </a>
      </div>
    </section>

    <!-- Categories placeholder -->
    <section class="mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Categorias em destaque</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        @for (cat of categories; track cat.name) {
          <div class="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer product-card">
            <div class="text-3xl mb-2">{{ cat.icon }}</div>
            <p class="text-sm font-medium text-gray-700">{{ cat.name }}</p>
          </div>
        }
      </div>
    </section>

    <!-- Featured Products placeholder -->
    <section class="mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Produtos em destaque</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        @for (i of [1,2,3,4,5]; track i) {
          <div class="bg-white rounded-lg shadow-sm overflow-hidden product-card">
            <div class="h-48 skeleton"></div>
            <div class="p-3">
              <div class="h-4 skeleton mb-2 w-3/4"></div>
              <div class="h-5 skeleton w-1/2"></div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class HomeComponent {
  readonly categories = [
    { name: 'Eletrônicos', icon: '📱' },
    { name: 'Moda', icon: '👗' },
    { name: 'Casa', icon: '🏠' },
    { name: 'Esportes', icon: '⚽' },
    { name: 'Beleza', icon: '💄' },
    { name: 'Livros', icon: '📚' },
  ];
}