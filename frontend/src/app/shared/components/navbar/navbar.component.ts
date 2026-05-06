import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule, TranslateModule],
  template: `
    <mat-toolbar class="bg-primary-500 text-white sticky top-0 z-50 shadow-md">
      <div class="container mx-auto flex items-center justify-between w-full px-4">
        <!-- Logo -->
        <a routerLink="/" class="text-white text-2xl font-bold no-underline">
          🛒 ShopBR
        </a>

        <!-- Search Bar -->
        <div class="flex-1 mx-8 hidden md:block">
          <div class="relative">
            <input
              type="search"
              placeholder="Buscar produtos..."
              class="w-full px-4 py-2 rounded-full text-gray-800 text-sm outline-none"
              (keyup.enter)="onSearch($event)"
            />
            <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <mat-icon class="text-lg">search</mat-icon>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          @if (authService.isAuthenticated()) {
            <a routerLink="/cart" mat-icon-button>
              <mat-icon [matBadge]="cartService.totalItems()" matBadgeColor="warn" [matBadgeHidden]="cartService.totalItems() === 0">
                shopping_cart
              </mat-icon>
            </a>

            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <a mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon> Meu Perfil
              </a>
              <a mat-menu-item routerLink="/orders">
                <mat-icon>receipt</mat-icon> Meus Pedidos
              </a>
              @if (authService.isAdmin()) {
                <a mat-menu-item routerLink="/admin">
                  <mat-icon>admin_panel_settings</mat-icon> Admin
                </a>
              }
              <button mat-menu-item (click)="authService.logout()">
                <mat-icon>logout</mat-icon> Sair
              </button>
            </mat-menu>
          } @else {
            <a routerLink="/auth/login" mat-button class="text-white">Entrar</a>
            <a routerLink="/auth/register" mat-raised-button class="bg-white text-primary-500">Cadastrar</a>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    console.log('Buscar:', value);
  }
}
