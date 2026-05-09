import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
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
              Seu marketplace de confiança com as melhores ofertas do Brasil.
            </p>
          </div>

          <!-- Comprar -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-sm tracking-wide uppercase text-xs opacity-60">Comprar</h4>
            <ul class="space-y-3 text-sm">
              <li>
                <a routerLink="/products" class="text-gray-400 hover:text-white transition-colors">
                  Todos os Produtos
                </a>
              </li>
              <li>
                <a routerLink="/products" [queryParams]="{featured: true}" class="text-gray-400 hover:text-white transition-colors">
                  Em Destaque
                </a>
              </li>
            </ul>
          </div>

          <!-- Suporte -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-sm tracking-wide uppercase text-xs opacity-60">Suporte</h4>
            <ul class="space-y-3 text-sm">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>

          <!-- Pagamento -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-sm tracking-wide uppercase text-xs opacity-60">Pagamento</h4>
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
            © {{ year }} ShopBR. Todos os direitos reservados.
          </p>
          <p class="text-xs text-gray-700">
            Feito com cuidado no Brasil
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
