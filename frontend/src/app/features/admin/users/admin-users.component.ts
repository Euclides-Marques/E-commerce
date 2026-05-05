import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Usuários</h2>
    <div class="bg-white rounded-lg shadow-sm p-6 text-center text-gray-400 italic">
      Gestão completa de usuários implementada na ETAPA 3 + 10
    </div>
  `,
})
export class AdminUsersComponent {}