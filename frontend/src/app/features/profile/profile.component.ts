import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatTabsModule, MatIconModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          <mat-icon class="text-primary-500 text-4xl">account_circle</mat-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">{{ user()?.firstName }} {{ user()?.lastName }}</h1>
          <p class="text-gray-500">{{ user()?.email }}</p>
        </div>
      </div>
      <mat-tab-group>
        <mat-tab label="Dados Pessoais">
          <div class="py-6 text-center text-gray-400 italic">Implementado na ETAPA 3</div>
        </mat-tab>
        <mat-tab label="Endereços">
          <div class="py-6 text-center text-gray-400 italic">Implementado na ETAPA 3</div>
        </mat-tab>
        <mat-tab label="Favoritos">
          <div class="py-6 text-center text-gray-400 italic">Implementado na ETAPA 3</div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class ProfileComponent {
  private authService = inject(AuthService);
  readonly user = this.authService.currentUser;
}