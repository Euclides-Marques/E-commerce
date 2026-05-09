import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationDto } from '../../../core/models/notification.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    TranslateModule,
  ],
  template: `
    <mat-toolbar class="sticky top-0 z-50">
      <div class="container mx-auto flex items-center justify-between w-full px-4">

        <!-- Logo -->
        <a routerLink="/" class="navbar-logo-text">
          Shop<span class="navbar-logo-accent">BR</span>
        </a>

        <!-- Search Bar -->
        <div class="flex-1 mx-8 hidden md:block">
          <div class="relative">
            <input
              type="search"
              placeholder="Buscar produtos..."
              class="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-800 text-sm outline-none bg-gray-50 focus:bg-white focus:border-primary-400 transition-colors"
              (keyup.enter)="onSearch($event)"
            />
            <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <mat-icon class="text-lg">search</mat-icon>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1">
          @if (authService.isAuthenticated()) {

            <!-- Notificações -->
            <button
              mat-icon-button
              [matMenuTriggerFor]="notificationMenu"
              [matTooltip]="'NOTIFICATIONS.TITLE' | translate"
              class="text-gray-600">
              <mat-icon
                [matBadge]="notificationService.unreadCount() || null"
                matBadgeColor="warn"
                matBadgeSize="small">
                notifications
              </mat-icon>
            </button>

            <!-- Menu de notificações -->
            <mat-menu #notificationMenu="matMenu" class="notification-panel">
              <div class="w-80" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span class="font-semibold text-gray-800 text-sm">
                    {{ 'NOTIFICATIONS.TITLE' | translate }}
                    @if (notificationService.unreadCount() > 0) {
                      <span class="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {{ notificationService.unreadCount() }}
                      </span>
                    }
                  </span>
                  @if (notificationService.unreadCount() > 0) {
                    <button
                      mat-button
                      color="primary"
                      class="text-xs !py-0 !min-h-0 !h-auto"
                      (click)="markAllAsRead()">
                      {{ 'NOTIFICATIONS.MARK_ALL' | translate }}
                    </button>
                  }
                </div>
                <div class="max-h-96 overflow-y-auto">
                  @if (notificationService.notifications().length === 0) {
                    <div class="flex flex-col items-center justify-center py-10 text-gray-400">
                      <mat-icon class="!text-4xl mb-2 opacity-40">notifications_none</mat-icon>
                      <p class="text-sm">{{ 'NOTIFICATIONS.EMPTY' | translate }}</p>
                    </div>
                  } @else {
                    @for (notif of notificationService.notifications().slice(0, 15); track notif.id) {
                      <button
                        mat-menu-item
                        (click)="onNotificationClick(notif)"
                        class="!h-auto !py-2 !px-0 w-full">
                        <div class="flex items-start gap-3 px-4 py-1 w-full">
                          <div
                            class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            [class]="notifIconBg(notif.type)">
                            <mat-icon class="!text-base !w-4 !h-4" [class]="notifIconColor(notif.type)">
                              {{ notifIcon(notif.type) }}
                            </mat-icon>
                          </div>
                          <div class="flex-1 min-w-0 text-left">
                            <p
                              class="text-sm truncate"
                              [class]="notif.isRead ? 'text-gray-500 font-normal' : 'text-gray-800 font-semibold'">
                              {{ notif.title }}
                            </p>
                            <p class="text-xs text-gray-400 line-clamp-2 leading-snug mt-0.5">
                              {{ notif.message }}
                            </p>
                            <p class="text-xs text-gray-300 mt-1">
                              {{ notif.createdAt | date:'dd/MM HH:mm' }}
                            </p>
                          </div>
                          @if (!notif.isRead) {
                            <div class="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2"></div>
                          }
                        </div>
                      </button>
                      <mat-divider></mat-divider>
                    }
                  }
                </div>
              </div>
            </mat-menu>

            <!-- Wishlist -->
            <a routerLink="/wishlist" mat-icon-button class="text-gray-600"
               [matTooltip]="'NAV.WISHLIST' | translate">
              <mat-icon
                [matBadge]="wishlistService.count() || null"
                matBadgeColor="accent"
                matBadgeSize="small">
                favorite_border
              </mat-icon>
            </a>

            <!-- Cart -->
            <a routerLink="/cart" mat-icon-button class="text-gray-600"
               [matTooltip]="'NAV.CART' | translate">
              <mat-icon
                [matBadge]="cartService.totalItems() || null"
                matBadgeColor="warn"
                matBadgeSize="small">
                shopping_cart
              </mat-icon>
            </a>

            <!-- Menu do usuário -->
            <button mat-icon-button class="text-gray-600" [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <a mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon> Meu Perfil
              </a>
              <a mat-menu-item routerLink="/orders">
                <mat-icon>receipt</mat-icon> Meus Pedidos
              </a>
              <a mat-menu-item routerLink="/wishlist">
                <mat-icon>favorite_border</mat-icon> Lista de Desejos
              </a>
              @if (authService.isAdmin()) {
                <a mat-menu-item routerLink="/admin">
                  <mat-icon>admin_panel_settings</mat-icon> Admin
                </a>
              }
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="authService.logout()">
                <mat-icon>logout</mat-icon> Sair
              </button>
            </mat-menu>

          } @else {
            <a routerLink="/auth/login" mat-button class="text-gray-700 font-medium">Entrar</a>
            <a routerLink="/auth/register" mat-flat-button
               style="background:#EE4D2D; color:#fff; border-radius:8px; font-size:13px; font-weight:600;">
              Cadastrar
            </a>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly notificationService = inject(NotificationService);

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    console.log('Buscar:', value);
  }

  onNotificationClick(notif: NotificationDto): void {
    this.notificationService.navigateTo(notif);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  notifIcon(type: string): string {
    switch (type) {
      case 'OrderPlaced': return 'shopping_bag';
      case 'OrderStatusChanged': return 'local_shipping';
      case 'PaymentConfirmed': return 'payments';
      case 'Welcome': return 'celebration';
      default: return 'notifications';
    }
  }

  notifIconBg(type: string): string {
    switch (type) {
      case 'OrderPlaced': return 'bg-blue-100';
      case 'OrderStatusChanged': return 'bg-orange-100';
      case 'PaymentConfirmed': return 'bg-green-100';
      case 'Welcome': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  }

  notifIconColor(type: string): string {
    switch (type) {
      case 'OrderPlaced': return 'text-blue-600';
      case 'OrderStatusChanged': return 'text-orange-600';
      case 'PaymentConfirmed': return 'text-green-600';
      case 'Welcome': return 'text-purple-600';
      default: return 'text-gray-500';
    }
  }
}
