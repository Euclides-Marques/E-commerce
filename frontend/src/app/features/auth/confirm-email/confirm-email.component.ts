import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslatePipe],
  template: `
    <div class="text-center">
      @if (loading()) {
        <div class="flex flex-col items-center gap-4">
          <mat-spinner diameter="48" color="primary" />
          <p class="text-gray-500">{{ 'AUTH.CONFIRM_EMAIL.VERIFYING' | translate }}</p>
        </div>
      }

      @if (!loading() && success()) {
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <mat-icon style="color: #16a34a; font-size: 48px; width: 48px; height: 48px;">verified</mat-icon>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          {{ 'AUTH.CONFIRM_EMAIL.SUCCESS_TITLE' | translate }}
        </h2>
        <p class="text-gray-500 mb-8">
          {{ 'AUTH.CONFIRM_EMAIL.SUCCESS_MESSAGE' | translate }}
        </p>
        <a routerLink="/auth/login" mat-flat-button color="primary" class="w-full auth-submit">
          {{ 'AUTH.LOGIN' | translate }}
        </a>
      }

      @if (!loading() && !success()) {
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <mat-icon style="color: #dc2626; font-size: 48px; width: 48px; height: 48px;">error_outline</mat-icon>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          {{ 'AUTH.CONFIRM_EMAIL.ERROR_TITLE' | translate }}
        </h2>
        <p class="text-gray-500 mb-2">{{ errorMessage() }}</p>
        <p class="text-sm text-gray-400 mb-8">
          {{ 'AUTH.CONFIRM_EMAIL.ERROR_HINT' | translate }}
        </p>
        <a routerLink="/auth/register" mat-flat-button color="primary" class="w-full auth-submit">
          {{ 'AUTH.REGISTER' | translate }}
        </a>
      }
    </div>
  `,
})
export class ConfirmEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly success = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('Token não encontrado na URL.');
      return;
    }

    this.authService.confirmEmail(token).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.errors?.[0] ?? 'Não foi possível confirmar o e-mail.');
        this.loading.set(false);
      },
    });
  }
}
