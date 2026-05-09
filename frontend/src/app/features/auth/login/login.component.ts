import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
  styles: [`
    .login-header {
      margin-bottom: 28px;
    }
    .login-title {
      font-size: 22px;
      font-weight: 600;
      color: #0F172A;
      letter-spacing: -0.3px;
      margin: 0 0 6px;
      line-height: 1.25;
    }
    .login-subtitle {
      font-size: 14px;
      color: #64748B;
      margin: 0;
      line-height: 1.5;
    }
    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .field-error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #EF4444;
      text-align: center;
      justify-content: center;
      margin: 2px 0 6px;
    }
    .field-error .mat-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
    }

    /* Footer links */
    .login-footer {
      margin-top: 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .link-muted {
      font-size: 14px;
      color: #64748B;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s ease;
    }
    .link-muted:hover { color: #F04E23; }
    .register-text {
      font-size: 14px;
      color: #64748B;
      margin: 0;
      line-height: 1.5;
    }
    .link-brand {
      color: #F04E23;
      font-weight: 600;
      text-decoration: none;
      transition: opacity 0.15s ease;
    }
    .link-brand:hover { opacity: 0.75; text-decoration: underline; }
  `],
  template: `
    <div>
      <div class="login-header">
        <h2 class="login-title">{{ 'AUTH.LOGIN_TITLE' | translate }}</h2>
        <p class="login-subtitle">Bem-vindo de volta. Insira seus dados abaixo.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-fields">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
          <mat-icon matSuffix>email</mat-icon>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>{{ 'AUTH.VALIDATION.EMAIL_REQUIRED' | translate }}</mat-error>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>{{ 'AUTH.VALIDATION.EMAIL_INVALID' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ 'AUTH.PASSWORD' | translate }}</mat-label>
          <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" autocomplete="current-password" />
          <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
            <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
            <mat-error>{{ 'AUTH.VALIDATION.PASSWORD_REQUIRED' | translate }}</mat-error>
          }
        </mat-form-field>

        @if (errorMessage()) {
          <div class="field-error">
            <mat-icon>error_outline</mat-icon>
            {{ errorMessage() }}
          </div>
        }

        <button mat-flat-button color="primary" type="submit" class="w-full auth-submit" [disabled]="isLoading()">
          @if (isLoading()) {
            <mat-spinner diameter="20" class="inline-block" />
          } @else {
            {{ 'AUTH.LOGIN' | translate }}
          }
        </button>
      </form>

      <div class="login-footer">
        <a routerLink="/auth/forgot-password" class="link-muted">
          {{ 'AUTH.FORGOT_PASSWORD' | translate }}
        </a>
        <p class="register-text">
          {{ 'AUTH.NO_ACCOUNT' | translate }}
          <a routerLink="/auth/register" class="link-brand">{{ 'AUTH.SIGN_UP' | translate }}</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly hidePassword = signal(true);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMessage.set(err?.error?.errors?.[0] ?? 'Credenciais inválidas.');
        this.isLoading.set(false);
      },
    });
  }
}
