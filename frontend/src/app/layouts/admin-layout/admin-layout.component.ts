import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatListModule, MatIconModule, MatToolbarModule],
  template: `
    <mat-sidenav-container class="min-h-screen">
      <mat-sidenav mode="side" opened class="w-64 bg-gray-900">
        <div class="p-4 text-white text-xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="bg-gray-700">
            <mat-icon matListItemIcon class="text-white">dashboard</mat-icon>
            <span matListItemTitle class="text-white">Dashboard</span>
          </a>
          <a mat-list-item routerLink="/admin/products" routerLinkActive="bg-gray-700">
            <mat-icon matListItemIcon class="text-white">inventory_2</mat-icon>
            <span matListItemTitle class="text-white">Produtos</span>
          </a>
          <a mat-list-item routerLink="/admin/orders" routerLinkActive="bg-gray-700">
            <mat-icon matListItemIcon class="text-white">receipt_long</mat-icon>
            <span matListItemTitle class="text-white">Pedidos</span>
          </a>
          <a mat-list-item routerLink="/admin/categories" routerLinkActive="bg-gray-700">
            <mat-icon matListItemIcon class="text-white">category</mat-icon>
            <span matListItemTitle class="text-white">Categorias</span>
          </a>
          <a mat-list-item routerLink="/admin/users" routerLinkActive="bg-gray-700">
            <mat-icon matListItemIcon class="text-white">people</mat-icon>
            <span matListItemTitle class="text-white">Usuários</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar class="bg-white border-b">
          <span class="font-semibold text-gray-700">Painel Administrativo</span>
        </mat-toolbar>
        <div class="p-6">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AdminLayoutComponent {}