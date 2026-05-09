import { Component, DestroyRef, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../core/services/auth.service';

interface AdminNavItem {
  label: string;
  route: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
  ],
  template: `
    <mat-sidenav-container class="admin-layout admin-shell">
      <mat-sidenav
        class="admin-sidebar"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() || sidenavOpen()"
        [fixedInViewport]="isMobile()"
        (closedStart)="sidenavOpen.set(false)">

        <aside class="admin-sidebar__inner" aria-label="Navegação administrativa">
          <a class="admin-brand" routerLink="/admin/dashboard" aria-label="Ir para o dashboard administrativo">
            <span class="admin-brand__mark">
              <mat-icon aria-hidden="true">storefront</mat-icon>
            </span>
            <span class="admin-brand__copy">
              <span class="admin-brand__name">Admin Panel</span>
              <span class="admin-brand__meta">E-commerce</span>
            </span>
          </a>

          <nav class="admin-nav">
            <p class="admin-nav__eyebrow">Gestão</p>

            @for (item of navItems; track item.route) {
              <a
                class="admin-nav__item"
                [routerLink]="item.route"
                routerLinkActive="admin-nav__item--active"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="closeMobileSidenav()">
                <span class="admin-nav__icon">
                  <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
                </span>
                <span class="admin-nav__content">
                  <span class="admin-nav__label">{{ item.label }}</span>
                  <span class="admin-nav__desc">{{ item.description }}</span>
                </span>
              </a>
            }
          </nav>

          <div class="admin-sidebar__footer">
            <a class="admin-sidebar__store-link" routerLink="/" (click)="closeMobileSidenav()">
              <mat-icon aria-hidden="true">arrow_outward</mat-icon>
              <span>Ver loja</span>
            </a>
          </div>
        </aside>
      </mat-sidenav>

      <mat-sidenav-content class="admin-content">
        <header class="admin-topbar">
          <div class="admin-topbar__left">
            @if (isMobile()) {
              <button
                mat-icon-button
                type="button"
                class="admin-topbar__menu"
                aria-label="Abrir navegação"
                (click)="sidenavOpen.set(true)">
                <mat-icon>menu</mat-icon>
              </button>
            }

            <div>
              <p class="admin-topbar__eyebrow">Painel Administrativo</p>
              <h1 class="admin-topbar__title">Operação da loja</h1>
            </div>
          </div>

          <div class="admin-topbar__right">
            <div class="admin-user">
              <span class="admin-user__avatar" aria-hidden="true">{{ userInitials() }}</span>
              <span class="admin-user__meta">
                <span class="admin-user__name">{{ userName() }}</span>
                <span class="admin-user__role">Administrador</span>
              </span>
            </div>

            <button
              mat-icon-button
              type="button"
              class="admin-topbar__logout"
              aria-label="Sair do painel"
              (click)="logout()">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </header>

        <main class="admin-main">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .admin-layout {
      min-height: 100vh;
    }

    .admin-sidebar {
      width: 280px;
      border-right: 1px solid var(--admin-border);
      background: var(--admin-surface);
      color: var(--admin-text);
    }

    .admin-sidebar__inner {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 18px;
      background:
        linear-gradient(180deg, var(--admin-accent-soft) 0%, rgba(255, 255, 255, 0) 34%),
        var(--admin-surface);
    }

    .admin-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 8px 22px;
      color: var(--text-heading);
      text-decoration: none;
    }

    .admin-brand__mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 13px;
      background: var(--admin-accent-soft);
      box-shadow: inset 0 0 0 1px rgba(240, 78, 35, .14);
    }

    .admin-brand__mark mat-icon {
      color: var(--brand-primary);
      font-size: 21px;
      width: 21px;
      height: 21px;
    }

    .admin-brand__copy,
    .admin-nav__content,
    .admin-user__meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .admin-brand__name {
      font-size: 16px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -.02em;
    }

    .admin-brand__meta {
      margin-top: 2px;
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 600;
    }

    .admin-nav {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding-top: 8px;
      border-top: 1px solid var(--admin-border);
    }

    .admin-nav__eyebrow {
      margin: 8px 8px 10px;
      color: var(--text-placeholder);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .1em;
      text-transform: uppercase;
    }

    .admin-nav__item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 58px;
      padding: 10px 12px;
      border-radius: 14px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: background var(--motion-fast), color var(--motion-fast), transform var(--motion-fast);
    }

    .admin-nav__item:hover {
      background: var(--bg-surface-soft);
      color: var(--text-heading);
      transform: translateX(2px);
    }

    .admin-nav__item--active {
      background: var(--admin-accent-soft);
      color: var(--brand-primary);
    }

    .admin-nav__item--active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 14px;
      bottom: 14px;
      width: 3px;
      border-radius: 999px;
      background: var(--brand-primary);
    }

    .admin-nav__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 11px;
      background: var(--bg-surface-soft);
      flex: 0 0 auto;
    }

    .admin-nav__item--active .admin-nav__icon {
      background: var(--brand-primary);
      color: #FFFFFF;
      box-shadow: 0 8px 18px rgba(240, 78, 35, .20);
    }

    .admin-nav__icon mat-icon {
      font-size: 19px;
      width: 19px;
      height: 19px;
    }

    .admin-nav__label {
      font-size: 14px;
      font-weight: 800;
      line-height: 1.25;
    }

    .admin-nav__desc {
      margin-top: 2px;
      color: var(--text-placeholder);
      font-size: 12px;
      line-height: 1.35;
    }

    .admin-nav__item--active .admin-nav__desc {
      color: var(--brand-hover);
    }

    .admin-sidebar__footer {
      margin-top: auto;
      padding-top: 18px;
    }

    .admin-sidebar__store-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 13px 14px;
      border: 1px solid var(--admin-border);
      border-radius: 14px;
      background: var(--bg-surface-soft);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 800;
      text-decoration: none;
      transition: background var(--motion-fast), color var(--motion-fast), border-color var(--motion-fast);
    }

    .admin-sidebar__store-link:hover {
      background: var(--admin-accent-soft);
      border-color: rgba(240, 78, 35, .18);
      color: var(--brand-primary);
    }

    .admin-sidebar__store-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .admin-content {
      min-height: 100vh;
      background: var(--admin-bg);
    }

    .admin-topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      min-height: 72px;
      padding: 12px 28px;
      border-bottom: 1px solid var(--admin-border);
      background: rgba(255, 255, 255, .86);
      backdrop-filter: blur(16px);
    }

    .admin-topbar__left,
    .admin-topbar__right,
    .admin-user {
      display: flex;
      align-items: center;
    }

    .admin-topbar__left {
      gap: 12px;
      min-width: 0;
    }

    .admin-topbar__right {
      gap: 10px;
      flex: 0 0 auto;
    }

    .admin-topbar__eyebrow {
      margin: 0 0 2px;
      color: var(--brand-primary);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .08em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .admin-topbar__title {
      margin: 0;
      color: var(--text-heading);
      font-size: 18px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -.02em;
    }

    .admin-topbar__menu,
    .admin-topbar__logout {
      color: var(--text-secondary);
    }

    .admin-user {
      gap: 10px;
      min-height: 44px;
      padding: 5px 10px 5px 5px;
      border: 1px solid var(--admin-border);
      border-radius: 999px;
      background: var(--admin-surface);
      box-shadow: var(--shadow-xs);
    }

    .admin-user__avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--admin-accent-soft);
      color: var(--brand-primary);
      font-size: 12px;
      font-weight: 900;
    }

    .admin-user__name {
      max-width: 150px;
      overflow: hidden;
      color: var(--text-heading);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .admin-user__role {
      color: var(--text-secondary);
      font-size: 11px;
      font-weight: 600;
      line-height: 1.2;
    }

    .admin-main {
      padding: 28px;
    }

    @media (max-width: 899px) {
      .admin-sidebar {
        width: min(86vw, 320px);
      }

      .admin-topbar {
        min-height: 64px;
        padding: 10px 16px;
      }

      .admin-main {
        padding: 18px 16px 28px;
      }
    }

    @media (max-width: 599px) {
      .admin-topbar__title {
        font-size: 16px;
      }

      .admin-topbar__eyebrow,
      .admin-user__meta {
        display: none;
      }

      .admin-user {
        padding: 4px;
      }
    }
  `],
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  readonly isMobile = signal(false);
  readonly sidenavOpen = signal(false);

  readonly navItems: AdminNavItem[] = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: 'dashboard',
      description: 'Visão geral',
    },
    {
      label: 'Produtos',
      route: '/admin/products',
      icon: 'inventory_2',
      description: 'Catálogo e estoque',
    },
    {
      label: 'Pedidos',
      route: '/admin/orders',
      icon: 'receipt_long',
      description: 'Vendas e envio',
    },
    {
      label: 'Categorias',
      route: '/admin/categories',
      icon: 'category',
      description: 'Organização da loja',
    },
    {
      label: 'Usuários',
      route: '/admin/users',
      icon: 'people',
      description: 'Clientes e acessos',
    },
  ];

  constructor() {
    this.breakpointObserver
      .observe('(max-width: 899px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.isMobile.set(result.matches);
        this.sidenavOpen.set(!result.matches);
      });
  }

  closeMobileSidenav(): void {
    if (this.isMobile()) {
      this.sidenavOpen.set(false);
    }
  }

  userName(): string {
    const user = this.authService.currentUser();
    if (!user) return 'Admin';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  }

  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'AD';

    const first = user.firstName?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    const initials = `${first}${last}`.trim();

    return (initials || user.email.slice(0, 2)).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
