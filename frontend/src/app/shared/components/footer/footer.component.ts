import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <footer class="bg-gray-950 text-gray-400 mt-16">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          <!-- Brand -->
          <div>
            <p class="text-white text-lg font-bold mb-3 tracking-tight">
              Shop<span class="text-primary-500">BR</span>
            </p>
            <p class="text-sm text-gray-500 leading-relaxed max-w-[200px]">
              {{ 'FOOTER.TAGLINE' | translate }}
            </p>
          </div>

          <!-- Comprar -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-xs tracking-widest uppercase opacity-60">
              {{ 'FOOTER.SECTION_SHOP' | translate }}
            </h4>
            <ul class="space-y-3 text-sm">
              <li>
                <a routerLink="/products" class="text-gray-400 hover:text-white transition-colors">
                  {{ 'FOOTER.ALL_PRODUCTS' | translate }}
                </a>
              </li>
              <li>
                <a routerLink="/products" [queryParams]="{featured: true}" class="text-gray-400 hover:text-white transition-colors">
                  {{ 'FOOTER.FEATURED' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Suporte -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-xs tracking-widest uppercase opacity-60">
              {{ 'FOOTER.SECTION_SUPPORT' | translate }}
            </h4>
            <ul class="space-y-3 text-sm">
              <li>
                <a routerLink="/help" class="text-gray-400 hover:text-white transition-colors">
                  {{ 'FOOTER.HELP_CENTER' | translate }}
                </a>
              </li>
              <li>
                <a routerLink="/contact" class="text-gray-400 hover:text-white transition-colors">
                  {{ 'FOOTER.CONTACT' | translate }}
                </a>
              </li>
              <li>
                <a routerLink="/privacy" class="text-gray-400 hover:text-white transition-colors">
                  {{ 'FOOTER.PRIVACY' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Pagamento -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-xs tracking-widest uppercase opacity-60">
              {{ 'FOOTER.SECTION_PAYMENT' | translate }}
            </h4>
            <div class="flex flex-wrap gap-2">
              <span class="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-md font-medium">PIX</span>
              <span class="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-md font-medium">Cartão</span>
              <span class="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-md font-medium">Stripe</span>
              <span class="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-md font-medium">Mercado Pago</span>
            </div>
          </div>

        </div>

        <div class="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p class="text-xs text-gray-600">
            © {{ year }} ShopBR. {{ 'FOOTER.COPYRIGHT' | translate }}
          </p>
          <p class="text-xs text-gray-700">
            {{ 'FOOTER.MADE_IN_BRAZIL' | translate }}
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
