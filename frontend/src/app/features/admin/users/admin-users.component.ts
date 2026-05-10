import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../../core/services/admin.service';
import { AdminUserDto } from '../../../core/models/admin.model';
import { PaginatedResult } from '../../../core/models/paginated-result.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    TranslatePipe,
  ],
  styles: [`
    /* ── KPI Strip ──────────────────────────────────────────────────────── */
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 18px;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px 20px;
    }
    .kpi-icon {
      display: flex; align-items: center; justify-content: center;
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    }
    .kpi-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .kpi-icon--info    { background: var(--color-info-soft);    color: var(--color-info);    }
    .kpi-icon--success { background: var(--color-success-soft); color: var(--color-success); }
    .kpi-icon--neutral { background: var(--bg-surface-soft);    color: var(--text-secondary); }
    .kpi-icon--violet  { background: var(--color-violet-soft);  color: var(--color-violet);  }
    .kpi-value { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-heading); line-height: 1.1; }
    .kpi-label { margin: 4px 0 0; font-size: 12px; color: var(--admin-muted); }

    /* ── Filter toolbar ─────────────────────────────────────────────────── */
    .filter-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .filter-search-wrap {
      flex: 1;
      min-width: 180px;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--admin-border);
      border-radius: 8px;
      padding: 0 12px;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }
    .filter-search-wrap--focused {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px var(--brand-ring);
    }
    .filter-search-icon {
      color: var(--admin-muted);
      font-size: 17px !important; width: 17px !important; height: 17px !important;
      flex-shrink: 0;
    }
    .filter-search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none !important;
      box-shadow: none !important;
      font-size: 14px;
      color: var(--text-primary);
      font-family: var(--font-sans);
    }
    .filter-search-input::placeholder { color: var(--text-placeholder); }
    .filter-search-clear {
      display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; padding: 2px;
      color: var(--admin-muted); border-radius: 4px;
      transition: color 150ms ease, background 150ms ease;
    }
    .filter-search-clear:hover { color: var(--text-primary); background: var(--admin-border); }
    .filter-search-clear mat-icon { font-size: 15px !important; width: 15px !important; height: 15px !important; }

    .filter-clear-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 12px;
      background: none;
      border: 1px solid var(--admin-border);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
      font-family: var(--font-sans);
      transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
    }
    .filter-clear-btn mat-icon { font-size: 15px !important; width: 15px !important; height: 15px !important; }
    .filter-clear-btn:hover {
      border-color: var(--border-strong);
      color: var(--text-heading);
      background: var(--bg-surface-soft);
    }

    /* ── User cell ──────────────────────────────────────────────────────── */
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F04E23 0%, #F97316 100%);
      color: #fff;
      font-size: 13px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      letter-spacing: -0.2px;
    }
    .user-name  { font-size: 13.5px; font-weight: 500; color: var(--text-heading); margin: 0 0 1px; line-height: 1.3; }
    .user-email { font-size: 11.5px; color: var(--admin-muted); margin: 0; line-height: 1.3; }

    /* ── Orders badge ───────────────────────────────────────────────────── */
    .orders-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 26px; height: 22px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--admin-border);
      border-radius: 6px;
      font-size: 12px; font-weight: 600;
      color: var(--text-secondary);
      padding: 0 6px;
    }
    .orders-badge--has { background: var(--color-info-soft); border-color: transparent; color: var(--color-info); }

    /* ── Date cell ──────────────────────────────────────────────────────── */
    .date-text { font-size: 13px; color: var(--text-heading); font-weight: 500; display: block; }

    /* ── Material table overrides ───────────────────────────────────────── */
    :host ::ng-deep .users-table { background: transparent; width: 100%; }
    :host ::ng-deep .users-table .mat-mdc-header-row {
      background: var(--bg-surface-soft);
      border-bottom: 1px solid var(--admin-border);
    }
    :host ::ng-deep .users-table .mat-mdc-header-cell {
      color: var(--text-secondary) !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      letter-spacing: .06em !important;
      text-transform: uppercase;
      border-bottom: none !important;
      padding: 12px 16px !important;
    }
    :host ::ng-deep .users-table .mat-mdc-cell {
      border-bottom: 1px solid var(--admin-border) !important;
      color: var(--text-primary);
      font-size: 14px;
      padding: 14px 16px !important;
      vertical-align: middle;
    }
    :host ::ng-deep .users-table .mat-mdc-row:last-child .mat-mdc-cell {
      border-bottom: none !important;
    }
    :host ::ng-deep .users-table .mat-mdc-row { transition: background var(--motion-fast); }
    :host ::ng-deep .users-table .mat-mdc-row:hover .mat-mdc-cell { background: var(--bg-surface-soft); }

    /* ── Role select badge-style ────────────────────────────────────────── */
    :host ::ng-deep .users-table .mat-mdc-cell .role-select .mat-mdc-select-trigger {
      display: inline-flex !important;
      align-items: center;
      background: var(--color-violet-soft);
      color: var(--color-violet);
      border-radius: 999px;
      padding: 3px 6px 3px 12px !important;
      font-size: 12px !important;
      font-weight: 700;
      font-family: var(--font-sans);
      min-height: unset !important;
      height: 26px;
      border: none;
      cursor: pointer;
    }
    :host ::ng-deep .users-table .mat-mdc-cell .role-select.is-customer .mat-mdc-select-trigger {
      background: var(--color-info-soft);
      color: var(--color-info);
    }
    :host ::ng-deep .users-table .mat-mdc-cell .role-select .mat-mdc-select-arrow { color: currentColor; }
    :host ::ng-deep .users-table .mat-mdc-cell .role-select .mat-mdc-select-value { color: inherit !important; }
    :host ::ng-deep .users-table .mat-mdc-cell .role-select .mat-mdc-select-placeholder { color: inherit !important; }

    /* ── Empty state ────────────────────────────────────────────────────── */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 56px 24px; text-align: center;
    }
    .empty-icon-wrap {
      width: 60px; height: 60px;
      border-radius: 16px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--admin-border);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
    }
    .empty-icon-wrap mat-icon {
      font-size: 28px !important; width: 28px !important; height: 28px !important;
      color: var(--text-placeholder);
    }
    .empty-title { font-size: 15px; font-weight: 600; color: var(--text-heading); margin: 0 0 6px; }
    .empty-sub   { font-size: 13px; color: var(--admin-muted); margin: 0; }

    /* ── Responsive ─────────────────────────────────────────────────────── */
    @media (max-width: 900px) {
      .kpi-strip { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .kpi-strip { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .kpi-card  { padding: 14px; gap: 10px; }
      .kpi-value { font-size: 20px; }
      .filter-toolbar { flex-wrap: wrap; }
    }
  `],
  template: `
    <div class="animate-fade-in">

      <!-- Cabeçalho -->
      <div class="admin-page-header">
        <div>
          <h2 class="admin-page-title">{{ 'ADMIN.USERS.TITLE' | translate }}</h2>
          <p class="admin-page-subtitle">
            {{ result()?.totalCount ?? 0 }} {{ 'ADMIN.USERS.TOTAL' | translate }}
          </p>
        </div>
      </div>

      <!-- KPI strip -->
      <div class="kpi-strip">
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--info"><mat-icon>people</mat-icon></span>
          <div>
            <p class="kpi-value">{{ result()?.totalCount ?? 0 }}</p>
            <p class="kpi-label">Total de usuários</p>
          </div>
        </div>
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--success"><mat-icon>check_circle</mat-icon></span>
          <div>
            <p class="kpi-value">{{ activeCount() }}</p>
            <p class="kpi-label">Ativos</p>
          </div>
        </div>
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--neutral"><mat-icon>block</mat-icon></span>
          <div>
            <p class="kpi-value">{{ inactiveCount() }}</p>
            <p class="kpi-label">Inativos</p>
          </div>
        </div>
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--violet"><mat-icon>admin_panel_settings</mat-icon></span>
          <div>
            <p class="kpi-value">{{ adminCount() }}</p>
            <p class="kpi-label">Administradores</p>
          </div>
        </div>
      </div>

      <!-- Filter toolbar -->
      <div class="ui-card filter-toolbar">
        <div class="filter-search-wrap" [class.filter-search-wrap--focused]="searchFocused">
          <mat-icon class="filter-search-icon">search</mat-icon>
          <input
            class="filter-search-input"
            type="text"
            [placeholder]="'ADMIN.USERS.SEARCH' | translate"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            (keyup.enter)="applyFilter()"
            (focus)="searchFocused = true"
            (blur)="onSearchBlur()"
          />
          @if (searchQuery()) {
            <button class="filter-search-clear" type="button" aria-label="Limpar busca" (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>
        @if (searchQuery()) {
          <button class="filter-clear-btn" type="button" (click)="clearFilters()">
            <mat-icon>close</mat-icon>
            {{ 'ADMIN.USERS.CLEAR' | translate }}
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <!-- Tabela -->
      @if (!loading()) {
        <div class="ui-table-wrap">
          <table mat-table [dataSource]="users()" class="users-table">

            <!-- Avatar + Nome -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.USERS.COLUMNS.NAME' | translate }}</th>
              <td mat-cell *matCellDef="let u">
                <div class="user-cell">
                  <div class="user-avatar">{{ initial(u.fullName) }}</div>
                  <div>
                    <p class="user-name">{{ u.fullName }}</p>
                    <p class="user-email">{{ u.email }}</p>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Papel -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.USERS.COLUMNS.ROLE' | translate }}</th>
              <td mat-cell *matCellDef="let u">
                <mat-select
                  class="role-select"
                  [class.is-customer]="u.role !== 'Admin'"
                  [value]="u.role"
                  (selectionChange)="updateRole(u, $event.value)">
                  <mat-option value="Admin">Admin</mat-option>
                  <mat-option value="Customer">Cliente</mat-option>
                </mat-select>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.USERS.COLUMNS.STATUS' | translate }}</th>
              <td mat-cell *matCellDef="let u">
                <span class="ui-badge" [class]="u.isActive ? 'ui-badge--success' : 'ui-badge--neutral'">
                  <span class="ui-badge-dot"></span>
                  {{ u.isActive ? ('ADMIN.USERS.ACTIVE' | translate) : ('ADMIN.USERS.INACTIVE' | translate) }}
                </span>
              </td>
            </ng-container>

            <!-- Pedidos -->
            <ng-container matColumnDef="orders">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.USERS.COLUMNS.ORDERS' | translate }}</th>
              <td mat-cell *matCellDef="let u">
                <span class="orders-badge" [class.orders-badge--has]="u.ordersCount > 0">
                  {{ u.ordersCount }}
                </span>
              </td>
            </ng-container>

            <!-- Cadastro -->
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.USERS.COLUMNS.CREATED_AT' | translate }}</th>
              <td mat-cell *matCellDef="let u">
                <span class="date-text">{{ u.createdAt | date:'dd/MM/yyyy':'':'pt-BR' }}</span>
              </td>
            </ng-container>

            <!-- Ativo (toggle) -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right">
                {{ 'ADMIN.USERS.COLUMNS.ACTIONS' | translate }}
              </th>
              <td mat-cell *matCellDef="let u" class="text-right">
                <mat-slide-toggle
                  [checked]="u.isActive"
                  color="primary"
                  [matTooltip]="(u.isActive ? 'ADMIN.USERS.DEACTIVATE' : 'ADMIN.USERS.ACTIVATE') | translate"
                  (change)="toggleActive(u)">
                </mat-slide-toggle>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          @if (users().length === 0) {
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <mat-icon>people</mat-icon>
              </div>
              <p class="empty-title">{{ 'ADMIN.USERS.EMPTY' | translate }}</p>
              <p class="empty-sub">Nenhum usuário encontrado com os filtros aplicados.</p>
            </div>
          }

          <mat-paginator
            [length]="result()?.totalCount ?? 0"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      }

    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly result = signal<PaginatedResult<AdminUserDto> | null>(null);
  readonly users = signal<AdminUserDto[]>([]);
  readonly searchQuery = signal('');

  searchFocused = false;
  page = 1;
  pageSize = 20;

  readonly displayedColumns = ['name', 'role', 'status', 'orders', 'createdAt', 'actions'];

  readonly activeCount   = computed(() => this.users().filter(u => u.isActive).length);
  readonly inactiveCount = computed(() => this.users().filter(u => !u.isActive).length);
  readonly adminCount    = computed(() => this.users().filter(u => u.role === 'Admin').length);

  ngOnInit(): void {
    this.load();
  }

  applyFilter(): void {
    this.page = 1;
    this.load();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.page = 1;
    this.load();
  }

  onSearchBlur(): void {
    this.searchFocused = false;
    if (this.searchQuery()) {
      this.applyFilter();
    }
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }

  initial(fullName: string): string {
    return fullName?.charAt(0)?.toUpperCase() ?? '?';
  }

  updateRole(user: AdminUserDto, role: string): void {
    this.adminService.updateUserRole(user.id, role).subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('ADMIN.USERS.ROLE_UPDATED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
        this.users.update(list => list.map(u => u.id === user.id ? { ...u, role } : u));
      },
      error: () => this.snackBar.open(
        this.translate.instant('ADMIN.USERS.ERROR_UPDATE_ROLE'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      ),
    });
  }

  toggleActive(user: AdminUserDto): void {
    this.adminService.toggleUserActive(user.id).subscribe({
      next: () => {
        const key = user.isActive ? 'ADMIN.USERS.DEACTIVATED' : 'ADMIN.USERS.ACTIVATED';
        this.snackBar.open(
          this.translate.instant(key),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
        this.users.update(list =>
          list.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u),
        );
      },
      error: () => this.snackBar.open(
        this.translate.instant('ADMIN.USERS.ERROR_TOGGLE_ACTIVE'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      ),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.adminService.getUsers({
      search: this.searchQuery() || undefined,
      page: this.page,
      pageSize: this.pageSize,
    }).subscribe({
      next: data => {
        this.result.set(data);
        this.users.set(data.items);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open(
          this.translate.instant('ADMIN.USERS.ERROR_LOAD'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
        this.loading.set(false);
      },
    });
  }
}
