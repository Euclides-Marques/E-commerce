import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../../../core/models/category.model';

// ── Dialog ────────────────────────────────────────────────────────────────────

interface CategoryDialogData {
  category: CategoryDto | null;
  flatCategories: CategoryDto[];
}

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDialogModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ (data.category ? 'ADMIN.CATEGORIES.EDIT_TITLE' : 'ADMIN.CATEGORIES.CREATE_TITLE') | translate }}
    </h2>

    <mat-dialog-content class="pt-2 space-y-3" style="min-width:480px">
      <form [formGroup]="form" class="space-y-3">

        <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'ADMIN.CATEGORIES.FORM.NAME' | translate }}</mat-label>
          <input matInput formControlName="name" />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <mat-error>{{ 'ADMIN.CATEGORIES.FORM.NAME_REQUIRED' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'ADMIN.CATEGORIES.FORM.DESCRIPTION' | translate }}</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'ADMIN.CATEGORIES.FORM.PARENT' | translate }}</mat-label>
          <mat-select formControlName="parentId">
            <mat-option [value]="null">{{ 'ADMIN.CATEGORIES.FORM.NO_PARENT' | translate }}</mat-option>
            @for (cat of availableParents(); track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'ADMIN.CATEGORIES.FORM.DISPLAY_ORDER' | translate }}</mat-label>
          <input matInput type="number" min="0" formControlName="displayOrder" />
        </mat-form-field>

        <div class="flex items-center gap-4 pt-1">
          <mat-slide-toggle formControlName="isActive" color="primary">
            {{ 'ADMIN.CATEGORIES.FORM.IS_ACTIVE' | translate }}
          </mat-slide-toggle>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="gap-2 pb-4 pr-4">
      <button mat-button (click)="dialogRef.close(false)">
        {{ 'ADMIN.CATEGORIES.FORM.CANCEL' | translate }}
      </button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="submit()">
        {{ (data.category ? 'ADMIN.CATEGORIES.FORM.SAVE' : 'ADMIN.CATEGORIES.FORM.CREATE') | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class CategoryFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CategoryFormDialogComponent>);
  readonly data: CategoryDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: [this.data.category?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    description: [this.data.category?.description ?? ''],
    parentId: [this.data.category?.parentId ?? null],
    displayOrder: [this.data.category?.displayOrder ?? 0, [Validators.required, Validators.min(0)]],
    isActive: [this.data.category?.isActive ?? true],
  });

  readonly availableParents = signal(
    this.data.flatCategories.filter(c => c.id !== this.data.category?.id)
  );

  submit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}

// ── List ──────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="animate-fade-in">
      <!-- Cabeçalho -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ 'ADMIN.CATEGORIES.TITLE' | translate }}</h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ flatItems().length }} {{ 'ADMIN.CATEGORIES.TOTAL' | translate }}
          </p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          {{ 'ADMIN.CATEGORIES.NEW' | translate }}
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      }

      <!-- Tabela -->
      @if (!loading()) {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table mat-table [dataSource]="flatItems()" class="w-full">

            <!-- Nome -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.CATEGORIES.COLUMNS.NAME' | translate }}</th>
              <td mat-cell *matCellDef="let c">
                <div class="flex items-center gap-2">
                  @if (c.parentId) {
                    <span class="text-gray-300 text-xs pl-3">└</span>
                  }
                  <span class="font-medium text-gray-800">{{ c.name }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Categoria pai -->
            <ng-container matColumnDef="parent">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.CATEGORIES.COLUMNS.PARENT' | translate }}</th>
              <td mat-cell *matCellDef="let c">
                <span class="text-sm text-gray-500">
                  {{ parentName(c.parentId) || '—' }}
                </span>
              </td>
            </ng-container>

            <!-- Ordem -->
            <ng-container matColumnDef="order">
              <th mat-header-cell *matHeaderCellDef class="w-24 text-center">{{ 'ADMIN.CATEGORIES.COLUMNS.ORDER' | translate }}</th>
              <td mat-cell *matCellDef="let c" class="text-center text-sm text-gray-600">
                {{ c.displayOrder }}
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="w-28">{{ 'ADMIN.CATEGORIES.COLUMNS.STATUS' | translate }}</th>
              <td mat-cell *matCellDef="let c">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  [class]="c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                  {{ c.isActive ? ('ADMIN.CATEGORIES.ACTIVE' | translate) : ('ADMIN.CATEGORIES.INACTIVE' | translate) }}
                </span>
              </td>
            </ng-container>

            <!-- Ações -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'ADMIN.CATEGORIES.COLUMNS.ACTIONS' | translate }}</th>
              <td mat-cell *matCellDef="let c" class="text-right">
                <button mat-icon-button color="primary" [matTooltip]="'ADMIN.CATEGORIES.EDIT' | translate"
                        (click)="openEditDialog(c)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" [matTooltip]="'ADMIN.CATEGORIES.DELETE' | translate"
                        (click)="confirmDelete(c)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="hover:bg-gray-50 transition-colors"></tr>
          </table>

          @if (flatItems().length === 0) {
            <div class="text-center py-16 text-gray-400">
              <mat-icon class="text-5xl mb-3">category</mat-icon>
              <p>{{ 'ADMIN.CATEGORIES.EMPTY' | translate }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AdminCategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly flatItems = signal<CategoryDto[]>([]);

  readonly displayedColumns = ['name', 'parent', 'order', 'status', 'actions'];

  ngOnInit(): void {
    this.loadCategories();
  }

  parentName(parentId?: string): string {
    if (!parentId) return '';
    return this.flatItems().find(c => c.id === parentId)?.name ?? '';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, {
      width: '560px',
      data: { category: null, flatCategories: this.flatItems() } satisfies CategoryDialogData,
    });
    ref.afterClosed().subscribe((value: Partial<CreateCategoryDto> | false) => {
      if (!value) return;
      this.categoryService.createCategory(value as CreateCategoryDto).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('ADMIN.CATEGORIES.CREATED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
          this.loadCategories();
        },
        error: () => this.snackBar.open(this.translate.instant('ADMIN.CATEGORIES.ERROR_CREATE'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
      });
    });
  }

  openEditDialog(category: CategoryDto): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, {
      width: '560px',
      data: { category, flatCategories: this.flatItems() } satisfies CategoryDialogData,
    });
    ref.afterClosed().subscribe((value: Partial<UpdateCategoryDto> | false) => {
      if (!value) return;
      const dto: UpdateCategoryDto = { ...(value as UpdateCategoryDto), id: category.id };
      this.categoryService.updateCategory(category.id, dto).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('ADMIN.CATEGORIES.UPDATED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
          this.loadCategories();
        },
        error: () => this.snackBar.open(this.translate.instant('ADMIN.CATEGORIES.ERROR_UPDATE'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 }),
      });
    });
  }

  confirmDelete(category: CategoryDto): void {
    if (!confirm(this.translate.instant('ADMIN.CATEGORIES.CONFIRM_DELETE', { name: category.name }))) return;

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('ADMIN.CATEGORIES.DELETED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.loadCategories();
      },
      error: () => this.snackBar.open(this.translate.instant('ADMIN.CATEGORIES.ERROR_DELETE'), this.translate.instant('COMMON.CLOSE'), { duration: 5000 }),
    });
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getCategories().subscribe({
      next: categories => {
        this.flatItems.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open(this.translate.instant('ADMIN.CATEGORIES.ERROR_LOAD'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        this.loading.set(false);
      },
    });
  }
}
