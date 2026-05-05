import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300 mt-12">
      <div class="container mx-auto px-4 py-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-white text-lg font-bold mb-4">🛒 ShopBR</h3>
            <p class="text-sm text-gray-400">
              Seu marketplace de confiança com as melhores ofertas do Brasil.
            </p>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3">Comprar</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/products" class="hover:text-white transition-colors">Todos os Produtos</a></li>
              <li><a routerLink="/products?featured=true" class="hover:text-white transition-colors">Em Destaque</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3">Suporte</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3">Pagamento</h4>
            <div class="flex flex-wrap gap-2 text-xs">
              <span class="bg-gray-700 px-2 py-1 rounded">PIX</span>
              <span class="bg-gray-700 px-2 py-1 rounded">Cartão</span>
              <span class="bg-gray-700 px-2 py-1 rounded">Stripe</span>
              <span class="bg-gray-700 px-2 py-1 rounded">Mercado Pago</span>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © {{ year }} ShopBR. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}