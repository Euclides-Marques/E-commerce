import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { ProductDto, ProductImageDto } from '../../../core/models/product.model';

export interface ProductImagesDialogData {
  product: ProductDto;
}

@Component({
  selector: 'app-product-images-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ 'ADMIN.PRODUCTS.IMAGES.TITLE' | translate }} — {{ product().name }}
    </h2>

    <mat-dialog-content class="!pt-4">
      <!-- Upload -->
      <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-6 hover:border-primary-400 transition-colors"
           (dragover)="$event.preventDefault()"
           (drop)="onDrop($event)">
        <mat-icon class="text-gray-300 mb-2" style="font-size: 48px; width: 48px; height: 48px">cloud_upload</mat-icon>
        <p class="text-gray-500 text-sm mb-3">{{ 'ADMIN.PRODUCTS.IMAGES.DRAG_DROP' | translate }}</p>
        <input #fileInput type="file" accept="image/*" multiple class="hidden"
               (change)="onFileSelected($event)" />
        <button mat-stroked-button color="primary" (click)="fileInput.click()" [disabled]="uploading()">
          <mat-icon>upload</mat-icon>
          {{ 'ADMIN.PRODUCTS.IMAGES.SELECT' | translate }}
        </button>
        @if (uploading()) {
          <div class="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
            <mat-spinner diameter="16"></mat-spinner>
            {{ 'ADMIN.PRODUCTS.IMAGES.UPLOADING' | translate }}
          </div>
        }
      </div>

      <!-- Grid de imagens -->
      @if (images().length > 0) {
        <div class="grid grid-cols-3 gap-3">
          @for (img of images(); track img.id) {
            <div class="relative group rounded-lg overflow-hidden border-2 transition-all"
                 [class.border-primary-500]="img.isMain"
                 [class.border-transparent]="!img.isMain">
              <img [src]="img.url" [alt]="img.altText ?? ''"
                   class="w-full h-36 object-cover" />

              @if (img.isMain) {
                <span class="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                  {{ 'ADMIN.PRODUCTS.IMAGES.MAIN' | translate }}
                </span>
              }

              <!-- Overlay de ações -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                @if (!img.isMain) {
                  <button mat-icon-button
                          [matTooltip]="'ADMIN.PRODUCTS.IMAGES.SET_MAIN' | translate"
                          class="!text-white"
                          (click)="setMain(img)">
                    <mat-icon>star</mat-icon>
                  </button>
                }
                <button mat-icon-button
                        [matTooltip]="'ADMIN.PRODUCTS.IMAGES.DELETE' | translate"
                        class="!text-red-400"
                        (click)="deleteImage(img)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-8 text-gray-400">
          <mat-icon class="text-4xl mb-2">photo_library</mat-icon>
          <p class="text-sm">{{ 'ADMIN.PRODUCTS.IMAGES.EMPTY' | translate }}</p>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" [mat-dialog-close]="changed()">
        {{ 'ADMIN.PRODUCTS.IMAGES.CLOSE' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ProductImagesDialogComponent {
  private readonly productService = inject(ProductService);
  private readonly dialogRef = inject(MatDialogRef<ProductImagesDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);

  readonly data: ProductImagesDialogData = inject(MAT_DIALOG_DATA);

  readonly product = signal(this.data.product);
  readonly images = signal<ProductImageDto[]>([...this.data.product.images]);
  readonly uploading = signal(false);
  readonly changed = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    Array.from(input.files).forEach(file => this.upload(file));
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files?.length) return;
    Array.from(files).forEach(file => this.upload(file));
  }

  setMain(img: ProductImageDto): void {
    this.productService.setMainImage(this.product().id, img.id).subscribe({
      next: () => {
        this.images.update(list =>
          list.map(i => ({ ...i, isMain: i.id === img.id }))
        );
        this.changed.set(true);
      },
      error: () => this.snackBar.open('Erro ao definir imagem principal.', 'Fechar', { duration: 3000 }),
    });
  }

  deleteImage(img: ProductImageDto): void {
    if (!confirm('Deseja excluir esta imagem?')) return;

    this.productService.deleteImage(this.product().id, img.id).subscribe({
      next: () => {
        this.images.update(list => list.filter(i => i.id !== img.id));
        this.changed.set(true);
        this.snackBar.open('Imagem excluída.', 'Fechar', { duration: 2000 });
      },
      error: () => this.snackBar.open('Erro ao excluir imagem.', 'Fechar', { duration: 3000 }),
    });
  }

  private upload(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Apenas arquivos de imagem são permitidos.', 'Fechar', { duration: 3000 });
      return;
    }

    this.uploading.set(true);
    const isFirst = this.images().length === 0;

    this.productService.uploadImage(this.product().id, file, undefined, isFirst).subscribe({
      next: img => {
        this.images.update(list => [...list, img]);
        this.changed.set(true);
        this.uploading.set(false);
      },
      error: () => {
        this.uploading.set(false);
        this.snackBar.open('Erro ao fazer upload da imagem.', 'Fechar', { duration: 3000 });
      },
    });
  }
}
