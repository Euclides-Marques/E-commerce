import { Component, inject, signal, OnInit } from '@angular/core';
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
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ isEdit ? ('ADMIN.PRODUCTS.EDIT_TITLE' | translate) : ('ADMIN.PRODUCTS.CREATE_TITLE' | translate) }}
    </h2>

    <mat-dialog-content class="!pt-4">
      <form [formGroup]="form" class="grid grid-cols-2 gap-x-4 gap-y-1">

        <mat-form-field class="col-span-2" appearance="outline">
          <mat-label>{{ 'ADMIN.PRODUCTS.FORM.NAME' | translate }}</mat-label>
          <input matInput formControlName="name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>{{ 'ADMIN.PRODUCTS.FORM.NAME_REQUIRED' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="col-span-2" appearance="outline">
          <mat-label>{{ 'ADMIN.PRODUCTS.FORM.DESCRIPTION' | translate }}</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
          @if (form.get('description')?.hasError('required') && form.get('description')?.touched) {
            <mat-error>{{ 'ADMIN.PRODUCTS.FORM.DESCRIPTION_REQUIRED' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="col-span-2" appearance="outline">
          <mat-label>{{ 'ADMIN.PRODUCTS.FORM.SHORT_DESCRIPTION' | translate }}</mat-label>
          <input matInput formControlName="shortDescription" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'ADMIN.PRODUCTS.FORM.SKU' | translate }}</mat-label>
          <input matInput formControlName="sku" />
          @if (form.get('sku')?.hasError('required') && form.get('sku')?.touched) {
            <mat-error>{{ 'ADMIN.PRODUCTS.FORM.SKU_REQUIRED' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'ADMIN.PRODUCTS.FORM.CATEGORY' | translate }}</mat-label>
          <mat-select formControlName="categoryId">
            @for (cat of data.categories; track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
          @if (form.get('categoryId')?.hasError('required') && form.get('categoryId')?.touched) {
            <mat-error>{{ 'ADMIN.PRODUCTS.FORM.CATEGORY_REQUIRED' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'ADMIN.PRODUCTS.FORM.PRICE' | translate }}</mat-label>
          <input matInput type="number" formControlName="price" min="0" step="0.01" />
          @if (form.get('price')?.hasError('required') && form.get('price')?.touched) {
            <mat-error>{{ 'ADMIN.PRODUCTS.FORM.PRICE_REQUIRED' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'ADMIN.PRODUCTS.FORM.ORIGINAL_PRICE' | translate }}</mat-label>
          <input matInput type="number" formControlName="originalPrice" min="0" step="0.01" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'ADMIN.PRODUCTS.FORM.STOCK' | translate }}</mat-label>
          <input matInput type="number" formControlName="stockQuantity" min="0" />
          @if (form.get('stockQuantity')?.hasError('required') && form.get('stockQuantity')?.touched) {
            <mat-error>{{ 'ADMIN.PRODUCTS.FORM.STOCK_REQUIRED' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'ADMIN.PRODUCTS.FORM.WEIGHT' | translate }} (kg)</mat-label>
          <input matInput type="number" formControlName="weight" min="0" step="0.001" />
        </mat-form-field>

        <div class="col-span-2 flex gap-6 pt-2">
          <mat-slide-toggle formControlName="isActive" color="primary">
            {{ 'ADMIN.PRODUCTS.FORM.IS_ACTIVE' | translate }}
          </mat-slide-toggle>
          <mat-slide-toggle formControlName="isFeatured" color="primary">
            {{ 'ADMIN.PRODUCTS.FORM.IS_FEATURED' | translate }}
          </mat-slide-toggle>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>{{ 'ADMIN.PRODUCTS.FORM.CANCEL' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="saving()" (click)="submit()">
        @if (saving()) { <mat-spinner diameter="18" class="mr-2"></mat-spinner> }
        {{ isEdit ? ('ADMIN.PRODUCTS.FORM.SAVE' | translate) : ('ADMIN.PRODUCTS.FORM.CREATE' | translate) }}
      </button>
    </mat-dialog-actions>
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
