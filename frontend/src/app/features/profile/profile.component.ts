import { Component, inject, computed } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ProfilePersonalDataComponent } from './tabs/profile-personal-data.component';
import { ProfileAddressesComponent } from './tabs/profile-addresses.component';
import { ProfileFavoritesComponent } from './tabs/profile-favorites.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    TranslatePipe,
    ProfilePersonalDataComponent,
    ProfileAddressesComponent,
    ProfileFavoritesComponent,
  ],
  template: `
    <div class="profile-page animate-fade-in">

      <!-- ── Hero Header ──────────────────────────────────────────── -->
      <div class="profile-hero">
        <div class="profile-hero__avatar">
          @if (user()?.avatarUrl) {
            <img [src]="user()!.avatarUrl" [alt]="fullName()" class="profile-hero__avatar-img" />
          } @else {
            <span class="profile-hero__initials">{{ initials() }}</span>
          }
        </div>
        <div class="profile-hero__meta">
          <h1 class="profile-hero__name">{{ fullName() }}</h1>
          <p class="profile-hero__email">{{ user()?.email }}</p>
          @if (isAdmin()) {
            <span class="profile-hero__badge profile-hero__badge--admin">
              <mat-icon class="profile-hero__badge-icon">admin_panel_settings</mat-icon>
              {{ 'PROFILE.BADGE_ADMIN' | translate }}
            </span>
          } @else if (user()?.emailConfirmed) {
            <span class="profile-hero__badge">
              <mat-icon class="profile-hero__badge-icon">verified_user</mat-icon>
              {{ 'PROFILE.BADGE_VERIFIED' | translate }}
            </span>
          } @else {
            <span class="profile-hero__badge profile-hero__badge--unverified">
              <mat-icon class="profile-hero__badge-icon">mark_email_unread</mat-icon>
              {{ 'PROFILE.BADGE_UNVERIFIED' | translate }}
            </span>
          }
        </div>
      </div>

      <!-- ── Tabs Card ────────────────────────────────────────────── -->
      <div class="profile-card">
        <mat-tab-group animationDuration="180ms" class="profile-tab-group">

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">person_outline</mat-icon>
              {{ 'PROFILE.TAB_PERSONAL' | translate }}
            </ng-template>
            <div class="tab-body">
              <app-profile-personal-data />
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">location_on</mat-icon>
              {{ 'PROFILE.TAB_ADDRESSES' | translate }}
            </ng-template>
            <div class="tab-body">
              <app-profile-addresses />
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">favorite_border</mat-icon>
              {{ 'PROFILE.TAB_FAVORITES' | translate }}
            </ng-template>
            <div class="tab-body">
              <app-profile-favorites />
            </div>
          </mat-tab>

        </mat-tab-group>
      </div>

    </div>
  `,
  styles: [`
    .profile-page {
      max-width: 880px;
      margin: 0 auto;
    }

    /* ── Hero header ─────────────────────────────────────────────── */
    .profile-hero {
      display: flex;
      align-items: center;
      gap: 22px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 28px 32px;
      margin-bottom: 16px;
      box-shadow: var(--shadow-sm);
    }

    .profile-hero__avatar {
      flex-shrink: 0;
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F04E23 0%, #F97316 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(240, 78, 35, .24);
      border: 3px solid #fff;
      outline: 2px solid rgba(240, 78, 35, .15);
    }
    .profile-hero__avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .profile-hero__initials {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
      line-height: 1;
      text-transform: uppercase;
    }

    .profile-hero__meta {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .profile-hero__name {
      font-size: 21px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
      margin: 0;
      line-height: 1.2;
    }
    .profile-hero__email {
      font-size: 13.5px;
      color: var(--text-secondary);
      margin: 0;
    }

    .profile-hero__badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
      padding: 4px 11px 4px 7px;
      background: rgba(240, 78, 35, .07);
      color: var(--brand-primary);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(240, 78, 35, .15);
      width: fit-content;
      letter-spacing: 0.1px;
    }
    .profile-hero__badge--admin {
      background: rgba(99, 102, 241, .07);
      color: #6366F1;
      border-color: rgba(99, 102, 241, .18);
    }
    .profile-hero__badge--unverified {
      background: rgba(234, 179, 8, .08);
      color: #b45309;
      border-color: rgba(234, 179, 8, .25);
    }
    .profile-hero__badge-icon {
      font-size: 14px !important;
      width: 14px !important;
      height: 14px !important;
    }

    /* ── Tabs card ───────────────────────────────────────────────── */
    .profile-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .tab-body {
      padding: 28px 32px 32px;
    }
    .tab-icon {
      font-size: 17px !important;
      width: 17px !important;
      height: 17px !important;
      margin-right: 7px;
      vertical-align: middle;
    }

    /* ── Material tab overrides ──────────────────────────────────── */
    ::ng-deep .profile-tab-group .mat-mdc-tab-header {
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 16px;
    }
    ::ng-deep .profile-tab-group .mat-mdc-tab {
      min-width: 130px;
      opacity: 1;
    }
    ::ng-deep .profile-tab-group .mat-mdc-tab .mdc-tab__text-label {
      color: var(--text-secondary);
      font-size: 13.5px;
      font-weight: 500;
      letter-spacing: -0.1px;
      gap: 0;
    }
    ::ng-deep .profile-tab-group .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
      color: var(--brand-primary);
      font-weight: 600;
    }
    ::ng-deep .profile-tab-group .mdc-tab-indicator__content--underline {
      border-color: var(--brand-primary) !important;
      border-top-width: 2px !important;
    }
    ::ng-deep .profile-tab-group .mat-mdc-tab-body-wrapper {
      flex: 1;
    }

    /* ── Responsive ──────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .profile-hero { padding: 20px; gap: 16px; }
      .profile-hero__avatar { width: 62px; height: 62px; }
      .profile-hero__initials { font-size: 22px; }
      .profile-hero__name { font-size: 18px; }
      .tab-body { padding: 20px 16px 24px; }
      ::ng-deep .profile-tab-group .mat-mdc-tab { min-width: unset; }
    }
  `],
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  readonly user = this.authService.currentUser;
  readonly isAdmin = this.authService.isAdmin;

  readonly fullName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return `${u.firstName} ${u.lastName}`.trim();
  });

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    const f = u.firstName?.[0] ?? '';
    const l = u.lastName?.[0] ?? '';
    return `${f}${l}`.toUpperCase() || '?';
  });
}
