import { Component, inject, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

function notEqualToValidator(field: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;
    const other = parent.get(field)?.value;
    return control.value && other && control.value === other ? { sameAsCurrent: true } : null;
  };
}

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPwd = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return newPwd && confirm && newPwd !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-profile-personal-data',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, TranslatePipe],
  template: `
    <div class="pd">

      <!-- ── Informações pessoais ───────────────────────────────── -->
      <section class="pd-section">
        <header class="pd-section__head">
          <span class="pd-section__icon-wrap">
            <mat-icon class="pd-section__icon">badge</mat-icon>
          </span>
          <h2 class="pd-section__title">{{ 'PROFILE.PERSONAL.SECTION_INFO' | translate }}</h2>
        </header>

        <div class="pd-grid">
          <div class="pd-field">
            <span class="pd-field__label">{{ 'PROFILE.PERSONAL.FIRST_NAME' | translate }}</span>
            <span class="pd-field__value">{{ user()?.firstName }}</span>
          </div>
          <div class="pd-field">
            <span class="pd-field__label">{{ 'PROFILE.PERSONAL.LAST_NAME' | translate }}</span>
            <span class="pd-field__value">{{ user()?.lastName }}</span>
          </div>
          <div class="pd-field pd-field--full">
            <span class="pd-field__label">{{ 'PROFILE.PERSONAL.EMAIL' | translate }}</span>
            <span class="pd-field__value pd-field__value--mono">{{ user()?.email }}</span>
          </div>
          <div class="pd-field">
            <span class="pd-field__label">{{ 'PROFILE.PERSONAL.ROLE' | translate }}</span>
            <span class="pd-field__value">
              <span class="pd-badge" [class.pd-badge--admin]="isAdmin()">
                <mat-icon class="pd-badge__icon">
                  {{ isAdmin() ? 'admin_panel_settings' : 'person' }}
                </mat-icon>
                {{ (isAdmin() ? 'PROFILE.PERSONAL.ROLE_ADMIN' : 'PROFILE.PERSONAL.ROLE_CLIENT') | translate }}
              </span>
            </span>
          </div>
          <div class="pd-field">
            <span class="pd-field__label">{{ 'PROFILE.PERSONAL.LANGUAGE' | translate }}</span>
            <span class="pd-field__value">
              @if (langKey()) {
                {{ langKey()! | translate }}
              } @else {
                {{ user()?.preferredLanguage || '—' }}
              }
            </span>
          </div>
        </div>
      </section>

      <div class="pd-divider"></div>

      <!-- ── Segurança ─────────────────────────────────────────── -->
      <section class="pd-section">
        <header class="pd-section__head">
          <span class="pd-section__icon-wrap pd-section__icon-wrap--neutral">
            <mat-icon class="pd-section__icon pd-section__icon--neutral">lock_outline</mat-icon>
          </span>
          <h2 class="pd-section__title">{{ 'PROFILE.PERSONAL.SECTION_SECURITY' | translate }}</h2>
        </header>

        <!-- senha + botão quando o form está fechado -->
        @if (!showForm()) {
          <div class="pd-security-row">
            <div class="pd-field pd-field--inline">
              <span class="pd-field__label">{{ 'PROFILE.PERSONAL.PASSWORD' | translate }}</span>
              <span class="pd-field__value pd-field__value--password">••••••••••••</span>
            </div>
            <button class="pd-btn-outline" (click)="openForm()">
              <mat-icon>edit</mat-icon>
              {{ 'PROFILE.PERSONAL.CHANGE_PASSWORD' | translate }}
            </button>
          </div>
        }

        <!-- formulário inline de alteração de senha -->
        @if (showForm()) {
          <form [formGroup]="passwordForm" (ngSubmit)="submitPassword()" class="pd-pwd-form">

            <div class="pd-pwd-form__fields">

              <!-- senha atual -->
              <div class="pd-input-wrap">
                <label class="pd-input-label">
                  {{ 'PROFILE.PERSONAL.PWD_CURRENT' | translate }}
                </label>
                <div class="pd-input-row">
                  <input
                    [type]="showCurrent() ? 'text' : 'password'"
                    formControlName="currentPassword"
                    class="pd-input"
                    [placeholder]="'PROFILE.PERSONAL.PWD_CURRENT_PH' | translate"
                    autocomplete="current-password"
                  />
                  <button type="button" class="pd-eye-btn" (mousedown)="$event.preventDefault()" (click)="showCurrent.set(!showCurrent())">
                    <mat-icon>{{ showCurrent() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                @if (f['currentPassword'].touched && f['currentPassword'].errors?.['required']) {
                  <span class="pd-input-error">{{ 'PROFILE.PERSONAL.PWD_REQUIRED' | translate }}</span>
                }
              </div>

              <!-- nova senha -->
              <div class="pd-input-wrap">
                <label class="pd-input-label">
                  {{ 'PROFILE.PERSONAL.PWD_NEW' | translate }}
                </label>
                <div class="pd-input-row">
                  <input
                    [type]="showNew() ? 'text' : 'password'"
                    formControlName="newPassword"
                    class="pd-input"
                    [placeholder]="'PROFILE.PERSONAL.PWD_NEW_PH' | translate"
                    autocomplete="new-password"
                  />
                  <button type="button" class="pd-eye-btn" (mousedown)="$event.preventDefault()" (click)="showNew.set(!showNew())">
                    <mat-icon>{{ showNew() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                @if (f['newPassword'].touched && f['newPassword'].errors?.['required']) {
                  <span class="pd-input-error">{{ 'PROFILE.PERSONAL.PWD_REQUIRED' | translate }}</span>
                }
                @if (f['newPassword'].touched && f['newPassword'].errors?.['minlength']) {
                  <span class="pd-input-error">{{ 'PROFILE.PERSONAL.PWD_MIN' | translate }}</span>
                }
                @if (f['newPassword'].touched && f['newPassword'].errors?.['sameAsCurrent']) {
                  <span class="pd-input-error">{{ 'PROFILE.PERSONAL.PWD_SAME' | translate }}</span>
                }
              </div>

              <!-- confirmar nova senha -->
              <div class="pd-input-wrap">
                <label class="pd-input-label">
                  {{ 'PROFILE.PERSONAL.PWD_CONFIRM' | translate }}
                </label>
                <div class="pd-input-row">
                  <input
                    [type]="showConfirm() ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    class="pd-input"
                    [placeholder]="'PROFILE.PERSONAL.PWD_CONFIRM_PH' | translate"
                    autocomplete="new-password"
                  />
                  <button type="button" class="pd-eye-btn" (mousedown)="$event.preventDefault()" (click)="showConfirm.set(!showConfirm())">
                    <mat-icon>{{ showConfirm() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                @if (f['confirmPassword'].touched && passwordForm.errors?.['passwordsMismatch']) {
                  <span class="pd-input-error">{{ 'PROFILE.PERSONAL.PWD_MISMATCH' | translate }}</span>
                }
              </div>

            </div>

            <div class="pd-pwd-form__actions">
              <button type="button" class="pd-btn-outline" (click)="closeForm()" [disabled]="saving()">
                {{ 'PROFILE.PERSONAL.BTN_CANCEL' | translate }}
              </button>
              <button type="submit" class="pd-btn-primary" [disabled]="passwordForm.invalid || saving()">
                @if (saving()) {
                  <mat-spinner diameter="15" />
                } @else {
                  <mat-icon>lock_reset</mat-icon>
                }
                {{ 'PROFILE.PERSONAL.BTN_SAVE_PWD' | translate }}
              </button>
            </div>

          </form>
        }
      </section>

    </div>
  `,
  styles: [`
    .pd { }

    /* ── Section ─────────────────────────────────────────────────── */
    .pd-section__head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
    }
    .pd-section__icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(240, 78, 35, .08);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pd-section__icon-wrap--neutral {
      background: rgba(100, 116, 139, .08);
    }
    .pd-section__icon {
      font-size: 17px !important;
      width: 17px !important;
      height: 17px !important;
      color: var(--brand-primary);
    }
    .pd-section__icon--neutral {
      color: var(--text-secondary) !important;
    }
    .pd-section__title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.2px;
    }

    /* ── Grid ────────────────────────────────────────────────────── */
    .pd-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .pd-field--full { grid-column: 1 / -1; }

    /* ── Field card ──────────────────────────────────────────────── */
    .pd-field {
      background: var(--bg-page);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 13px 16px;
    }
    .pd-field--inline {
      border: none;
      background: transparent;
      padding: 0;
      border-radius: 0;
    }
    .pd-field__label {
      display: block;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.65px;
      color: var(--text-placeholder);
      margin-bottom: 5px;
    }
    .pd-field__value {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      line-height: 1.4;
    }
    .pd-field__value--mono {
      font-size: 13.5px;
      font-family: 'Inter', monospace;
      color: var(--text-secondary);
    }
    .pd-field__value--password {
      font-size: 16px;
      letter-spacing: 3px;
      color: var(--text-placeholder);
      line-height: 1;
    }

    /* ── Badge ───────────────────────────────────────────────────── */
    .pd-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px 3px 6px;
      background: rgba(240, 78, 35, .07);
      color: var(--brand-primary);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(240, 78, 35, .15);
    }
    .pd-badge--admin {
      background: rgba(99, 102, 241, .07);
      color: #6366F1;
      border-color: rgba(99, 102, 241, .18);
    }
    .pd-badge__icon {
      font-size: 13px !important;
      width: 13px !important;
      height: 13px !important;
    }

    /* ── Divider ─────────────────────────────────────────────────── */
    .pd-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: 24px 0;
    }

    /* ── Security row (collapsed) ────────────────────────────────── */
    .pd-security-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: var(--bg-page);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px 20px;
    }

    /* ── Password form ───────────────────────────────────────────── */
    .pd-pwd-form {
      background: var(--bg-page);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .pd-pwd-form__fields {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 14px;
    }
    .pd-pwd-form__actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 4px;
      border-top: 1px solid var(--border-subtle);
    }

    /* ── Input ───────────────────────────────────────────────────── */
    .pd-input-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .pd-input-label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.65px;
      color: var(--text-placeholder);
    }
    .pd-input-row {
      display: flex;
      align-items: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      overflow: hidden;
      transition: border-color .15s;
    }
    .pd-input-row:focus-within {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px rgba(240, 78, 35, .08);
    }
    .pd-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      padding: 10px 12px;
      font-size: 13.5px;
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      -webkit-appearance: none;
    }
    .pd-input:focus,
    .pd-input:focus-visible { outline: none !important; box-shadow: none !important; }
    .pd-input::placeholder { color: var(--text-placeholder); }
    .pd-input::-ms-reveal,
    .pd-input::-ms-clear { display: none; }
    .pd-input::-webkit-credentials-auto-fill-button { visibility: hidden; pointer-events: none; }
    .pd-input-error {
      font-size: 11px;
      color: #EF4444;
      font-weight: 500;
    }

    /* ── Eye toggle button ───────────────────────────────────────── */
    .pd-eye-btn {
      border: none;
      background: transparent;
      padding: 0 10px;
      cursor: pointer;
      color: var(--text-placeholder);
      display: flex;
      align-items: center;
      transition: color .15s;
      outline: none;
    }
    .pd-eye-btn:focus,
    .pd-eye-btn:focus-visible { outline: none; }
    .pd-eye-btn:hover { color: var(--text-secondary); }
    .pd-eye-btn mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* ── Outline button ──────────────────────────────────────────── */
    .pd-btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1.5px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      font-family: 'Inter', sans-serif;
      transition: border-color .15s, color .15s, background .15s;
      flex-shrink: 0;
    }
    .pd-btn-outline mat-icon {
      font-size: 15px !important;
      width: 15px !important;
      height: 15px !important;
    }
    .pd-btn-outline:hover:not(:disabled) {
      border-color: var(--brand-primary);
      color: var(--brand-primary);
      background: rgba(240, 78, 35, .04);
    }
    .pd-btn-outline:disabled { opacity: .45; cursor: not-allowed; }

    /* ── Primary button ──────────────────────────────────────────── */
    .pd-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border: none;
      border-radius: var(--radius-sm);
      background: var(--brand-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      font-family: 'Inter', sans-serif;
      transition: background .15s, opacity .15s;
    }
    .pd-btn-primary mat-icon {
      font-size: 15px !important;
      width: 15px !important;
      height: 15px !important;
    }
    .pd-btn-primary:hover:not(:disabled) { background: var(--brand-hover); }
    .pd-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

    /* ── Responsive ──────────────────────────────────────────────── */
    @media (max-width: 720px) {
      .pd-pwd-form__fields { grid-template-columns: 1fr; }
    }
    @media (max-width: 520px) {
      .pd-grid { grid-template-columns: 1fr; }
      .pd-field--full { grid-column: 1; }
      .pd-security-row { flex-direction: column; align-items: flex-start; gap: 14px; }
      .pd-pwd-form__actions { flex-direction: column-reverse; }
      .pd-btn-outline, .pd-btn-primary { width: 100%; justify-content: center; }
    }
  `],
})
export class ProfilePersonalDataComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly user = this.authService.currentUser;
  readonly isAdmin = this.authService.isAdmin;

  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly showCurrent = signal(false);
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);

  readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8), notEqualToValidator('currentPassword')]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator });

  get f() { return this.passwordForm.controls; }

  readonly langKey = computed(() => {
    const lang = this.user()?.preferredLanguage;
    const map: Record<string, string> = {
      'pt-BR': 'PROFILE.PERSONAL.LANG_PT_BR',
      'en-US': 'PROFILE.PERSONAL.LANG_EN_US',
      'es-ES': 'PROFILE.PERSONAL.LANG_ES_ES',
    };
    return map[lang ?? ''] ?? null;
  });

  openForm(): void {
    this.passwordForm.reset();
    this.showCurrent.set(false);
    this.showNew.set(false);
    this.showConfirm.set(false);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.passwordForm.reset();
  }

  submitPassword(): void {
    if (this.passwordForm.invalid || this.saving()) return;

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.saving.set(true);

    this.authService.changePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.snackBar.open(
          this.translate.instant('PROFILE.PERSONAL.PWD_SUCCESS'),
          this.translate.instant('PROFILE.PERSONAL.OK'),
          { duration: 4000, panelClass: 'snack-success' }
        );
      },
      error: (err) => {
        this.saving.set(false);
        const apiErrors: string[] = err?.error?.errors ?? [];
        const isSame = apiErrors.some((e: string) =>
          e.toLowerCase().includes('igual') || e.toLowerCase().includes('same')
        );
        const msg = isSame
          ? this.translate.instant('PROFILE.PERSONAL.PWD_SAME')
          : apiErrors[0] ?? this.translate.instant('PROFILE.PERSONAL.PWD_ERROR');
        this.snackBar.open(msg, this.translate.instant('PROFILE.PERSONAL.OK'), {
          duration: 5000,
          panelClass: 'snack-error',
        });
      },
    });
  }
}
