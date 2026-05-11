import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    <div class="text-center">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
          <mat-icon class="text-5xl" style="color: #ee4d2d; font-size: 48px; width: 48px; height: 48px;">mark_email_unread</mat-icon>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        {{ 'AUTH.VERIFY_EMAIL.TITLE' | translate }}
      </h2>

      @if (email()) {
        <p class="text-gray-500 mb-1">
          {{ 'AUTH.VERIFY_EMAIL.SENT_TO' | translate }}
        </p>
        <p class="font-semibold text-gray-700 mb-4">{{ email() }}</p>
      } @else {
        <p class="text-gray-500 mb-4">
          {{ 'AUTH.VERIFY_EMAIL.CHECK_INBOX' | translate }}
        </p>
      }

      <p class="text-sm text-gray-400 mb-8">
        {{ 'AUTH.VERIFY_EMAIL.EXPIRES_IN' | translate }}
      </p>

      <div class="space-y-3">
        <a routerLink="/auth/login" mat-flat-button color="primary" class="w-full auth-submit">
          {{ 'AUTH.LOGIN' | translate }}
        </a>
        <a routerLink="/" mat-stroked-button class="w-full">
          {{ 'AUTH.VERIFY_EMAIL.BROWSE_PRODUCTS' | translate }}
        </a>
      </div>

      <p class="text-xs text-gray-400 mt-6">
        {{ 'AUTH.VERIFY_EMAIL.SPAM_HINT' | translate }}
      </p>
    </div>
  `,
})
export class VerifyEmailComponent implements OnInit {
  private readonly router = inject(Router);

  readonly email = signal('');

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { email?: string } | undefined;
    if (state?.email) {
      this.email.set(state.email);
    } else {
      const hist = history.state as { email?: string };
      if (hist?.email) this.email.set(hist.email);
    }
  }
}
