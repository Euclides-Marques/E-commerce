import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Meus Pedidos</h1>
      <div class="bg-white rounded-xl shadow-sm p-8 text-center">
        <mat-icon class="text-6xl text-gray-300" style="font-size:64px;width:64px;height:64px;">receipt_long</mat-icon>
        <p class="text-gray-500 mt-4">Nenhum pedido encontrado.</p>
        <p class="text-xs text-gray-400 mt-2 italic">Funcionalidade completa implementada na ETAPA 8</p>
      </div>
    </div>
  `,
})
export class OrdersComponent {}