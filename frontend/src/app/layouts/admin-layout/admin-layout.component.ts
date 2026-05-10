import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

interface AdminNavItem {
  labelKey: string;
  descKey: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  animations: [
    trigger('sidebarWidth', [
      state('expanded', style({ width: '280px' })),
      state('collapsed', style({ width: '72px' })),
      transition('expanded <=> collapsed', animate('320ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <mat-sidenav-container class="admin-layout admin-shell">
      <mat-sidenav
        class="admin-sidebar"
        [class.admin-sidebar--collapsed]="isCollapsed()"
        [@sidebarWidth]="!isMobile() ? (isCollapsed() ? 'collapsed' : 'expanded') : null"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() || sidenavOpen()"
        [fixedInViewport]="isMobile()"
        (closedStart)="sidenavOpen.set(false)">

        <aside class="admin-sidebar__inner" [attr.aria-label]="'ADMIN.LAYOUT.NAV_EYEBROW' | translate">

          <div
            class="admin-brand"
            [class.admin-brand--clickable]="!isMobile()"
            (click)="toggleCollapse()"
            [attr.role]="!isMobile() ? 'button' : null"
            [attr.aria-expanded]="!isMobile() ? !isCollapsed() : null"
            [attr.aria-label]="!isMobile()
              ? (isCollapsed() ? ('ADMIN.LAYOUT.EXPAND_NAV' | translate) : ('ADMIN.LAYOUT.COLLAPSE_NAV' | translate))
              : ('ADMIN.LAYOUT.BRAND_NAME' | translate)">
            <span class="admin-brand__mark">
              <mat-icon aria-hidden="true">storefront</mat-icon>
            </span>
            <span class="admin-brand__copy">
              <span class="admin-brand__name">{{ 'ADMIN.LAYOUT.BRAND_NAME' | translate }}</span>
              <span class="admin-brand__meta">{{ 'ADMIN.LAYOUT.BRAND_META' | translate }}</span>
            </span>
          </div>

          <nav class="admin-nav">
            <p class="admin-nav__eyebrow">{{ 'ADMIN.LAYOUT.NAV_EYEBROW' | translate }}</p>

            @for (item of navItems; track item.route) {
              <a
                class="admin-nav__item"
                [routerLink]="item.route"
                routerLinkActive="admin-nav__item--active"
                [routerLinkActiveOptions]="{ exact: true }"
                [matTooltip]="item.labelKey | translate"
                matTooltipPosition="right"
                [matTooltipDisabled]="!isCollapsed()"
                (click)="closeMobileSidenav()">
                <span class="admin-nav__icon">
                  <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
                </span>
                <span class="admin-nav__content">
                  <span class="admin-nav__label">{{ item.labelKey | translate }}</span>
                  <span class="admin-nav__desc">{{ item.descKey | translate }}</span>
                </span>
              </a>
            }
          </nav>

          <div class="admin-sidebar__footer">
            <a
              class="admin-sidebar__store-link"
              routerLink="/"
              [matTooltip]="'ADMIN.LAYOUT.VIEW_STORE' | translate"
              matTooltipPosition="right"
              [matTooltipDisabled]="!isCollapsed()"
              (click)="closeMobileSidenav()">
              <mat-icon aria-hidden="true">arrow_outward</mat-icon>
              <span class="admin-sidebar__store-text">{{ 'ADMIN.LAYOUT.VIEW_STORE' | translate }}</span>
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
                [attr.aria-label]="'ADMIN.LAYOUT.OPEN_NAV' | translate"
                (click)="sidenavOpen.set(true)">
                <mat-icon>menu</mat-icon>
              </button>
            }

            <div>
              <p class="admin-topbar__eyebrow">{{ 'ADMIN.LAYOUT.TOPBAR_EYEBROW' | translate }}</p>
              <h1 class="admin-topbar__title">{{ 'ADMIN.LAYOUT.TOPBAR_TITLE' | translate }}</h1>
            </div>
          </div>

          <div class="admin-topbar__right">
            <div class="admin-user">
              <span class="admin-user__avatar" aria-hidden="true">{{ userInitials() }}</span>
              <span class="admin-user__meta">
                <span class="admin-user__name">{{ userName() }}</span>
                <span class="admin-user__role">{{ 'ADMIN.LAYOUT.ROLE' | translate }}</span>
              </span>
            </div>

            <button
              mat-icon-button
              type="button"
              class="admin-topbar__logout"
              [attr.aria-label]="'ADMIN.LAYOUT.LOGOUT_ARIA' | translate"
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

    /* ── Sidebar ── */
    .admin-sidebar {
      width: 280px;
      border-right: 1px solid var(--admin-border);
      background: var(--admin-surface);
      color: var(--admin-text);
      overflow: hidden;
      will-change: width;
    }

    .admin-content {
      min-height: 100vh;
      background: var(--admin-bg);
    }

    /* ── Sidebar inner ── */
    .admin-sidebar__inner {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 18px;
      background:
        linear-gradient(180deg, var(--admin-accent-soft) 0%, rgba(255, 255, 255, 0) 34%),
        var(--admin-surface);
      transition: padding 260ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .admin-sidebar--collapsed .admin-sidebar__inner {
      padding: 18px 8px;
    }

    /* ── Brand ── */
    .admin-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 8px 22px;
      color: var(--text-heading);
      text-decoration: none;
    }

    .admin-brand--clickable {
      cursor: pointer;
      border-radius: 14px;
      user-select: none;
    }

    .admin-brand--clickable:hover .admin-brand__mark {
      background: var(--brand-primary);
      box-shadow: 0 8px 18px rgba(240, 78, 35, .25);
    }

    .admin-brand--clickable:hover .admin-brand__mark mat-icon {
      color: #fff;
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
      flex: 0 0 auto;
      transition: background 200ms, box-shadow 200ms;
    }

    .admin-brand__mark mat-icon {
      color: var(--brand-primary);
      font-size: 21px;
      width: 21px;
      height: 21px;
      transition: color 200ms;
    }

    .admin-user__meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .admin-brand__copy {
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
      max-width: 220px;
      opacity: 1;
      white-space: nowrap;
      transition: max-width 280ms cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 200ms ease;
    }

    .admin-sidebar--collapsed .admin-brand__copy {
      max-width: 0;
      opacity: 0;
      pointer-events: none;
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

    /* ── Nav ── */
    .admin-nav {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding-top: 8px;
      border-top: 1px solid var(--admin-border);
      width: 100%;
    }

    .admin-nav__eyebrow {
      opacity: 1;
      margin: 8px 8px 10px;
      color: var(--text-placeholder);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .1em;
      text-transform: uppercase;
      white-space: nowrap;
      transition: opacity 200ms ease;
    }

    .admin-sidebar--collapsed .admin-nav__eyebrow {
      opacity: 0;
      pointer-events: none;
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
      transition: background var(--motion-fast), color var(--motion-fast),
                  transform var(--motion-fast), padding 320ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .admin-nav__item:hover {
      background: var(--bg-surface-soft);
      color: var(--text-heading);
      transform: translateX(2px);
    }

    .admin-sidebar--collapsed .admin-nav__item {
      padding: 10px;
    }

    .admin-sidebar--collapsed .admin-nav__item:hover {
      transform: none;
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

    .admin-sidebar--collapsed .admin-nav__item--active::before {
      top: 8px;
      bottom: 8px;
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

    .admin-nav__content {
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
      max-width: 180px;
      opacity: 1;
      white-space: nowrap;
      transition: max-width 280ms cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 200ms ease;
    }

    .admin-sidebar--collapsed .admin-nav__content {
      max-width: 0;
      opacity: 0;
      pointer-events: none;
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

    /* ── Footer ── */
    .admin-sidebar__footer {
      margin-top: auto;
      padding-top: 18px;
      width: 100%;
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
      transition: background var(--motion-fast), color var(--motion-fast),
                  border-color var(--motion-fast), padding 320ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .admin-sidebar--collapsed .admin-sidebar__store-link {
      padding: 10px;
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
      flex: 0 0 auto;
    }

    .admin-sidebar__store-text {
      overflow: hidden;
      max-width: 160px;
      opacity: 1;
      white-space: nowrap;
      transition: max-width 280ms cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 180ms ease;
    }

    .admin-sidebar--collapsed .admin-sidebar__store-text {
      max-width: 0;
      opacity: 0;
      pointer-events: none;
    }

    /* ── Topbar ── */
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

    /* ── Main ── */
    .admin-main {
      padding: 28px;
    }

    /* ── Responsive ── */
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
  readonly collapsed = signal(false);

  readonly isCollapsed = computed(() => this.collapsed() && !this.isMobile());

  readonly navItems: AdminNavItem[] = [
    {
      labelKey: 'ADMIN.LAYOUT.NAV_DASHBOARD',
      descKey: 'ADMIN.LAYOUT.NAV_DASHBOARD_DESC',
      route: '/admin/dashboard',
      icon: 'dashboard',
    },
    {
      labelKey: 'ADMIN.LAYOUT.NAV_PRODUCTS',
      descKey: 'ADMIN.LAYOUT.NAV_PRODUCTS_DESC',
      route: '/admin/products',
      icon: 'inventory_2',
    },
    {
      labelKey: 'ADMIN.LAYOUT.NAV_ORDERS',
      descKey: 'ADMIN.LAYOUT.NAV_ORDERS_DESC',
      route: '/admin/orders',
      icon: 'receipt_long',
    },
    {
      labelKey: 'ADMIN.LAYOUT.NAV_CATEGORIES',
      descKey: 'ADMIN.LAYOUT.NAV_CATEGORIES_DESC',
      route: '/admin/categories',
      icon: 'category',
    },
    {
      labelKey: 'ADMIN.LAYOUT.NAV_USERS',
      descKey: 'ADMIN.LAYOUT.NAV_USERS_DESC',
      route: '/admin/users',
      icon: 'people',
    },
  ];

  constructor() {
    this.breakpointObserver
      .observe('(max-width: 899px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.isMobile.set(result.matches);
        if (result.matches) {
          this.sidenavOpen.set(false);
        }
      });
  }

  toggleCollapse(): void {
    if (!this.isMobile()) {
      this.collapsed.update(v => !v);
    }
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
