import { Component, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Recuperar senha</h2>
      <p class="text-gray-500 text-sm text-center mb-6">
        Informe seu e-mail para receber as instruções de recuperação.
      </p>

      @if (!sent()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" class="w-full">
            Enviar instruções
          </button>
        </form>
      } @else {
        <div class="text-center py-4">
          <div class="text-green-500 text-5xl mb-4">✓</div>
          <p class="text-gray-600">Verifique seu e-mail para redefinir sua senha.</p>
        </div>
      }

      <p class="mt-4 text-center text-sm">
        <a routerLink="/auth/login" class="text-primary-500 hover:underline">Voltar ao login</a>
      </p>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private fb = new FormBuilder();
  readonly sent = signal(false);

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  onSubmit(): void {
    if (this.form.valid) this.sent.set(true);
  }
}