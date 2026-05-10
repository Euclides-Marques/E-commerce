import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    TranslatePipe,
  ],
  template: `
    <div class="animate-fade-in">

      <!-- Cabeçalho -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ 'ADMIN.USERS.TITLE' | translate }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ result()?.totalCount ?? 0 }} {{ 'ADMIN.USERS.TOTAL' | translate }}</p>
        </div>
      </div>

      <!-- Filtro de busca -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-3 items-end">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-72">
          <mat-label>{{ 'ADMIN.USERS.SEARCH' | translate }}</mat-label>
          <input matInput [formControl]="searchCtrl" (keyup.enter)="applyFilter()" />
          <mat-icon matSuffix class="cursor-pointer" (click)="applyFilter()">search</mat-icon>
        </mat-form-field>
        <button mat-stroked-button (click)="clearFilters()">
          <mat-icon>clear</mat-icon>
          {{ 'ADMIN.USERS.CLEAR' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      }

      @if (!loading()) {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table mat-table [dataSource]="users()" class="w-full">

            <!-- Avatar + Nome -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.USERS.COLUMNS.NAME' | translate }}</th>
              <td mat-cell *matCellDef="let u">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <span class="text-sm font-bold text-orange-600">{{ initial(u.fullName) }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ u.fullName }}</p>
                    <p class="text-xs text-gray-400">{{ u.email }}</p>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Papel -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.USERS.COLUMNS.ROLE' | translate }}</th>
              <td mat-cell *matCellDef="let u">
                <mat-select
                  [value]="u.role"
                  class="text-sm"
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
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  [class]="u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                  {{ u.isActive ? ('ADMIN.USERS.ACTIVE' | translate) : ('ADMIN.USERS.INACTIVE' | translate) }}
                </span>
              </td>
            </ng-container>

            <!-- Pedidos -->
            <ng-container matColumnDef="orders">
              <th mat-header-cell *matHeaderCellDef class="text-center">{{ 'ADMIN.USERS.COLUMNS.ORDERS' | translate }}</th>
              <td mat-cell *matCellDef="let u" class="text-center text-sm text-gray-600">{{ u.ordersCount }}</td>
            </ng-container>

            <!-- Cadastro -->
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.USERS.COLUMNS.CREATED_AT' | translate }}</th>
              <td mat-cell *matCellDef="let u" class="text-sm text-gray-500">
                {{ u.createdAt | date:'dd/MM/yyyy':'':'pt-BR' }}
              </td>
            </ng-container>

            <!-- Ações -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'ADMIN.USERS.COLUMNS.ACTIONS' | translate }}</th>
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
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="hover:bg-gray-50 transition-colors"></tr>
          </table>

          @if (users().length === 0) {
            <div class="text-center py-16 text-gray-400">
              <mat-icon class="text-5xl mb-3">people</mat-icon>
              <p>{{ 'ADMIN.USERS.EMPTY' | translate }}</p>
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
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly result = signal<PaginatedResult<AdminUserDto> | null>(null);
  readonly users = signal<AdminUserDto[]>([]);

  readonly searchCtrl = this.fb.control('');

  page = 1;
  pageSize = 20;

  readonly displayedColumns = ['name', 'role', 'status', 'orders', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  applyFilter(): void {
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.searchCtrl.reset('');
    this.page = 1;
    this.load();
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
        this.snackBar.open(this.translate.instant('ADMIN.USERS.ROLE_UPDATED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.users.update(list => list.map(u => u.id === user.id ? { ...u, role } : u));
      },
      error: () => this.snackBar.open(this.translate.instant('ADMIN.USERS.ERROR_UPDATE_ROLE'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
    });
  }

  toggleActive(user: AdminUserDto): void {
    this.adminService.toggleUserActive(user.id).subscribe({
      next: () => {
        const key = user.isActive ? 'ADMIN.USERS.DEACTIVATED' : 'ADMIN.USERS.ACTIVATED';
        this.snackBar.open(this.translate.instant(key), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.users.update(list =>
          list.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u)
        );
      },
      error: () => this.snackBar.open(this.translate.instant('ADMIN.USERS.ERROR_TOGGLE_ACTIVE'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.adminService.getUsers({
      search: this.searchCtrl.value ?? undefined,
      page: this.page,
      pageSize: this.pageSize,
    }).subscribe({
      next: data => {
        this.result.set(data);
        this.users.set(data.items);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open(this.translate.instant('ADMIN.USERS.ERROR_LOAD'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.loading.set(false);
      },
    });
  }
}
