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
  template: `
    <div class="bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
        {{ 'AUTH.LOGIN_TITLE' | translate }}
      </h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
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
          <p class="text-red-500 text-sm text-center">{{ errorMessage() }}</p>
        }

        <button mat-raised-button color="primary" type="submit" class="w-full py-3" [disabled]="isLoading()">
          @if (isLoading()) {
            <mat-spinner diameter="20" class="inline-block" />
          } @else {
            {{ 'AUTH.LOGIN' | translate }}
          }
        </button>
      </form>

      <div class="mt-4 text-center space-y-2">
        <a routerLink="/auth/forgot-password" class="text-sm text-primary-500 hover:underline">
          {{ 'AUTH.FORGOT_PASSWORD' | translate }}
        </a>
        <p class="text-sm text-gray-500">
          {{ 'AUTH.NO_ACCOUNT' | translate }}
          <a routerLink="/auth/register" class="text-primary-500 hover:underline font-medium">
            {{ 'AUTH.SIGN_UP' | translate }}
          </a>
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
