import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardSummaryDto } from '../../../core/models/admin.model';

interface OrderStatusView {
  label: string;
  count: number;
  percent: number;
  color: string;
}

interface KpiView {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  tone: 'success' | 'info' | 'violet' | 'warning';
}

type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
};

type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
};

type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  labels: string[];
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    NgApexchartsModule,
    TranslatePipe,
  ],
  template: `
    <section class="dashboard-page animate-fade-in">
      <header class="admin-page-header dashboard-header">
        <div>
          <p class="dashboard-header__eyebrow">Analytics</p>
          <h2 class="admin-page-title">{{ 'ADMIN.DASHBOARD.TITLE' | translate }}</h2>
          <p class="admin-page-subtitle">{{ 'ADMIN.DASHBOARD.SUBTITLE' | translate }}</p>
        </div>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="ui-surface-form-field dashboard-period">
          <mat-label>{{ 'ADMIN.DASHBOARD.PERIOD' | translate }}</mat-label>
          <mat-select [value]="daysBack()" (selectionChange)="changePeriod($event.value)">
            <mat-option [value]="7">{{ 'ADMIN.DASHBOARD.LAST_7' | translate }}</mat-option>
            <mat-option [value]="15">{{ 'ADMIN.DASHBOARD.LAST_15' | translate }}</mat-option>
            <mat-option [value]="30">{{ 'ADMIN.DASHBOARD.LAST_30' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>
      </header>

      @if (loading()) {
        <div class="dashboard-loading">
          <mat-spinner diameter="42"></mat-spinner>
          <p>Carregando indicadores...</p>
        </div>
      }

      @if (!loading() && summary()) {
        <div class="kpi-grid">
          @for (kpi of kpis(); track kpi.label) {
            <article class="kpi-card ui-card ui-card--interactive" [class]="'kpi-card--' + kpi.tone">
              <div class="kpi-card__top">
                <span class="kpi-card__label">{{ kpi.label }}</span>
                <span class="kpi-card__icon">
                  <mat-icon aria-hidden="true">{{ kpi.icon }}</mat-icon>
                </span>
              </div>
              <strong class="kpi-card__value">{{ kpi.value }}</strong>
              <span class="kpi-card__detail">{{ kpi.detail }}</span>
            </article>
          }
        </div>

        <div class="dashboard-grid dashboard-grid--analytics">
          <article class="ui-card analytics-card analytics-card--wide">
            <div class="ui-card__header">
              <div>
                <h3 class="ui-card__title">Vendas dos últimos {{ daysBack() }} dias</h3>
                <p class="chart-caption">Receita e volume de pedidos no período selecionado</p>
              </div>
              <span class="ui-badge ui-badge--info">{{ daysBack() }} dias</span>
            </div>

            <div class="chart-shell" role="img" aria-label="Gráfico de linha com receita e pedidos por dia">
              @if (summary()!.dailySales.length === 0) {
                <div class="ui-empty-state">Nenhuma venda registrada neste período.</div>
              } @else {
                <apx-chart
                  [series]="salesLineChart().series"
                  [chart]="salesLineChart().chart"
                  [colors]="salesLineChart().colors"
                  [dataLabels]="salesLineChart().dataLabels"
                  [stroke]="salesLineChart().stroke"
                  [fill]="salesLineChart().fill"
                  [grid]="salesLineChart().grid"
                  [tooltip]="salesLineChart().tooltip"
                  [xaxis]="salesLineChart().xaxis"
                  [yaxis]="salesLineChart().yaxis">
                </apx-chart>
              }
            </div>
          </article>

          <article class="ui-card analytics-card">
            <div class="ui-card__header">
              <div>
                <h3 class="ui-card__title">{{ 'ADMIN.DASHBOARD.ORDER_STATUS' | translate }}</h3>
                <p class="chart-caption">Distribuição atual dos pedidos</p>
              </div>
            </div>

            <div class="status-summary">
              <div class="donut-chart" role="img" aria-label="Gráfico de rosca com distribuição de pedidos por status">
                <apx-chart
                  [series]="statusDonutChart().series"
                  [chart]="statusDonutChart().chart"
                  [colors]="statusDonutChart().colors"
                  [labels]="statusDonutChart().labels"
                  [dataLabels]="statusDonutChart().dataLabels"
                  [fill]="statusDonutChart().fill"
                  [legend]="statusDonutChart().legend"
                  [plotOptions]="statusDonutChart().plotOptions"
                  [responsive]="statusDonutChart().responsive"
                  [tooltip]="statusDonutChart().tooltip">
                </apx-chart>
              </div>

              <div class="status-list">
                @for (stat of orderStats(); track stat.label) {
                  <div class="status-row">
                    <div class="status-row__meta">
                      <span class="status-dot" [style.background]="stat.color"></span>
                      <span>{{ stat.label }}</span>
                    </div>
                    <div class="status-row__value">
                      <strong>{{ stat.count }}</strong>
                      <span>{{ stat.percent | number:'1.0-0' }}%</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </article>
        </div>

        <div class="dashboard-grid">
          <article class="ui-card list-card">
            <div class="ui-card__header">
              <h3 class="ui-card__title">{{ 'ADMIN.DASHBOARD.TOP_PRODUCTS' | translate }}</h3>
              <span class="ui-badge ui-badge--violet">Top 5</span>
            </div>

            @if (summary()!.topProducts.length > 0) {
              <div class="chart-shell chart-shell--compact" role="img" aria-label="Gráfico de barras com receita dos produtos mais vendidos">
                <apx-chart
                  [series]="topProductsBarChart().series"
                  [chart]="topProductsBarChart().chart"
                  [colors]="topProductsBarChart().colors"
                  [dataLabels]="topProductsBarChart().dataLabels"
                  [plotOptions]="topProductsBarChart().plotOptions"
                  [grid]="topProductsBarChart().grid"
                  [tooltip]="topProductsBarChart().tooltip"
                  [xaxis]="topProductsBarChart().xaxis"
                  [yaxis]="topProductsBarChart().yaxis">
                </apx-chart>
              </div>
            }

            <div class="product-list">
              @if (summary()!.topProducts.length === 0) {
                <div class="ui-empty-state">{{ 'ADMIN.DASHBOARD.NO_DATA' | translate }}</div>
              } @else {
                @for (product of summary()!.topProducts; track product.productId; let i = $index) {
                  <div class="product-row">
                    <span class="product-row__rank">{{ i + 1 }}</span>
                    <div class="product-row__image">
                      @if (product.imageUrl) {
                        <img [src]="product.imageUrl" [alt]="product.productName" loading="lazy" />
                      } @else {
                        <mat-icon aria-hidden="true">image</mat-icon>
                      }
                    </div>
                    <div class="product-row__content">
                      <div class="product-row__top">
                        <strong>{{ product.productName }}</strong>
                        <span>{{ product.totalRevenue | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                      </div>
                      <div class="product-row__track">
                        <span [style.width.%]="topProductPercent(product.totalRevenue)"></span>
                      </div>
                      <small>{{ product.totalSold }} {{ 'ADMIN.DASHBOARD.SOLD' | translate }}</small>
                    </div>
                  </div>
                }
              }
            </div>
          </article>

          <article class="ui-card list-card">
            <div class="ui-card__header">
              <h3 class="ui-card__title">{{ 'ADMIN.DASHBOARD.RECENT_ORDERS' | translate }}</h3>
              <span class="ui-badge ui-badge--neutral">Tempo real</span>
            </div>

            <div class="orders-list">
              @if (summary()!.recentOrders.length === 0) {
                <div class="ui-empty-state">{{ 'ADMIN.DASHBOARD.NO_DATA' | translate }}</div>
              } @else {
                @for (order of summary()!.recentOrders; track order.id) {
                  <div class="order-row">
                    <div class="order-row__main">
                      <strong>#{{ order.orderNumber }}</strong>
                      <span>{{ order.userName }}</span>
                    </div>
                    <div class="order-row__meta">
                      <span class="ui-badge" [class]="statusClass(order.status)">
                        {{ statusLabel(order.status) }}
                      </span>
                      <strong>{{ order.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong>
                    </div>
                  </div>
                }
              }
            </div>
          </article>
        </div>
      }
    </section>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1280px;
      margin: 0 auto;
    }

    .dashboard-header {
      align-items: center;
    }

    .dashboard-header__eyebrow {
      margin: 0 0 8px;
      color: var(--brand-primary);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .1em;
      text-transform: uppercase;
    }

    .dashboard-period {
      width: 188px;
      flex: 0 0 auto;
    }

    .dashboard-loading {
      display: grid;
      place-items: center;
      gap: 14px;
      min-height: 360px;
      color: var(--text-secondary);
    }

    .dashboard-loading p {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 18px;
    }

    .kpi-card {
      position: relative;
      overflow: hidden;
      padding: 20px;
    }

    .kpi-card::after {
      content: '';
      position: absolute;
      inset: auto -24px -42px auto;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: currentColor;
      opacity: .06;
    }

    .kpi-card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }

    .kpi-card__label {
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 800;
    }

    .kpi-card__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 13px;
      background: var(--bg-surface-soft);
    }

    .kpi-card__icon mat-icon {
      font-size: 21px;
      width: 21px;
      height: 21px;
    }

    .kpi-card__value {
      display: block;
      color: var(--text-heading);
      font-size: 28px;
      font-weight: 850;
      letter-spacing: -.04em;
      line-height: 1;
    }

    .kpi-card__detail {
      display: block;
      margin-top: 10px;
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 650;
    }

    .kpi-card--success { color: var(--color-success); }
    .kpi-card--info { color: var(--color-info); }
    .kpi-card--violet { color: var(--color-violet); }
    .kpi-card--warning { color: var(--color-warning); }
    .kpi-card--success .kpi-card__icon { background: var(--color-success-soft); }
    .kpi-card--info .kpi-card__icon { background: var(--color-info-soft); }
    .kpi-card--violet .kpi-card__icon { background: var(--color-violet-soft); }
    .kpi-card--warning .kpi-card__icon { background: var(--color-warning-soft); }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-bottom: 18px;
    }

    .dashboard-grid--analytics {
      grid-template-columns: minmax(0, 1.35fr) minmax(360px, .65fr);
    }

    .analytics-card,
    .list-card {
      min-width: 0;
    }

    .chart-caption {
      margin: 5px 0 0;
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 600;
    }

    .chart-shell {
      min-height: 292px;
      padding: 12px 14px 8px;
    }

    .chart-shell--compact {
      min-height: 236px;
      padding-bottom: 0;
    }

    .chart-shell apx-chart {
      display: block;
      width: 100%;
    }

    .status-summary {
      display: grid;
      grid-template-columns: 190px 1fr;
      gap: 22px;
      align-items: center;
      padding: 24px 20px 22px;
    }

    .donut-chart {
      width: 190px;
      min-width: 0;
    }

    .status-list {
      display: grid;
      gap: 12px;
      min-width: 0;
    }

    .status-row,
    .status-row__meta,
    .status-row__value {
      display: flex;
      align-items: center;
    }

    .status-row {
      justify-content: space-between;
      gap: 12px;
    }

    .status-row__meta {
      gap: 9px;
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 750;
    }

    .status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      flex: 0 0 auto;
    }

    .status-row__value {
      gap: 8px;
      color: var(--text-heading);
      font-size: 13px;
    }

    .status-row__value span {
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 700;
    }

    .product-list,
    .orders-list {
      display: grid;
      gap: 2px;
      padding: 14px 16px 18px;
    }

    .product-row {
      display: grid;
      grid-template-columns: 24px 44px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 10px 0;
    }

    .product-row__rank {
      color: var(--text-placeholder);
      font-size: 13px;
      font-weight: 900;
    }

    .product-row__image {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      overflow: hidden;
      border: 1px solid var(--admin-border);
      border-radius: 12px;
      background: var(--bg-surface-soft);
      color: var(--text-placeholder);
    }

    .product-row__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-row__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }

    .product-row__top strong,
    .order-row__main strong {
      overflow: hidden;
      color: var(--text-heading);
      font-size: 13px;
      font-weight: 850;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-row__top span,
    .order-row__meta strong {
      color: var(--text-heading);
      font-size: 13px;
      font-weight: 850;
      white-space: nowrap;
    }

    .product-row__track {
      height: 6px;
      margin: 8px 0 5px;
      overflow: hidden;
      border-radius: 999px;
      background: var(--bg-surface-soft);
    }

    .product-row__track span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--brand-primary), #2563EB);
      animation: growWidth 680ms cubic-bezier(.2, .8, .2, 1) both;
    }

    .product-row small,
    .order-row__main span {
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 650;
    }

    .order-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 13px 0;
      border-bottom: 1px solid var(--admin-border);
    }

    .order-row:last-child {
      border-bottom: 0;
    }

    .order-row__main {
      display: grid;
      gap: 3px;
      min-width: 0;
    }

    .order-row__meta {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 0 0 auto;
    }

    @keyframes growWidth {
      from { transform: scaleX(.08); transform-origin: left; }
      to { transform: scaleX(1); transform-origin: left; }
    }

    @media (max-width: 1100px) {
      .kpi-grid,
      .dashboard-grid,
      .dashboard-grid--analytics {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .analytics-card--wide {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 767px) {
      .dashboard-header {
        align-items: stretch;
      }

      .dashboard-period,
      .kpi-grid,
      .dashboard-grid,
      .dashboard-grid--analytics {
        width: 100%;
        grid-template-columns: 1fr;
      }

      .status-summary {
        grid-template-columns: 1fr;
        justify-items: center;
      }

      .status-list {
        width: 100%;
      }

      .order-row,
      .product-row__top {
        align-items: flex-start;
        flex-direction: column;
      }

      .order-row__meta {
        width: 100%;
        justify-content: space-between;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly loading = signal(false);
  readonly summary = signal<DashboardSummaryDto | null>(null);
  readonly daysBack = signal(30);

  readonly orderStats = computed<OrderStatusView[]>(() => {
    const s = this.summary();
    if (!s) return [];
    const total = s.totalOrders || 1;

    return [
      { label: 'Pendente', count: s.pendingOrders, percent: (s.pendingOrders / total) * 100, color: '#D97706' },
      { label: 'Pago', count: s.paidOrders, percent: (s.paidOrders / total) * 100, color: '#2563EB' },
      { label: 'Enviado', count: s.shippedOrders, percent: (s.shippedOrders / total) * 100, color: '#7C3AED' },
      { label: 'Entregue', count: s.deliveredOrders, percent: (s.deliveredOrders / total) * 100, color: '#059669' },
      { label: 'Cancelado', count: s.cancelledOrders, percent: (s.cancelledOrders / total) * 100, color: '#DC2626' },
    ];
  });

  readonly kpis = computed<KpiView[]>(() => {
    const s = this.summary();
    if (!s) return [];

    return [
      {
        label: 'Receita total',
        value: this.formatCurrency(s.totalRevenue),
        detail: `${this.formatCurrency(s.recentRevenue)} no período`,
        icon: 'payments',
        tone: 'success',
      },
      {
        label: 'Pedidos',
        value: s.totalOrders,
        detail: `${s.pendingOrders} aguardando atenção`,
        icon: 'receipt_long',
        tone: 'info',
      },
      {
        label: 'Produtos ativos',
        value: s.totalProducts,
        detail: 'Catálogo disponível para venda',
        icon: 'inventory_2',
        tone: 'violet',
      },
      {
        label: 'Usuários',
        value: s.totalUsers,
        detail: 'Clientes cadastrados',
        icon: 'groups',
        tone: 'warning',
      },
    ];
  });

  readonly maxTopProductRevenue = computed(() => {
    const s = this.summary();
    if (!s || s.topProducts.length === 0) return 1;
    return Math.max(...s.topProducts.map(p => p.totalRevenue), 1);
  });

  readonly salesLineChart = computed<LineChartOptions>(() => {
    const sales = this.summary()?.dailySales ?? [];

    return {
      series: [
        {
          name: 'Receita',
          type: 'line',
          data: sales.map(day => day.totalRevenue),
        },
        {
          name: 'Pedidos',
          type: 'line',
          data: sales.map(day => day.totalOrders),
        },
      ],
      chart: {
        type: 'line',
        height: 280,
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 850,
          animateGradually: { enabled: true, delay: 120 },
          dynamicAnimation: { enabled: true, speed: 350 },
        },
      },
      colors: ['#F04E23', '#2563EB'],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: [4, 3],
        lineCap: 'round',
      },
      fill: {
        type: 'solid',
        opacity: 1,
      },
      grid: {
        borderColor: '#EEF2F7',
        strokeDashArray: 4,
        padding: { left: 8, right: 12 },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: [
          { formatter: value => this.formatCurrency(value) },
          { formatter: value => `${Math.round(value)} pedidos` },
        ],
      },
      xaxis: {
        categories: sales.map(day => this.formatShortDate(day.date)),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#6B7280', fontSize: '11px', fontWeight: 700 },
        },
      },
      yaxis: {
        labels: {
          style: { colors: '#6B7280', fontSize: '11px' },
          formatter: value => value >= 1000 ? `${Math.round(value / 1000)}k` : `${Math.round(value)}`,
        },
      },
    };
  });

  readonly statusDonutChart = computed<DonutChartOptions>(() => {
    const stats = this.orderStats();
    const hasData = stats.some(stat => stat.count > 0);

    return {
      series: hasData ? stats.map(stat => stat.count) : [1],
      chart: {
        type: 'donut',
        height: 210,
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 820,
          animateGradually: { enabled: true, delay: 90 },
          dynamicAnimation: { enabled: true, speed: 320 },
        },
      },
      colors: hasData ? stats.map(stat => stat.color) : ['#E5E7EB'],
      labels: hasData ? stats.map(stat => stat.label) : ['Sem pedidos'],
      dataLabels: { enabled: false },
      fill: { type: 'solid' },
      legend: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              name: {
                show: true,
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
                offsetY: 18,
              },
              value: {
                show: true,
                color: '#111827',
                fontSize: '28px',
                fontWeight: 850,
                offsetY: -14,
                formatter: value => value,
              },
              total: {
                show: true,
                label: 'pedidos',
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
                formatter: () => `${this.summary()?.totalOrders ?? 0}`,
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 220 },
          },
        },
      ],
      tooltip: {
        y: {
          formatter: value => `${value} pedidos`,
        },
      },
    };
  });

  readonly topProductsBarChart = computed<BarChartOptions>(() => {
    const products = this.summary()?.topProducts ?? [];

    return {
      series: [
        {
          name: 'Receita',
          data: products.map(product => product.totalRevenue),
        },
      ],
      chart: {
        type: 'bar',
        height: 220,
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: 'easeout',
          speed: 760,
          animateGradually: { enabled: true, delay: 110 },
          dynamicAnimation: { enabled: true, speed: 320 },
        },
      },
      colors: ['#7C3AED'],
      dataLabels: { enabled: false },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '52%',
        },
      },
      grid: {
        borderColor: '#EEF2F7',
        strokeDashArray: 4,
        padding: { left: 4, right: 10 },
      },
      tooltip: {
        y: {
          formatter: value => this.formatCurrency(value),
        },
      },
      xaxis: {
        categories: products.map(product => product.productName),
        labels: {
          style: { colors: '#6B7280', fontSize: '11px' },
          formatter: value => {
            const numeric = Number(value);
            return Number.isFinite(numeric) ? this.formatCompactCurrency(numeric) : value;
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: '#111827', fontSize: '11px', fontWeight: 700 },
          maxWidth: 120,
        },
      },
    };
  });

  ngOnInit(): void {
    this.loadData();
  }

  changePeriod(days: number): void {
    this.daysBack.set(days);
    this.loadData();
  }

  topProductPercent(value: number): number {
    if (value <= 0) return 4;
    return Math.max((value / this.maxTopProductRevenue()) * 100, 8);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'ui-badge--warning',
      Paid: 'ui-badge--info',
      Shipped: 'ui-badge--violet',
      Delivered: 'ui-badge--success',
      Cancelled: 'ui-badge--danger',
      Refunded: 'ui-badge--neutral',
    };
    return map[status] ?? 'ui-badge--neutral';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      Pending: 'Pendente',
      Paid: 'Pago',
      Shipped: 'Enviado',
      Delivered: 'Entregue',
      Cancelled: 'Cancelado',
      Refunded: 'Reembolsado',
    };
    return map[status] ?? status;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  }

  private formatCompactCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  private formatShortDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(date));
  }

  private loadData(): void {
    this.loading.set(true);
    this.adminService.getDashboardSummary(this.daysBack()).subscribe({
      next: data => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
