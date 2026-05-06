import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">
        {{ 'AUTH.FORGOT_PASSWORD_TITLE' | translate }}
      </h2>
      <p class="text-gray-500 text-sm text-center mb-6">
        {{ 'AUTH.FORGOT_PASSWORD_SUBTITLE' | translate }}
      </p>

      @if (!sent()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>{{ 'AUTH.VALIDATION.EMAIL_REQUIRED' | translate }}</mat-error>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>{{ 'AUTH.VALIDATION.EMAIL_INVALID' | translate }}</mat-error>
            }
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" class="w-full">
            {{ 'AUTH.SEND_INSTRUCTIONS' | translate }}
          </button>
        </form>
      } @else {
        <div class="text-center py-4">
          <div class="text-green-500 text-5xl mb-4">✓</div>
          <p class="text-gray-600">{{ 'AUTH.FORGOT_PASSWORD_SUCCESS' | translate }}</p>
        </div>
      }

      <p class="mt-4 text-center text-sm">
        <a routerLink="/auth/login" class="text-primary-500 hover:underline">
          {{ 'AUTH.BACK_TO_LOGIN' | translate }}
        </a>
      </p>
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
