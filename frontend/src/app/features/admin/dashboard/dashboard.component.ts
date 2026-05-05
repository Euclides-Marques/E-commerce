import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      @for (card of cards; track card.title) {
        <mat-card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">{{ card.title }}</p>
              <p class="text-2xl font-bold text-gray-800">{{ card.value }}</p>
            </div>
            <mat-icon [class]="card.color + ' text-4xl'" style="font-size:40px;width:40px;height:40px;">{{ card.icon }}</mat-icon>
          </div>
        </mat-card>
      }
    </div>
    <p class="text-sm text-gray-400 italic text-center">Dashboard completo implementado na ETAPA 10</p>
  `,
})
export class DashboardComponent {
  readonly cards = [
    { title: 'Total de Vendas', value: 'R$ 0', icon: 'attach_money', color: 'text-green-500' },
    { title: 'Pedidos', value: '0', icon: 'receipt_long', color: 'text-blue-500' },
    { title: 'Produtos', value: '0', icon: 'inventory_2', color: 'text-purple-500' },
    { title: 'Usuários', value: '0', icon: 'people', color: 'text-orange-500' },
  ];
}