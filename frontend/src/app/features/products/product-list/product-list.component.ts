import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="flex gap-6">
      <!-- Filtros -->
      <aside class="w-64 hidden md:block">
        <div class="bg-white rounded-lg shadow-sm p-4">
          <h3 class="font-semibold text-gray-800 mb-3">Filtros</h3>
          <div class="h-4 skeleton mb-2 w-full"></div>
          <div class="h-4 skeleton mb-2 w-3/4"></div>
          <div class="h-4 skeleton w-1/2"></div>
        </div>
      </aside>

      <!-- Produtos -->
      <div class="flex-1">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-bold text-gray-800">Todos os Produtos</h1>
          <span class="text-sm text-gray-500">Implementado na ETAPA 4</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="bg-white rounded-lg shadow-sm overflow-hidden product-card">
              <div class="h-48 skeleton"></div>
              <div class="p-3 space-y-2">
                <div class="h-4 skeleton w-3/4"></div>
                <div class="h-5 skeleton w-1/2"></div>
                <div class="h-3 skeleton w-full"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ProductListComponent {}