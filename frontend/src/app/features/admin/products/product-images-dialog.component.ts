import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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
  styles: [`
    /* ── Reset do container Material ── */
    :host ::ng-deep .mdc-dialog__surface {
      border-radius: 16px !important;
      overflow: hidden;
    }

    /* ── Header ── */
    .dlg-header {
      padding: 22px 24px 18px;
      border-bottom: 1px solid #F1F5F9;
      background: linear-gradient(160deg, #FAFBFF 0%, #F5F6FF 100%);
    }
    .dlg-header__label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6366F1;
      margin: 0 0 4px;
    }
    .dlg-header__title {
      font-size: 16px;
      font-weight: 600;
      color: #0F172A;
      margin: 0;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 460px;
    }

    /* ── Zona de upload ── */
    .upload-zone {
      border: 1.5px dashed #CBD5E1;
      border-radius: 12px;
      padding: 28px 20px 24px;
      text-align: center;
      background: #FAFBFF;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      margin-bottom: 20px;
    }
    .upload-zone:hover {
      border-color: #818CF8;
      background: #F0F0FE;
    }
    .upload-zone.is-drag-over {
      border-color: #6366F1;
      border-style: solid;
      background: #EBEBFF;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
    }

    .upload-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
      transition: transform 0.2s;
    }
    .upload-zone:hover .upload-icon,
    .upload-zone.is-drag-over .upload-icon {
      transform: translateY(-2px);
    }
    .upload-icon mat-icon {
      font-size: 26px !important;
      width: 26px !important;
      height: 26px !important;
      color: #6366F1 !important;
    }

    .upload-title {
      font-size: 14px;
      font-weight: 600;
      color: #1E293B;
      margin: 0 0 4px;
    }
    .upload-hint {
      font-size: 12px;
      color: #94A3B8;
      margin: 0 0 16px;
    }
    .upload-hint strong {
      color: #6366F1;
      font-weight: 500;
    }

    .upload-progress {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 12px;
      font-size: 12px;
      font-weight: 500;
      color: #6366F1;
    }

    /* ── Contador de imagens ── */
    .img-count {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: #64748B;
      margin-bottom: 12px;
    }
    .img-count mat-icon {
      font-size: 14px !important;
      width: 14px !important;
      height: 14px !important;
    }

    /* ── Grid de imagens ── */
    .img-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .img-card {
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      aspect-ratio: 1 / 1;
      background: #F1F5F9;
      border: 2px solid transparent;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .img-card.is-main {
      border-color: #10B981;
      box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
    }
    .img-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.25s ease;
    }
    .img-card:hover img {
      transform: scale(1.04);
    }

    .badge-main {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #10B981;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 20px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .img-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15,23,42,0.52);
      opacity: 0;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .img-card:hover .img-overlay {
      opacity: 1;
    }

    .ov-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s, background 0.15s;
      backdrop-filter: blur(6px);
    }
    .ov-btn:hover { transform: scale(1.1); }
    .ov-btn mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }
    .ov-btn--star {
      background: rgba(255,255,255,0.18);
      color: #FCD34D;
    }
    .ov-btn--star:hover { background: rgba(252,211,77,0.28); }
    .ov-btn--delete {
      background: rgba(239,68,68,0.18);
      color: #FCA5A5;
    }
    .ov-btn--delete:hover { background: rgba(239,68,68,0.35); }

    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 28px 16px 20px;
      text-align: center;
    }
    .empty-icon {
      width: 62px;
      height: 62px;
      border-radius: 18px;
      background: linear-gradient(135deg, #F1F5F9, #E2E8F0);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }
    .empty-icon mat-icon {
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
      color: #94A3B8 !important;
    }
    .empty-title {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      margin: 0 0 4px;
    }
    .empty-sub {
      font-size: 12px;
      color: #94A3B8;
      margin: 0;
    }

    /* ── Footer ── */
    .dlg-footer {
      padding: 14px 24px 18px;
      border-top: 1px solid #F1F5F9;
      display: flex;
      justify-content: flex-end;
    }
    .dlg-footer button {
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      padding: 0 20px !important;
      height: 36px !important;
    }
  `],
  template: `
    <!-- ── Header ── -->
    <div class="dlg-header">
      <p class="dlg-header__label">{{ 'ADMIN.PRODUCTS.IMAGES.TITLE' | translate }}</p>
      <h2 class="dlg-header__title" [title]="product().name">{{ product().name }}</h2>
    </div>

    <!-- ── Conteúdo ── -->
    <mat-dialog-content style="padding: 20px 24px 8px; max-height: 460px;">

      <!-- Zona de upload -->
      <div class="upload-zone"
           [class.is-drag-over]="isDragOver()"
           (click)="fileInput.click()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave()"
           (drop)="onDrop($event)">

        <div class="upload-icon">
          <mat-icon>cloud_upload</mat-icon>
        </div>

        <p class="upload-title">{{ 'ADMIN.PRODUCTS.IMAGES.DRAG_DROP' | translate }}</p>
        <p class="upload-hint">Arraste imagens aqui ou <strong>clique para selecionar</strong></p>

        <input #fileInput type="file" accept="image/*" multiple style="display:none"
               (change)="onFileSelected($event)"
               (click)="$event.stopPropagation()" />

        @if (!uploading()) {
          <button mat-flat-button color="primary" style="border-radius:8px;font-size:13px;"
                  (click)="$event.stopPropagation(); fileInput.click()"
                  [disabled]="uploading()">
            <mat-icon style="font-size:16px;width:16px;height:16px">upload</mat-icon>
            {{ 'ADMIN.PRODUCTS.IMAGES.SELECT' | translate }}
          </button>
        }

        @if (uploading()) {
          <div class="upload-progress">
            <mat-spinner diameter="14"></mat-spinner>
            {{ 'ADMIN.PRODUCTS.IMAGES.UPLOADING' | translate }}
          </div>
        }
      </div>

      <!-- Grid de imagens -->
      @if (images().length > 0) {
        <div class="img-count">
          <mat-icon>photo_library</mat-icon>
          {{ images().length }} {{ images().length === 1 ? 'imagem' : 'imagens' }}
        </div>

        <div class="img-grid">
          @for (img of images(); track img.id) {
            <div class="img-card" [class.is-main]="img.isMain">
              <img [src]="img.url" [alt]="img.altText ?? ''" loading="lazy" />

              @if (img.isMain) {
                <span class="badge-main">Principal</span>
              }

              <div class="img-overlay">
                @if (!img.isMain) {
                  <button class="ov-btn ov-btn--star"
                          [matTooltip]="'ADMIN.PRODUCTS.IMAGES.SET_MAIN' | translate"
                          (click)="setMain(img)">
                    <mat-icon>star</mat-icon>
                  </button>
                }
                <button class="ov-btn ov-btn--delete"
                        [matTooltip]="'ADMIN.PRODUCTS.IMAGES.DELETE' | translate"
                        (click)="deleteImage(img)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">
            <mat-icon>photo_library</mat-icon>
          </div>
          <p class="empty-title">{{ 'ADMIN.PRODUCTS.IMAGES.EMPTY' | translate }}</p>
          <p class="empty-sub">Arraste ou selecione imagens para começar</p>
        </div>
      }

    </mat-dialog-content>

    <!-- ── Footer ── -->
    <div class="dlg-footer">
      <button mat-flat-button color="primary" [mat-dialog-close]="changed()">
        {{ 'ADMIN.PRODUCTS.IMAGES.CLOSE' | translate }}
      </button>
    </div>
  `,
})
export class ProductImagesDialogComponent {
  private readonly productService = inject(ProductService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly data: ProductImagesDialogData = inject(MAT_DIALOG_DATA);

  readonly product = signal(this.data.product);
  readonly images = signal<ProductImageDto[]>([...this.data.product.images]);
  readonly uploading = signal(false);
  readonly changed = signal(false);
  readonly isDragOver = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    Array.from(input.files).forEach(file => this.upload(file));
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (!files?.length) return;
    Array.from(files).forEach(file => this.upload(file));
  }

