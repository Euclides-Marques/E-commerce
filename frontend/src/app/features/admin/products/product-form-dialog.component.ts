import { Component, inject, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { ProductDto, CreateProductDto, UpdateProductDto } from '../../../core/models/product.model';
import { CategoryDto } from '../../../core/models/category.model';

export interface ProductFormDialogData {
  product: ProductDto | null;
  categories: CategoryDto[];
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    TranslatePipe,
  ],
  styles: [`
    /* ── Product Form Dialog — todas as classes prefixadas com pfd__ ── */

    .pfd {
      display: flex;
      flex-direction: column;
      background: var(--admin-surface, #fff);
      overflow: hidden;
    }

    /* Header */
    .pfd__header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--admin-border, #E5E7EB);
      flex-shrink: 0;
    }

    .pfd__header-icon {
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
    .pfd__header-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--admin-accent, #F04E23);
    }
    .pfd__header-icon--edit {
      background: #EFF6FF;
    }
    .pfd__header-icon--edit mat-icon {
      color: #2563EB;
    }

    .pfd__header-copy { flex: 1; min-width: 0; }

    .pfd__title {
      margin: 0 0 2px;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-heading, #111827);
      letter-spacing: -0.3px;
      line-height: 1.3;
    }

    .pfd__subtitle {
      margin: 0;
      font-size: 12.5px;
      color: var(--admin-muted, #6B7280);
      line-height: 1.4;
    }

    .pfd__close.mat-mdc-icon-button {
      width: 32px !important;
      height: 32px !important;
      border-radius: 8px !important;
      color: var(--admin-muted, #6B7280) !important;
      margin-top: -2px;
      margin-right: -8px;
      flex-shrink: 0;
    }
    .pfd__close.mat-mdc-icon-button:hover {
      background: var(--bg-surface-soft, #F8FAFC) !important;
      color: var(--text-heading, #111827) !important;
    }
    .pfd__close .mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* Scrollable body */
    .pfd__body.mat-mdc-dialog-content {
      padding: 0 !important;
      margin: 0 !important;
      max-height: 60vh !important;
      overflow-y: auto !important;
      flex: 1;
    }

    /* Sections */
    .pfd__section {
      padding: 18px 24px 20px;
    }
    .pfd__section--last { padding-bottom: 22px; }

    .pfd__section-label {
      display: block;
      margin: 0 0 14px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--admin-muted, #6B7280);
    }

    .pfd__divider {
      border: none;
      border-top: 1px solid var(--admin-border, #E5E7EB);
      margin: 0;
    }

    /* 2-column grid */
    .pfd__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Form fields */
    .pfd__field { width: 100%; display: block; }

    .pfd__field-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: var(--admin-muted, #6B7280) !important;
      margin-right: 4px;
    }

    .pfd__text-prefix {
      font-size: 13px;
      font-weight: 600;
      color: var(--admin-muted, #6B7280);
    }

    .pfd__text-suffix {
      font-size: 13px;
      color: var(--admin-muted, #6B7280);
    }

    /* Toggle cards */
    .pfd__toggles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .pfd__toggle-card {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 13px 14px;
      border: 1.5px solid var(--admin-border, #E5E7EB);
      border-radius: 12px;
      background: var(--admin-surface-2, #F9FAFB);
      transition: all 200ms ease;
    }
    .pfd__toggle-card--on {
      border-color: rgba(240, 78, 35, 0.28);
      background: var(--admin-accent-soft, #FFF1EC);
    }

    .pfd__toggle-card-icon {
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
    .pfd__toggle-card-icon mat-icon {
      font-size: 17px !important;
      width: 17px !important;
      height: 17px !important;
      color: var(--admin-muted, #6B7280);
      transition: color 200ms ease;
    }
    .pfd__toggle-card-icon--on {
      background: rgba(240, 78, 35, 0.12);
    }
    .pfd__toggle-card-icon--on mat-icon {
      color: var(--admin-accent, #F04E23);
    }

    .pfd__toggle-card-copy {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }
    .pfd__toggle-card-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-heading, #111827);
      line-height: 1.3;
    }
    .pfd__toggle-card-hint {
      font-size: 11px;
      color: var(--admin-muted, #6B7280);
      line-height: 1.3;
    }

    /* Footer */
    .pfd__footer {
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
    .pfd__btn {
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
    .pfd__btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .pfd__btn-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .pfd__btn--ghost {
      background: transparent;
      color: var(--text-secondary, #64748B);
      border: 1.5px solid var(--admin-border, #E5E7EB);
    }
    .pfd__btn--ghost:hover:not(:disabled) {
      background: var(--bg-surface-soft, #F8FAFC);
      border-color: var(--border-strong, #CBD5E1);
      color: var(--text-heading, #111827);
    }

    .pfd__btn--primary {
      background: var(--admin-accent, #F04E23);
      color: #fff;
      box-shadow: 0 2px 10px rgba(240, 78, 35, 0.24);
    }
    .pfd__btn--primary:hover:not(:disabled) {
      background: var(--brand-hover, #D93A10);
      box-shadow: 0 4px 16px rgba(240, 78, 35, 0.32);
      transform: translateY(-1px);
    }
    .pfd__btn--primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(240, 78, 35, 0.18);
    }

    .pfd__spinner { display: inline-flex; }
    .pfd__spinner circle { stroke: #fff; }

    /* Responsive */
    @media (max-width: 540px) {
      .pfd__row, .pfd__toggles { grid-template-columns: 1fr; }
      .pfd__section { padding: 16px; }
      .pfd__header { padding: 16px; }
      .pfd__footer { padding: 12px 16px; }
      .pfd__body.mat-mdc-dialog-content { max-height: 72vh !important; }
    }
  `],
  template: `
    <div class="pfd">

      <!-- Header -->
      <header class="pfd__header">
        <div class="pfd__header-icon" [class.pfd__header-icon--edit]="isEdit">
          <mat-icon>{{ isEdit ? 'edit' : 'inventory_2' }}</mat-icon>
        </div>
        <div class="pfd__header-copy">
          <h2 class="pfd__title">
            {{ isEdit ? ('ADMIN.PRODUCTS.EDIT_TITLE' | translate) : ('ADMIN.PRODUCTS.CREATE_TITLE' | translate) }}
          </h2>
          <p class="pfd__subtitle">
            {{ isEdit ? 'Edite as informações do produto abaixo' : 'Preencha os dados para cadastrar um novo produto' }}
          </p>
        </div>
        <button class="pfd__close" mat-icon-button mat-dialog-close aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <!-- Corpo com scroll -->
      <mat-dialog-content class="pfd__body">
        <form [formGroup]="form" autocomplete="off">

          <!-- Informações básicas -->
          <section class="pfd__section">
            <span class="pfd__section-label">Informações básicas</span>

            <mat-form-field class="pfd__field" appearance="outline">
              <mat-label>{{ 'ADMIN.PRODUCTS.FORM.NAME' | translate }}</mat-label>
              <mat-icon matPrefix class="pfd__field-icon">label_outline</mat-icon>
              <input matInput formControlName="name" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>{{ 'ADMIN.PRODUCTS.FORM.NAME_REQUIRED' | translate }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="pfd__field" appearance="outline">
              <mat-label>{{ 'ADMIN.PRODUCTS.FORM.DESCRIPTION' | translate }}</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
              @if (form.get('description')?.hasError('required') && form.get('description')?.touched) {
                <mat-error>{{ 'ADMIN.PRODUCTS.FORM.DESCRIPTION_REQUIRED' | translate }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="pfd__field" appearance="outline">
              <mat-label>{{ 'ADMIN.PRODUCTS.FORM.SHORT_DESCRIPTION' | translate }}</mat-label>
              <input matInput formControlName="shortDescription" />
              <mat-hint>Exibida nos cards de listagem</mat-hint>
            </mat-form-field>
          </section>

          <hr class="pfd__divider" />

          <!-- Identificação -->
          <section class="pfd__section">
            <span class="pfd__section-label">Identificação</span>
            <div class="pfd__row">
              <mat-form-field class="pfd__field" appearance="outline">
                <mat-label>{{ 'ADMIN.PRODUCTS.FORM.SKU' | translate }}</mat-label>
                <mat-icon matPrefix class="pfd__field-icon">qr_code</mat-icon>
                <input matInput formControlName="sku" />
                @if (form.get('sku')?.hasError('required') && form.get('sku')?.touched) {
                  <mat-error>{{ 'ADMIN.PRODUCTS.FORM.SKU_REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="pfd__field" appearance="outline">
                <mat-label>{{ 'ADMIN.PRODUCTS.FORM.CATEGORY' | translate }}</mat-label>
                <mat-icon matPrefix class="pfd__field-icon">category</mat-icon>
                <mat-select formControlName="categoryId">
                  @for (cat of data.categories; track cat.id) {
                    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                  }
                </mat-select>
                @if (form.get('categoryId')?.hasError('required') && form.get('categoryId')?.touched) {
                  <mat-error>{{ 'ADMIN.PRODUCTS.FORM.CATEGORY_REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>
            </div>
          </section>

          <hr class="pfd__divider" />

          <!-- Precificação -->
          <section class="pfd__section">
            <span class="pfd__section-label">Precificação</span>
            <div class="pfd__row">
              <mat-form-field class="pfd__field" appearance="outline">
                <mat-label>{{ 'ADMIN.PRODUCTS.FORM.PRICE' | translate }}</mat-label>
                <span matTextPrefix class="pfd__text-prefix">R$&nbsp;</span>
                <input matInput type="number" formControlName="price" min="0" step="0.01" />
                @if (form.get('price')?.hasError('required') && form.get('price')?.touched) {
                  <mat-error>{{ 'ADMIN.PRODUCTS.FORM.PRICE_REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="pfd__field" appearance="outline">
                <mat-label>{{ 'ADMIN.PRODUCTS.FORM.ORIGINAL_PRICE' | translate }}</mat-label>
                <span matTextPrefix class="pfd__text-prefix">R$&nbsp;</span>
                <input matInput type="number" formControlName="originalPrice" min="0" step="0.01" />
                <mat-hint>Exibe desconto na loja</mat-hint>
              </mat-form-field>
            </div>
          </section>

          <hr class="pfd__divider" />

          <!-- Inventário & Logística -->
          <section class="pfd__section">
            <span class="pfd__section-label">Inventário &amp; Logística</span>
            <div class="pfd__row">
              <mat-form-field class="pfd__field" appearance="outline">
                <mat-label>{{ 'ADMIN.PRODUCTS.FORM.STOCK' | translate }}</mat-label>
                <mat-icon matPrefix class="pfd__field-icon">inventory_2</mat-icon>
                <input matInput type="number" formControlName="stockQuantity" min="0" />
                @if (form.get('stockQuantity')?.hasError('required') && form.get('stockQuantity')?.touched) {
                  <mat-error>{{ 'ADMIN.PRODUCTS.FORM.STOCK_REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="pfd__field" appearance="outline">
                <mat-label>{{ 'ADMIN.PRODUCTS.FORM.WEIGHT' | translate }}</mat-label>
                <mat-icon matPrefix class="pfd__field-icon">scale</mat-icon>
                <input matInput type="number" formControlName="weight" min="0" step="0.001" />
                <span matTextSuffix class="pfd__text-suffix">kg</span>
              </mat-form-field>
            </div>
          </section>

          <hr class="pfd__divider" />

          <!-- Visibilidade -->
          <section class="pfd__section pfd__section--last">
            <span class="pfd__section-label">Visibilidade</span>
            <div class="pfd__toggles">

              <div class="pfd__toggle-card" [class.pfd__toggle-card--on]="form.get('isActive')?.value">
                <div class="pfd__toggle-card-icon" [class.pfd__toggle-card-icon--on]="form.get('isActive')?.value">
                  <mat-icon>{{ form.get('isActive')?.value ? 'visibility' : 'visibility_off' }}</mat-icon>
                </div>
                <div class="pfd__toggle-card-copy">
                  <span class="pfd__toggle-card-title">{{ 'ADMIN.PRODUCTS.FORM.IS_ACTIVE' | translate }}</span>
                  <span class="pfd__toggle-card-hint">Visível na loja</span>
                </div>
                <mat-slide-toggle formControlName="isActive" color="primary"></mat-slide-toggle>
              </div>

              <div class="pfd__toggle-card" [class.pfd__toggle-card--on]="form.get('isFeatured')?.value">
                <div class="pfd__toggle-card-icon" [class.pfd__toggle-card-icon--on]="form.get('isFeatured')?.value">
                  <mat-icon>{{ form.get('isFeatured')?.value ? 'star' : 'star_outline' }}</mat-icon>
                </div>
                <div class="pfd__toggle-card-copy">
                  <span class="pfd__toggle-card-title">{{ 'ADMIN.PRODUCTS.FORM.IS_FEATURED' | translate }}</span>
                  <span class="pfd__toggle-card-hint">Exibido na home</span>
                </div>
                <mat-slide-toggle formControlName="isFeatured" color="primary"></mat-slide-toggle>
              </div>

            </div>
          </section>

        </form>
      </mat-dialog-content>

      <!-- Rodapé -->
      <footer class="pfd__footer">
        <button class="pfd__btn pfd__btn--ghost" mat-dialog-close type="button">
          {{ 'ADMIN.PRODUCTS.FORM.CANCEL' | translate }}
        </button>
        <button class="pfd__btn pfd__btn--primary" type="button" [disabled]="saving()" (click)="submit()">
          @if (saving()) {
            <mat-spinner diameter="16" class="pfd__spinner"></mat-spinner>
          } @else {
            <mat-icon class="pfd__btn-icon">{{ isEdit ? 'save' : 'add_circle_outline' }}</mat-icon>
          }
          {{ isEdit ? ('ADMIN.PRODUCTS.FORM.SAVE' | translate) : ('ADMIN.PRODUCTS.FORM.CREATE' | translate) }}
        </button>
      </footer>

    </div>
  `,
})
export class ProductFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);

  readonly data: ProductFormDialogData = inject(MAT_DIALOG_DATA);
  readonly saving = signal(false);

  get isEdit(): boolean { return !!this.data.product; }

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    shortDescription: [''],
    sku: ['', Validators.required],
    categoryId: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    originalPrice: [null as number | null],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    weight: [0],
    isActive: [true],
    isFeatured: [false],
  });

  ngOnInit(): void {
    if (this.data.product) {
      const p = this.data.product;
      this.form.patchValue({
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription ?? '',
        sku: p.sku,
        categoryId: p.categoryId,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        stockQuantity: p.stockQuantity,
        weight: p.weight,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const v = this.form.value;

    if (this.isEdit) {
      const dto: UpdateProductDto = {
        id: this.data.product!.id,
        name: v.name!,
        description: v.description!,
        shortDescription: v.shortDescription ?? undefined,
        sku: v.sku!,
        categoryId: v.categoryId!,
        price: Number(v.price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
        stockQuantity: Number(v.stockQuantity),
        weight: Number(v.weight ?? 0),
        isActive: !!v.isActive,
        isFeatured: !!v.isFeatured,
      };

      this.productService.updateProduct(this.data.product!.id, dto).subscribe({
        next: () => {
          this.snackBar.open('Produto atualizado com sucesso.', 'Fechar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.saving.set(false);
          this.snackBar.open('Erro ao atualizar produto.', 'Fechar', { duration: 3000 });
        },
      });
    } else {
      const dto: CreateProductDto = {
        name: v.name!,
        description: v.description!,
        shortDescription: v.shortDescription ?? undefined,
        sku: v.sku!,
        categoryId: v.categoryId!,
        price: Number(v.price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
        stockQuantity: Number(v.stockQuantity),
        weight: Number(v.weight ?? 0),
        isActive: !!v.isActive,
        isFeatured: !!v.isFeatured,
      };

      this.productService.createProduct(dto).subscribe({
        next: () => {
          this.snackBar.open('Produto criado com sucesso.', 'Fechar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.saving.set(false);
          this.snackBar.open('Erro ao criar produto.', 'Fechar', { duration: 3000 });
        },
      });
    }
  }
}
