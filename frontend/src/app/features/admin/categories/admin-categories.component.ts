import { Component, inject, signal, computed, OnInit, ViewEncapsulation } from '@angular/core';
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
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

// ── Dialog ────────────────────────────────────────────────────────────────────

interface CategoryDialogData {
  category: CategoryDto | null;
  flatCategories: CategoryDto[];
}

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDialogModule,
    TranslatePipe,
  ],
  styles: [`
    /* ── Category Form Dialog — prefixo cfd__ ─────────────────────── */

    .cfd {
      display: flex;
      flex-direction: column;
      background: var(--admin-surface, #fff);
      overflow: hidden;
    }

    /* Header */
    .cfd__header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--admin-border, #E5E7EB);
      flex-shrink: 0;
    }

    .cfd__header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--admin-accent-soft, #FFF1EC);
      flex-shrink: 0;
      margin-top: 1px;
    }
    .cfd__header-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--admin-accent, #F04E23);
    }
    .cfd__header-icon--edit { background: #EFF6FF; }
    .cfd__header-icon--edit mat-icon { color: #2563EB; }

    .cfd__header-copy { flex: 1; min-width: 0; }

    .cfd__title {
      margin: 0 0 2px;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-heading, #111827);
      letter-spacing: -0.3px;
      line-height: 1.3;
    }

    .cfd__subtitle {
      margin: 0;
      font-size: 12.5px;
      color: var(--admin-muted, #6B7280);
      line-height: 1.4;
    }

    .cfd__close.mat-mdc-icon-button {
      width: 32px !important;
      height: 32px !important;
      border-radius: 8px !important;
      color: var(--admin-muted, #6B7280) !important;
      margin-top: -2px;
      margin-right: -8px;
      flex-shrink: 0;
    }
    .cfd__close.mat-mdc-icon-button:hover {
      background: var(--bg-surface-soft, #F8FAFC) !important;
      color: var(--text-heading, #111827) !important;
    }
    .cfd__close .mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* Scrollable body */
    .cfd__body.mat-mdc-dialog-content {
      padding: 0 !important;
      margin: 0 !important;
      max-height: 60vh !important;
      overflow-y: auto !important;
      flex: 1;
    }

    /* Sections */
    .cfd__section { padding: 18px 24px 20px; }
    .cfd__section--last { padding-bottom: 22px; }

    .cfd__section-label {
      display: block;
      margin: 0 0 14px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--admin-muted, #6B7280);
    }

    .cfd__divider {
      border: none;
      border-top: 1px solid var(--admin-border, #E5E7EB);
      margin: 0;
    }

    /* 2-column grid */
    .cfd__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Form fields */
    .cfd__field { width: 100%; display: block; }

    .cfd__field-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: var(--admin-muted, #6B7280) !important;
      margin-right: 4px;
    }

    /* Toggle card */
    .cfd__toggle-card {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 13px 14px;
      border: 1.5px solid var(--admin-border, #E5E7EB);
      border-radius: 12px;
      background: var(--admin-surface-2, #F9FAFB);
      transition: all 200ms ease;
    }
    .cfd__toggle-card--on {
      border-color: rgba(240, 78, 35, 0.28);
      background: var(--admin-accent-soft, #FFF1EC);
    }

    .cfd__toggle-card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--bg-page, #F7F8FA);
      flex-shrink: 0;
      transition: all 200ms ease;
    }
    .cfd__toggle-card-icon mat-icon {
      font-size: 17px !important;
      width: 17px !important;
      height: 17px !important;
      color: var(--admin-muted, #6B7280);
      transition: color 200ms ease;
    }
    .cfd__toggle-card-icon--on { background: rgba(240, 78, 35, 0.12); }
    .cfd__toggle-card-icon--on mat-icon { color: var(--admin-accent, #F04E23); }

    .cfd__toggle-card-copy {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }
    .cfd__toggle-card-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-heading, #111827);
      line-height: 1.3;
    }
    .cfd__toggle-card-hint {
      font-size: 11px;
      color: var(--admin-muted, #6B7280);
      line-height: 1.3;
    }

    /* Footer */
    .cfd__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 24px;
      border-top: 1px solid var(--admin-border, #E5E7EB);
      background: var(--admin-surface, #fff);
      flex-shrink: 0;
    }

    /* Buttons */
    .cfd__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 38px;
      padding: 0 18px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 600;
      letter-spacing: -0.1px;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: all 140ms ease;
    }
    .cfd__btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .cfd__btn-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .cfd__btn--ghost {
      background: transparent;
      color: var(--text-secondary, #64748B);
      border: 1.5px solid var(--admin-border, #E5E7EB);
    }
    .cfd__btn--ghost:hover:not(:disabled) {
      background: var(--bg-surface-soft, #F8FAFC);
      border-color: var(--border-strong, #CBD5E1);
      color: var(--text-heading, #111827);
    }

    .cfd__btn--primary {
      background: var(--admin-accent, #F04E23);
      color: #fff;
      box-shadow: 0 2px 10px rgba(240, 78, 35, 0.24);
    }
    .cfd__btn--primary:hover:not(:disabled) {
      background: var(--brand-hover, #D93A10);
      box-shadow: 0 4px 16px rgba(240, 78, 35, 0.32);
      transform: translateY(-1px);
    }
    .cfd__btn--primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(240, 78, 35, 0.18);
    }

    /* Responsive */
    @media (max-width: 540px) {
      .cfd__row { grid-template-columns: 1fr; }
      .cfd__section { padding: 16px; }
      .cfd__header { padding: 16px; }
      .cfd__footer { padding: 12px 16px; }
      .cfd__body.mat-mdc-dialog-content { max-height: 72vh !important; }
    }
  `],
  template: `
    <div class="cfd">

      <!-- Header -->
      <header class="cfd__header">
        <div class="cfd__header-icon" [class.cfd__header-icon--edit]="!!data.category">
          <mat-icon>{{ data.category ? 'edit' : 'create_new_folder' }}</mat-icon>
        </div>
        <div class="cfd__header-copy">
          <h2 class="cfd__title">
            {{ (data.category ? 'ADMIN.CATEGORIES.EDIT_TITLE' : 'ADMIN.CATEGORIES.CREATE_TITLE') | translate }}
          </h2>
          <p class="cfd__subtitle">
            {{ data.category ? 'Edite as informações da categoria' : 'Preencha os dados para criar uma nova categoria' }}
          </p>
        </div>
        <button class="cfd__close" mat-icon-button mat-dialog-close aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <!-- Corpo com scroll -->
      <mat-dialog-content class="cfd__body">
        <form [formGroup]="form" autocomplete="off">

          <!-- Identificação -->
          <section class="cfd__section">
            <span class="cfd__section-label">Identificação</span>

            <mat-form-field class="cfd__field" appearance="outline">
              <mat-label>{{ 'ADMIN.CATEGORIES.FORM.NAME' | translate }}</mat-label>
              <mat-icon matPrefix class="cfd__field-icon">label</mat-icon>
              <input matInput formControlName="name" placeholder="Ex: Eletrônicos, Moda…" />
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <mat-error>{{ 'ADMIN.CATEGORIES.FORM.NAME_REQUIRED' | translate }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="cfd__field" appearance="outline">
              <mat-label>{{ 'ADMIN.CATEGORIES.FORM.DESCRIPTION' | translate }}</mat-label>
              <textarea matInput formControlName="description" rows="3"
                placeholder="Descreva brevemente esta categoria…"></textarea>
            </mat-form-field>
          </section>

          <hr class="cfd__divider" />

          <!-- Organização -->
          <section class="cfd__section">
            <span class="cfd__section-label">Organização</span>
            <div class="cfd__row">
              <mat-form-field class="cfd__field" appearance="outline">
                <mat-label>{{ 'ADMIN.CATEGORIES.FORM.PARENT' | translate }}</mat-label>
                <mat-icon matPrefix class="cfd__field-icon">account_tree</mat-icon>
                <mat-select formControlName="parentId">
                  <mat-option [value]="null">{{ 'ADMIN.CATEGORIES.FORM.NO_PARENT' | translate }}</mat-option>
                  @for (cat of availableParents(); track cat.id) {
                    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="cfd__field" appearance="outline">
                <mat-label>{{ 'ADMIN.CATEGORIES.FORM.DISPLAY_ORDER' | translate }}</mat-label>
                <mat-icon matPrefix class="cfd__field-icon">sort</mat-icon>
                <input matInput type="number" min="0" formControlName="displayOrder" />
              </mat-form-field>
            </div>
          </section>

          <hr class="cfd__divider" />

          <!-- Visibilidade -->
          <section class="cfd__section cfd__section--last">
            <span class="cfd__section-label">Visibilidade</span>

            <div class="cfd__toggle-card" [class.cfd__toggle-card--on]="form.get('isActive')?.value">
              <div class="cfd__toggle-card-icon" [class.cfd__toggle-card-icon--on]="form.get('isActive')?.value">
                <mat-icon>{{ form.get('isActive')?.value ? 'visibility' : 'visibility_off' }}</mat-icon>
              </div>
              <div class="cfd__toggle-card-copy">
                <span class="cfd__toggle-card-title">{{ 'ADMIN.CATEGORIES.FORM.IS_ACTIVE' | translate }}</span>
                <span class="cfd__toggle-card-hint">Categoria visível para os clientes na loja</span>
              </div>
              <mat-slide-toggle formControlName="isActive" color="primary"></mat-slide-toggle>
            </div>
          </section>

        </form>
      </mat-dialog-content>

      <!-- Rodapé -->
      <footer class="cfd__footer">
        <button class="cfd__btn cfd__btn--ghost" mat-dialog-close type="button">
          {{ 'ADMIN.CATEGORIES.FORM.CANCEL' | translate }}
        </button>
        <button class="cfd__btn cfd__btn--primary" type="button" [disabled]="form.invalid" (click)="submit()">
          <mat-icon class="cfd__btn-icon">{{ data.category ? 'save' : 'add_circle_outline' }}</mat-icon>
          {{ (data.category ? 'ADMIN.CATEGORIES.FORM.SAVE' : 'ADMIN.CATEGORIES.FORM.CREATE') | translate }}
        </button>
      </footer>

    </div>
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
  styles: [`
    /* ── KPI strip ─────────────────────────────────────────────────── */
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px 20px;
    }
    .kpi-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .kpi-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .kpi-icon--info    { background: var(--color-info-soft);    color: var(--color-info);    }
    .kpi-icon--success { background: var(--color-success-soft); color: var(--color-success); }
    .kpi-icon--neutral { background: var(--bg-surface-soft);    color: var(--text-secondary); }
    .kpi-value { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-heading); line-height: 1.1; }
    .kpi-label { margin: 4px 0 0; font-size: 12px; color: var(--admin-muted); }

    /* ── Search toolbar ────────────────────────────────────────────── */
    .search-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    .search-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-surface-soft);
      border-radius: 8px;
      padding: 0 14px;
    }
    .search-icon { color: var(--admin-muted); font-size: 18px !important; width: 18px !important; height: 18px !important; flex-shrink: 0; }
    .search-input {
      flex: 1;
      background: none;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      padding: 10px 0;
      font-size: 14px;
      color: var(--text-primary);
      font-family: var(--font-sans);
    }
    .search-input:focus,
    .search-input:focus-visible {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    .search-input::placeholder { color: var(--text-placeholder); }
    .search-clear {
      display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; padding: 2px;
      color: var(--admin-muted); border-radius: 4px;
      transition: color 150ms ease, background 150ms ease;
    }
    .search-clear:hover { color: var(--text-primary); background: var(--admin-border); }
    .search-clear mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }

    /* ── Category name cell ────────────────────────────────────────── */
    .cat-name { font-size: 14px; font-weight: 600; color: var(--text-heading); }
    .cat-sub-indent {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cat-sub-line {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--admin-muted);
      flex-shrink: 0;
    }
    .cat-sub-line mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
    .cat-parent-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--admin-border);
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .cat-parent-chip mat-icon { font-size: 12px !important; width: 12px !important; height: 12px !important; }

    /* ── Order badge ───────────────────────────────────────────────── */
    .order-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 24px;
      padding: 0 8px;
      border-radius: 6px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--admin-border);
      font-size: 12px;
      font-weight: 700;
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
    }

    /* ── Row action buttons ────────────────────────────────────────── */
    .row-actions { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
    .action-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 6px; border: none;
      background: transparent; cursor: pointer;
      color: var(--admin-muted);
      transition: background var(--motion-fast), color var(--motion-fast);
    }
    .action-btn:hover                 { background: var(--bg-surface-soft); color: var(--text-heading);    }
    .action-btn--primary:hover        { background: var(--color-info-soft);  color: var(--color-info);      }
    .action-btn--danger:hover         { background: var(--color-danger-soft); color: var(--color-danger);   }
    .action-btn mat-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; }

    /* ── Empty state ───────────────────────────────────────────────── */
    .empty-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 24px;
      text-align: center;
    }
    .empty-icon {
      display: flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border-radius: 16px;
      background: var(--bg-surface-soft); margin: 0 auto 16px;
    }
    .empty-icon mat-icon { font-size: 28px !important; width: 28px !important; height: 28px !important; color: var(--text-placeholder); }
    .empty-title { font-size: 15px; font-weight: 600; color: var(--text-heading); margin: 0 0 6px; }
    .empty-sub   { font-size: 13px; color: var(--admin-muted); margin: 0 0 20px; }

    /* ── Material table overrides ──────────────────────────────────── */
    :host ::ng-deep .categories-table { background: transparent; width: 100%; }
    :host ::ng-deep .categories-table .mat-mdc-header-row {
      background: var(--bg-surface-soft);
      border-bottom: 1px solid var(--admin-border);
    }
    :host ::ng-deep .categories-table .mat-mdc-header-cell {
      color: var(--text-secondary) !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      letter-spacing: 0.06em !important;
      text-transform: uppercase;
      border-bottom: none !important;
    }
    :host ::ng-deep .categories-table .mat-mdc-cell {
      border-bottom: 1px solid var(--admin-border) !important;
      color: var(--text-primary);
      font-size: 14px;
    }
    :host ::ng-deep .categories-table .mat-mdc-row:last-child .mat-mdc-cell {
      border-bottom: none !important;
    }
    :host ::ng-deep .categories-table .mat-mdc-row {
      transition: background var(--motion-fast);
    }
    :host ::ng-deep .categories-table .mat-mdc-row:hover .mat-mdc-cell {
      background: var(--bg-surface-soft);
    }

    /* ── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 700px) {
      .kpi-strip { grid-template-columns: 1fr 1fr; }
      .kpi-strip .kpi-card:last-child { display: none; }
    }
    @media (max-width: 480px) {
      .kpi-strip { grid-template-columns: 1fr; gap: 10px; }
      .kpi-strip .kpi-card:last-child { display: flex; }
      .kpi-card  { padding: 14px; gap: 10px; }
      .kpi-value { font-size: 20px; }
    }
  `],
  template: `
    <div class="animate-fade-in">

      <!-- Cabeçalho -->
      <div class="admin-page-header">
        <div>
          <h2 class="admin-page-title">{{ 'ADMIN.CATEGORIES.TITLE' | translate }}</h2>
          <p class="admin-page-subtitle">
            {{ flatItems().length }} {{ 'ADMIN.CATEGORIES.TOTAL' | translate }}
          </p>
        </div>
        <button class="ui-button ui-button--primary" (click)="openCreateDialog()">
          <mat-icon style="font-size:18px;width:18px;height:18px;line-height:1">add</mat-icon>
          {{ 'ADMIN.CATEGORIES.NEW' | translate }}
        </button>
      </div>

      <!-- KPI strip -->
      <div class="kpi-strip">
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--info"><mat-icon>category</mat-icon></span>
          <div>
            <p class="kpi-value">{{ flatItems().length }}</p>
            <p class="kpi-label">Total de categorias</p>
          </div>
        </div>
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--success"><mat-icon>check_circle</mat-icon></span>
          <div>
            <p class="kpi-value">{{ activeCount() }}</p>
            <p class="kpi-label">Ativas</p>
          </div>
        </div>
        <div class="ui-card kpi-card">
          <span class="kpi-icon kpi-icon--neutral"><mat-icon>account_tree</mat-icon></span>
          <div>
            <p class="kpi-value">{{ subCount() }}</p>
            <p class="kpi-label">Subcategorias</p>
          </div>
        </div>
      </div>

      <!-- Search toolbar -->
      <div class="ui-card search-toolbar">
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            class="search-input"
            type="text"
            placeholder="Buscar por nome de categoria…"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
          />
          @if (searchQuery()) {
            <button class="search-clear" type="button" aria-label="Limpar busca"
                    (click)="searchQuery.set('')">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>
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
          <table mat-table [dataSource]="filteredItems()" class="categories-table">

            <!-- Nome -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.CATEGORIES.COLUMNS.NAME' | translate }}</th>
              <td mat-cell *matCellDef="let c">
                @if (c.parentId) {
                  <div class="cat-sub-indent">
                    <span class="cat-sub-line">
                      <mat-icon>subdirectory_arrow_right</mat-icon>
                    </span>
                    <span class="cat-name">{{ c.name }}</span>
                  </div>
                } @else {
                  <span class="cat-name">{{ c.name }}</span>
                }
              </td>
            </ng-container>

            <!-- Categoria pai -->
            <ng-container matColumnDef="parent">
              <th mat-header-cell *matHeaderCellDef>{{ 'ADMIN.CATEGORIES.COLUMNS.PARENT' | translate }}</th>
              <td mat-cell *matCellDef="let c">
                @if (parentName(c.parentId)) {
                  <span class="cat-parent-chip">
                    <mat-icon>folder</mat-icon>
                    {{ parentName(c.parentId) }}
                  </span>
                } @else {
                  <span style="color:var(--text-placeholder);font-size:13px">—</span>
                }
              </td>
            </ng-container>

            <!-- Ordem -->
            <ng-container matColumnDef="order">
              <th mat-header-cell *matHeaderCellDef style="width:96px;text-align:center">{{ 'ADMIN.CATEGORIES.COLUMNS.ORDER' | translate }}</th>
              <td mat-cell *matCellDef="let c" style="text-align:center">
                <span class="order-badge">{{ c.displayOrder }}</span>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef style="width:112px">{{ 'ADMIN.CATEGORIES.COLUMNS.STATUS' | translate }}</th>
              <td mat-cell *matCellDef="let c">
                <span class="ui-badge"
                      [class.ui-badge--success]="c.isActive"
                      [class.ui-badge--neutral]="!c.isActive">
                  <span class="ui-badge-dot"></span>
                  {{ c.isActive ? ('ADMIN.CATEGORIES.ACTIVE' | translate) : ('ADMIN.CATEGORIES.INACTIVE' | translate) }}
                </span>
              </td>
            </ng-container>

            <!-- Ações -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef style="width:80px;text-align:right">{{ 'ADMIN.CATEGORIES.COLUMNS.ACTIONS' | translate }}</th>
              <td mat-cell *matCellDef="let c">
                <div class="row-actions">
                  <button class="action-btn action-btn--primary"
                          [matTooltip]="'ADMIN.CATEGORIES.EDIT' | translate"
                          (click)="openEditDialog(c)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="action-btn action-btn--danger"
                          [matTooltip]="'ADMIN.CATEGORIES.DELETE' | translate"
                          (click)="confirmDelete(c)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          </table>

          @if (filteredItems().length === 0) {
            <div class="empty-wrap">
              <div class="empty-icon">
                <mat-icon>category</mat-icon>
              </div>
              @if (searchQuery()) {
                <p class="empty-title">Nenhum resultado encontrado</p>
                <p class="empty-sub">Tente buscar com outro termo.</p>
                <button class="ui-button ui-button--ghost" (click)="searchQuery.set('')">
                  Limpar busca
                </button>
              } @else {
                <p class="empty-title">{{ 'ADMIN.CATEGORIES.EMPTY' | translate }}</p>
                <p class="empty-sub">Crie a primeira categoria para organizar seus produtos.</p>
              }
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
  readonly searchQuery = signal('');

  readonly activeCount = computed(() => this.flatItems().filter(c => c.isActive).length);
  readonly subCount    = computed(() => this.flatItems().filter(c => !!c.parentId).length);

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.flatItems();
    return this.flatItems().filter(c => c.name.toLowerCase().includes(q));
  });

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
      panelClass: 'pfd-panel',
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
      panelClass: 'pfd-panel',
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
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '460px',
      panelClass: 'pfd-panel',
      data: {
        title: this.translate.instant('ADMIN.CATEGORIES.DELETE_TITLE'),
        message: this.translate.instant('ADMIN.CATEGORIES.CONFIRM_DELETE_MSG'),
        itemName: category.name,
      } satisfies ConfirmDialogData,
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('ADMIN.CATEGORIES.DELETED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
          this.loadCategories();
        },
        error: () => this.snackBar.open(this.translate.instant('ADMIN.CATEGORIES.ERROR_DELETE'), this.translate.instant('COMMON.CLOSE'), { duration: 5000 }),
      });
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
