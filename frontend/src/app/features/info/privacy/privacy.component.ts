import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="max-w-3xl mx-auto py-8 animate-fade-in">

      <!-- Header -->
      <div class="mb-10">
        <p class="sect-eyebrow">ShopBR</p>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight mb-2">
          {{ 'INFO.PRIVACY.TITLE' | translate }}
        </h1>
        <p class="text-xs text-gray-400">{{ 'INFO.PRIVACY.UPDATED' | translate }}</p>
      </div>

      <!-- Intro -->
      <p class="text-gray-600 text-sm leading-relaxed mb-8 pb-8 border-b border-gray-100">
        {{ 'INFO.PRIVACY.INTRO' | translate }}
      </p>

      <!-- Seções -->
      <div class="space-y-8">
        @for (section of sections; track section.title) {
          <div>
            <h2 class="text-base font-semibold text-gray-900 mb-2">{{ section.title | translate }}</h2>
            <p class="text-gray-500 text-sm leading-relaxed">{{ section.body | translate }}</p>
          </div>
        }
      </div>

      <!-- Voltar -->
      <div class="mt-12 pt-8 border-t border-gray-100">
        <a routerLink="/" class="cta-ghost text-sm">← {{ 'INFO.PRIVACY.BACK' | translate }}</a>
      </div>

    </div>
  `,
})
export class PrivacyComponent {
  readonly sections = [
    { title: 'INFO.PRIVACY.S1_TITLE', body: 'INFO.PRIVACY.S1_BODY' },
    { title: 'INFO.PRIVACY.S2_TITLE', body: 'INFO.PRIVACY.S2_BODY' },
    { title: 'INFO.PRIVACY.S3_TITLE', body: 'INFO.PRIVACY.S3_BODY' },
    { title: 'INFO.PRIVACY.S4_TITLE', body: 'INFO.PRIVACY.S4_BODY' },
    { title: 'INFO.PRIVACY.S5_TITLE', body: 'INFO.PRIVACY.S5_BODY' },
  ];
}
