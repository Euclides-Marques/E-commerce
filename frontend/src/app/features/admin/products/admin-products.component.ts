import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Produtos</h2>
      <button mat-raised-button color="primary">
        <mat-icon>add</mat-icon> Novo Produto
      </button>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-6 text-center text-gray-400 italic">
      Gestão completa de produtos implementada na ETAPA 4 + 10
    </div>
  `,
})
export class AdminProductsComponent {}