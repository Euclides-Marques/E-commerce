import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  template: `
    <div>
      <div class="auth-header">
        <h2 class="auth-title">{{ 'AUTH.RESET_PASSWORD.TITLE' | translate }}</h2>
        <p class="auth-subtitle">{{ 'AUTH.RESET_PASSWORD.SUBTITLE' | translate }}</p>
      </div>

      @if (!token()) {
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <mat-icon style="color:#dc2626;font-size:48px;width:48px;height:48px">error_outline</mat-icon>
          </div>
          <p class="text-gray-600">{{ 'AUTH.RESET_PASSWORD.INVALID_LINK' | translate }}</p>
          <a routerLink="/auth/forgot-password" mat-flat-button color="primary" class="w-full auth-submit">
            {{ 'AUTH.RESET_PASSWORD.REQUEST_NEW' | translate }}
          </a>
        </div>
      } @else if (success()) {
        <div class="auth-success">
          <div class="auth-success-icon">
            <mat-icon>lock_reset</mat-icon>
          </div>
          <p class="auth-success-text">{{ 'AUTH.RESET_PASSWORD.SUCCESS' | translate }}</p>
        </div>
        <div class="auth-footer">
          <a routerLink="/auth/login" mat-flat-button color="primary" class="w-full auth-submit">
            {{ 'AUTH.LOGIN' | translate }}
          </a>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form-fields">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'AUTH.RESET_PASSWORD.NEW_PASSWORD' | translate }}</mat-label>
            <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="newPassword" />
            <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())">
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('newPassword')?.hasError('required') && form.get('newPassword')?.touched) {
              <mat-error>{{ 'AUTH.VALIDATION.PASSWORD_REQUIRED' | translate }}</mat-error>
            }
            @if (form.get('newPassword')?.hasError('minlength') && form.get('newPassword')?.touched) {
              <mat-error>{{ 'AUTH.VALIDATION.PASSWORD_MIN_LENGTH' | translate }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'AUTH.RESET_PASSWORD.CONFIRM_PASSWORD' | translate }}</mat-label>
            <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="confirmPassword" />
            @if (form.hasError('passwordsMismatch') && form.get('confirmPassword')?.touched) {
              <mat-error>{{ 'AUTH.RESET_PASSWORD.PASSWORDS_MISMATCH' | translate }}</mat-error>
            }
          </mat-form-field>

          @if (error()) {
            <p class="text-sm text-red-600 -mt-2">{{ error() }}</p>
          }

          <button mat-flat-button color="primary" type="submit" class="w-full auth-submit"
                  [disabled]="loading()">
            @if (loading()) {
              <mat-spinner diameter="20" color="accent" style="display:inline-block" />
            } @else {
              {{ 'AUTH.RESET_PASSWORD.SUBMIT' | translate }}
            }
          </button>
        </form>

        <div class="auth-footer">
          <a routerLink="/auth/login" class="auth-link-muted">
            ← {{ 'AUTH.BACK_TO_LOGIN' | translate }}
          </a>
        </div>
      }
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly token = signal<string | null>(null);
  readonly success = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  ngOnInit(): void {
    const t = this.route.snapshot.queryParamMap.get('token');
    this.token.set(t);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.resetPassword(this.token()!, this.form.value.newPassword!).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.errors?.[0] ?? 'Não foi possível redefinir a senha. O link pode ter expirado.');
        this.loading.set(false);
      },
    });
  }
}
