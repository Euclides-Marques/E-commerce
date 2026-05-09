import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContactService } from '../../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule,
  ],
  template: `
    <div class="max-w-2xl mx-auto py-8 animate-fade-in">

      <!-- Header -->
      <div class="mb-10">
        <p class="sect-eyebrow">ShopBR</p>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight mb-3">
          {{ 'INFO.CONTACT.TITLE' | translate }}
        </h1>
        <p class="text-gray-500 text-base">{{ 'INFO.CONTACT.SUBTITLE' | translate }}</p>
      </div>

      <!-- Cards de informações -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">

        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <div class="trust-icon-wrap mb-4">
            <mat-icon>email</mat-icon>
          </div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {{ 'INFO.CONTACT.EMAIL_TITLE' | translate }}
          </p>
          <p class="text-sm font-medium text-gray-800">{{ 'INFO.CONTACT.EMAIL_VALUE' | translate }}</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <div class="trust-icon-wrap mb-4">
            <mat-icon>schedule</mat-icon>
          </div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {{ 'INFO.CONTACT.HOURS_TITLE' | translate }}
          </p>
          <p class="text-sm font-medium text-gray-800">{{ 'INFO.CONTACT.HOURS_VALUE' | translate }}</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <div class="trust-icon-wrap mb-4">
            <mat-icon>timer</mat-icon>
          </div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {{ 'INFO.CONTACT.RESPONSE_TITLE' | translate }}
          </p>
          <p class="text-sm font-medium text-gray-800">{{ 'INFO.CONTACT.RESPONSE_VALUE' | translate }}</p>
        </div>

      </div>

      <!-- Formulário de contato -->
      @if (sent()) {
        <div class="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in mb-10">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-green-600">check_circle</mat-icon>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ 'INFO.CONTACT.SUCCESS_TITLE' | translate }}</h2>
          <p class="text-gray-500 text-sm">{{ 'INFO.CONTACT.SUCCESS_MESSAGE' | translate }}</p>
        </div>
      } @else {
        <div class="bg-white border border-gray-200 rounded-xl p-6 mb-10">
          <h2 class="text-base font-semibold text-gray-900 mb-6">{{ 'INFO.CONTACT.FORM_TITLE' | translate }}</h2>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>{{ 'INFO.CONTACT.NAME' | translate }}</mat-label>
                <input matInput formControlName="name" [placeholder]="'INFO.CONTACT.NAME_PLACEHOLDER' | translate" />
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <mat-error>{{ 'INFO.CONTACT.VALIDATION.NAME_REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>{{ 'INFO.CONTACT.EMAIL' | translate }}</mat-label>
                <input matInput formControlName="email" type="email" [placeholder]="'INFO.CONTACT.EMAIL_PLACEHOLDER' | translate" />
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>{{ 'INFO.CONTACT.VALIDATION.EMAIL_REQUIRED' | translate }}</mat-error>
                } @else if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <mat-error>{{ 'INFO.CONTACT.VALIDATION.EMAIL_INVALID' | translate }}</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'INFO.CONTACT.SUBJECT' | translate }}</mat-label>
              <input matInput formControlName="subject" [placeholder]="'INFO.CONTACT.SUBJECT_PLACEHOLDER' | translate" />
              @if (form.get('subject')?.invalid && form.get('subject')?.touched) {
                <mat-error>{{ 'INFO.CONTACT.VALIDATION.SUBJECT_REQUIRED' | translate }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'INFO.CONTACT.MESSAGE' | translate }}</mat-label>
              <textarea
                matInput
                formControlName="message"
                rows="5"
                [placeholder]="'INFO.CONTACT.MESSAGE_PLACEHOLDER' | translate">
              </textarea>
              @if (form.get('message')?.invalid && form.get('message')?.touched) {
                <mat-error>{{ 'INFO.CONTACT.VALIDATION.MESSAGE_REQUIRED' | translate }}</mat-error>
              }
            </mat-form-field>

            <div class="flex justify-end">
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="loading()">
                @if (loading()) {
                  {{ 'INFO.CONTACT.SENDING' | translate }}
                } @else {
                  {{ 'INFO.CONTACT.SEND' | translate }}
                }
              </button>
            </div>

          </form>
        </div>
      }

      <!-- Voltar -->
      <a routerLink="/" class="cta-ghost text-sm">← {{ 'INFO.CONTACT.BACK' | translate }}</a>

    </div>
  `,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly sent = signal(false);

  readonly form = this.fb.group({
    name:    ['', [Validators.required, Validators.maxLength(100)]],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.maxLength(200)]],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { name, email, subject, message } = this.form.getRawValue();

    this.contactService.send({ name: name!, email: email!, subject: subject!, message: message! })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.sent.set(true);
        },
        error: () => {
          this.loading.set(false);
          const msg = this.translate.instant('INFO.CONTACT.ERROR');
          this.snackBar.open(msg, '✕', { duration: 4000, panelClass: 'snack-error' });
        },
      });
  }
}
