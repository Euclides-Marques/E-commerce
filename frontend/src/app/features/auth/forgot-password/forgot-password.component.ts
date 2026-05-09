import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
  template: `
    <div>
      <div class="auth-header">
        <h2 class="auth-title">{{ 'AUTH.FORGOT_PASSWORD_TITLE' | translate }}</h2>
        <p class="auth-subtitle">{{ 'AUTH.FORGOT_PASSWORD_SUBTITLE' | translate }}</p>
      </div>

      @if (!sent()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form-fields">
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

          <button mat-flat-button color="primary" type="submit" class="w-full auth-submit">
            {{ 'AUTH.SEND_INSTRUCTIONS' | translate }}
          </button>
        </form>
      } @else {
        <div class="auth-success">
          <div class="auth-success-icon">
            <mat-icon>mark_email_read</mat-icon>
          </div>
          <p class="auth-success-text">{{ 'AUTH.FORGOT_PASSWORD_SUCCESS' | translate }}</p>
        </div>
      }

      <div class="auth-footer">
        <a routerLink="/auth/login" class="auth-link-muted">
          ← {{ 'AUTH.BACK_TO_LOGIN' | translate }}
        </a>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  readonly sent = signal(false);

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  onSubmit(): void {
    if (this.form.valid) this.sent.set(true);
  }
}
