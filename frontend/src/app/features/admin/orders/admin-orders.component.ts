import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Pedidos</h2>
    <div class="bg-white rounded-lg shadow-sm p-6 text-center text-gray-400 italic">
      Gestão completa de pedidos implementada na ETAPA 8 + 10
    </div>
  `,
})
export class AdminOrdersComponent {}