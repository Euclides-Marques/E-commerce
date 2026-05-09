import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="max-w-3xl mx-auto py-8 animate-fade-in">

      <!-- Header -->
      <div class="mb-10">
        <p class="sect-eyebrow">ShopBR</p>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight mb-3">
          {{ 'INFO.HELP.TITLE' | translate }}
        </h1>
        <p class="text-gray-500 text-base">{{ 'INFO.HELP.SUBTITLE' | translate }}</p>
      </div>

      <!-- FAQ -->
      <div class="mb-10">
        <h2 class="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
          {{ 'INFO.HELP.FAQ_TITLE' | translate }}
        </h2>
        <div class="space-y-0">
          @for (item of faqs; track item.q) {
            <div class="py-5 border-b border-gray-100">
              <p class="font-semibold text-gray-900 mb-2 text-sm">{{ item.q | translate }}</p>
              <p class="text-gray-500 text-sm leading-relaxed">{{ item.a | translate }}</p>
            </div>
          }
        </div>
      </div>

      <!-- CTA para contato -->
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-gray-600">{{ 'INFO.HELP.CONTACT_LINK' | translate }}</p>
        <a routerLink="/contact" class="cta-primary text-sm">
          {{ 'INFO.HELP.CONTACT_CTA' | translate }}
        </a>
      </div>

    </div>
  `,
})
export class HelpComponent {
  readonly faqs = [
    { q: 'INFO.HELP.Q1', a: 'INFO.HELP.A1' },
    { q: 'INFO.HELP.Q2', a: 'INFO.HELP.A2' },
    { q: 'INFO.HELP.Q3', a: 'INFO.HELP.A3' },
    { q: 'INFO.HELP.Q4', a: 'INFO.HELP.A4' },
    { q: 'INFO.HELP.Q5', a: 'INFO.HELP.A5' },
  ];
}
