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
  selector: 'app-register',
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
        <h2 class="auth-title">Criar conta</h2>
        <p class="auth-subtitle">Preencha os dados para começar gratuitamente.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form-fields">
        <div class="auth-name-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'AUTH.FIRST_NAME' | translate }}</mat-label>
            <input matInput formControlName="firstName" autocomplete="given-name" />
            @if (form.get('firstName')?.hasError('required') && form.get('firstName')?.touched) {
              <mat-error>{{ 'AUTH.VALIDATION.FIRST_NAME_REQUIRED' | translate }}</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'AUTH.LAST_NAME' | translate }}</mat-label>
            <input matInput formControlName="lastName" autocomplete="family-name" />
            @if (form.get('lastName')?.hasError('required') && form.get('lastName')?.touched) {
              <mat-error>{{ 'AUTH.VALIDATION.LAST_NAME_REQUIRED' | translate }}</mat-error>
            }
          </mat-form-field>
        </div>

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
          <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" autocomplete="new-password" />
          <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
            <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
            <mat-error>{{ 'AUTH.VALIDATION.PASSWORD_REQUIRED' | translate }}</mat-error>
          }
          @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
            <mat-error>{{ 'AUTH.VALIDATION.PASSWORD_MIN_LENGTH' | translate }}</mat-error>
          }
        </mat-form-field>

        @if (errorMessage()) {
          <div class="auth-field-error">
            <mat-icon>error_outline</mat-icon>
            {{ errorMessage() }}
          </div>
        }

        <button mat-flat-button color="primary" type="submit" class="w-full auth-submit" [disabled]="isLoading()">
          @if (isLoading()) {
            <mat-spinner diameter="20" />
          } @else {
            {{ 'AUTH.REGISTER' | translate }}
          }
        </button>
      </form>

      <div class="auth-footer">
        <p class="auth-footer-text">
          {{ 'AUTH.ALREADY_ACCOUNT' | translate }}
          <a routerLink="/auth/login" class="auth-link-brand">{{ 'AUTH.LOGIN' | translate }}</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly hidePassword = signal(true);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.authService.register(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMessage.set(err?.error?.errors?.[0] ?? 'Erro ao cadastrar.');
        this.isLoading.set(false);
      },
    });
  }
}
