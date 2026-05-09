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
              [placeholder]="'PRODUCT.LIST.SEARCH_PLACEHOLDER' | translate"
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
              <div class="notif-panel" (click)="$event.stopPropagation()">

                <!-- Header -->
                <div class="notif-panel__header">
                  <div class="notif-panel__header-left">
                    <span class="notif-panel__title">{{ 'NOTIFICATIONS.TITLE' | translate }}</span>
                    @if (notificationService.unreadCount() > 0) {
                      <span class="notif-panel__badge">{{ notificationService.unreadCount() }}</span>
                    }
                  </div>
                  @if (notificationService.unreadCount() > 0) {
                    <button mat-button class="notif-panel__mark-all" (click)="markAllAsRead()">
                      {{ 'NOTIFICATIONS.MARK_ALL' | translate }}
                    </button>
                  }
                </div>

                <!-- Body -->
                <div class="notif-panel__body">
                  @if (notificationService.notifications().length === 0) {

                    <!-- Empty state -->
                    <div class="notif-empty">
                      <div class="notif-empty__icon-wrap">
                        <mat-icon class="notif-empty__icon">notifications_none</mat-icon>
                      </div>
                      <p class="notif-empty__heading">Tudo em dia!</p>
                      <p class="notif-empty__text">{{ 'NOTIFICATIONS.EMPTY' | translate }}</p>
                    </div>

                  } @else {
                    @for (notif of notificationService.notifications().slice(0, 15); track notif.id; let last = $last) {
                      <button
                        mat-menu-item
                        (click)="onNotificationClick(notif)"
                        class="notif-item-btn">
                        <div class="notif-item" [class.notif-item--unread]="!notif.isRead">
                          <div class="notif-item__icon-wrap" [class]="notifIconBg(notif.type)">
                            <mat-icon class="notif-item__icon" [class]="notifIconColor(notif.type)">
                              {{ notifIcon(notif.type) }}
                            </mat-icon>
                          </div>
                          <div class="notif-item__body">
                            <p class="notif-item__title"
                               [class.notif-item__title--unread]="!notif.isRead">
                              {{ notif.title }}
                            </p>
                            <p class="notif-item__msg">{{ notif.message }}</p>
                            <p class="notif-item__time">{{ notif.createdAt | date:'dd/MM HH:mm' }}</p>
                          </div>
                          @if (!notif.isRead) {
                            <span class="notif-item__dot"></span>
                          }
                        </div>
                      </button>
                      @if (!last) {
                        <div class="notif-item__divider"></div>
                      }
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
                <mat-icon>person</mat-icon> {{ 'NAV.MY_PROFILE' | translate }}
              </a>
              <a mat-menu-item routerLink="/orders">
                <mat-icon>receipt</mat-icon> {{ 'ORDERS.TITLE' | translate }}
              </a>
              <a mat-menu-item routerLink="/wishlist">
                <mat-icon>favorite_border</mat-icon> {{ 'WISHLIST.TITLE' | translate }}
              </a>
              @if (authService.isAdmin()) {
                <a mat-menu-item routerLink="/admin">
                  <mat-icon>admin_panel_settings</mat-icon> {{ 'NAV.ADMIN' | translate }}
                </a>
              }
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="authService.logout()">
                <mat-icon>logout</mat-icon> {{ 'NAV.LOGOUT' | translate }}
              </button>
            </mat-menu>

          } @else {
            <a routerLink="/auth/login" mat-button class="text-gray-700 font-medium">{{ 'NAV.LOGIN' | translate }}</a>
            <a routerLink="/auth/register" mat-flat-button
               style="background:#EE4D2D; color:#fff; border-radius:8px; font-size:13px; font-weight:600;">
              {{ 'NAV.REGISTER' | translate }}
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