  setMain(img: ProductImageDto): void {
    this.productService.setMainImage(this.product().id, img.id).subscribe({
      next: () => {
        this.images.update(list => list.map(i => ({ ...i, isMain: i.id === img.id })));
        this.changed.set(true);
      },
      error: () => this.snackBar.open(
        this.translate.instant('ADMIN.PRODUCTS.IMAGES.ERROR_SET_MAIN'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      ),
    });
  }

  deleteImage(img: ProductImageDto): void {
    if (!confirm(this.translate.instant('ADMIN.PRODUCTS.IMAGES.CONFIRM_DELETE'))) return;

    this.productService.deleteImage(this.product().id, img.id).subscribe({
      next: () => {
        this.images.update(list => list.filter(i => i.id !== img.id));
        this.changed.set(true);
        this.snackBar.open(
          this.translate.instant('ADMIN.PRODUCTS.IMAGES.DELETED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 2000 },
        );
      },
      error: () => this.snackBar.open(
        this.translate.instant('ADMIN.PRODUCTS.IMAGES.ERROR_DELETE'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      ),
    });
  }

  private upload(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.snackBar.open(
        this.translate.instant('ADMIN.PRODUCTS.IMAGES.ERROR_TYPE'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
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
        this.snackBar.open(
          this.translate.instant('ADMIN.PRODUCTS.IMAGES.ERROR_UPLOAD'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 },
        );
      },
    });
  }
}
