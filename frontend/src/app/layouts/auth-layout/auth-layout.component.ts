import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  styles: [`
    :host { display: contents; }

    .auth-wrapper {
      min-height: 100vh;
      display: flex;
    }

    /* ── Brand Panel (desktop only) ── */
    .brand-panel {
      display: none;
      flex-direction: column;
      justify-content: center;
      padding: 56px 48px;
      background: linear-gradient(150deg, #F04E23 0%, #C8350E 100%);
      position: relative;
      overflow: hidden;
    }

    @media (min-width: 1024px) {
      .brand-panel { display: flex; flex: 1; }
    }

    .brand-panel::before {
      content: '';
      position: absolute;
      top: -120px; right: -120px;
      width: 400px; height: 400px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      pointer-events: none;
    }

    .brand-panel::after {
      content: '';
      position: absolute;
      bottom: -80px; left: -80px;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      pointer-events: none;
    }

    .brand-content {
      position: relative;
      z-index: 1;
    }

    .brand-logo {
      display: inline-block;
      font-size: 34px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.8px;
      text-decoration: none;
      margin-bottom: 28px;
    }

    .brand-headline {
      font-size: 30px;
      font-weight: 600;
      color: #ffffff;
      line-height: 1.28;
      letter-spacing: -0.4px;
      margin-bottom: 16px;
    }

    .brand-sub {
      font-size: 15px;
      color: rgba(255,255,255,0.78);
      line-height: 1.65;
      max-width: 300px;
      margin-bottom: 52px;
    }

    .brand-feature-item {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }

    .brand-feature-item:last-child { margin-bottom: 0; }

    .brand-feature-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .brand-feature-icon .material-icons { font-size: 18px; color: #ffffff; }

    .brand-feature-text {
      font-size: 14px;
      font-weight: 500;
      color: rgba(255,255,255,0.88);
    }

    /* ── Form Panel ── */
    .form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      background: #ffffff;
    }

    .form-inner {
      width: 100%;
      max-width: 400px;
    }

    /* Mobile logo — hidden on desktop */
    .mobile-logo {
      display: block;
      text-align: center;
      margin-bottom: 36px;
      font-size: 28px;
      font-weight: 700;
      color: #F04E23;
      text-decoration: none;
      letter-spacing: -0.5px;
    }

    @media (min-width: 1024px) {
      .mobile-logo { display: none; }
    }
  `],
  template: `
    <div class="auth-wrapper">

      <!-- Brand Panel -->
      <div class="brand-panel">
        <div class="brand-content">
          <a href="/" class="brand-logo">ShopBR</a>
          <div class="brand-headline">Sua loja favorita,<br>sempre com você.</div>
          <p class="brand-sub">
            Milhares de produtos com entrega rápida<br>e preços imbatíveis.
          </p>
          <div>
            <div class="brand-feature-item">
              <div class="brand-feature-icon">
                <span class="material-icons">local_shipping</span>
              </div>
              <span class="brand-feature-text">Entrega rápida para todo o Brasil</span>
            </div>
            <div class="brand-feature-item">
              <div class="brand-feature-icon">
                <span class="material-icons">security</span>
              </div>
              <span class="brand-feature-text">Compras 100% seguras e protegidas</span>
            </div>
            <div class="brand-feature-item">
              <div class="brand-feature-icon">
                <span class="material-icons">payments</span>
              </div>
              <span class="brand-feature-text">Parcelamento em até 12x sem juros</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="form-panel">
        <div class="form-inner">
          <a href="/" class="mobile-logo">ShopBR</a>
          <router-outlet />
        </div>
      </div>

    </div>
  `,
})
export class AuthLayoutComponent {}
