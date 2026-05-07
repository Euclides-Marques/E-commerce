import { Injectable, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationDto, NotificationsPage } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly _notifications = signal<NotificationDto[]>([]);
  private readonly _loading = signal(false);

  readonly notifications = this._notifications.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly unreadCount = computed(
    () => this._notifications().filter((n) => !n.isRead).length
  );

  private hubConnection?: HubConnection;

  constructor() {
    // Conectar/desconectar automaticamente conforme estado de autenticação
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.connect();
        this.loadNotifications().subscribe();
      } else {
        this.disconnect();
        this._notifications.set([]);
      }
    });
  }

  private connect(): void {
    if (this.hubConnection?.state === HubConnectionState.Connected) return;

    const hubUrl =
      environment.apiUrl.replace('/api', '') + '/hubs/notifications';

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.authService.getAccessToken() ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(
        environment.production ? LogLevel.Error : LogLevel.Warning
      )
      .build();

    this.hubConnection.on('ReceiveNotification', (notification: NotificationDto) => {
      this._notifications.update((list) => [notification, ...list]);
    });

    this.hubConnection
      .start()
      .catch((err) =>
        console.warn('[NotificationService] Erro ao conectar SignalR:', err)
      );
  }

  private disconnect(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = undefined;
    }
  }

  loadNotifications(page = 1, pageSize = 30) {
    this._loading.set(true);
    return this.http
      .get<NotificationsPage>(`${environment.apiUrl}/notifications`, {
        params: { page, pageSize },
      })
      .pipe(
        tap({
          next: (result) => {
            if (page === 1) this._notifications.set(result.items);
            else
              this._notifications.update((list) => [...list, ...result.items]);
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        })
      );
  }

  markAsRead(id: string) {
    return this.http
      .put<void>(`${environment.apiUrl}/notifications/${id}/read`, {})
      .pipe(
        tap(() =>
          this._notifications.update((list) =>
            list.map((n) => (n.id === id ? { ...n, isRead: true } : n))
          )
        )
      );
  }

  markAllAsRead() {
    return this.http
      .put<void>(`${environment.apiUrl}/notifications/read-all`, {})
      .pipe(
        tap(() =>
          this._notifications.update((list) =>
            list.map((n) => ({ ...n, isRead: true }))
          )
        )
      );
  }

  navigateTo(notification: NotificationDto): void {
    if (!notification.isRead) {
      this.markAsRead(notification.id).subscribe();
    }
    if (notification.relatedUrl) {
      this.router.navigateByUrl(notification.relatedUrl);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
