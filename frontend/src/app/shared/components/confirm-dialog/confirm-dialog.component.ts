import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  confirmIcon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule, TranslatePipe],
  styles: [`
    /* ── Confirm Dialog — prefixo cd__ ─────────────────────────────── */

    .cd {
      display: flex;
      flex-direction: column;
      background: var(--admin-surface, #fff);
      overflow: hidden;
      min-width: 400px;
    }

    /* Header */
    .cd__header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--admin-border, #E5E7EB);
    }

    .cd__header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--color-danger-soft, #FEF2F2);
      flex-shrink: 0;
      margin-top: 1px;
    }
    .cd__header-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--color-danger, #EF4444);
    }

    .cd__header-copy { flex: 1; min-width: 0; }

    .cd__title {
      margin: 0 0 2px;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-heading, #111827);
      letter-spacing: -0.3px;
      line-height: 1.3;
    }

    .cd__subtitle {
      margin: 0;
      font-size: 12.5px;
      color: var(--admin-muted, #6B7280);
      line-height: 1.4;
    }

    .cd__close.mat-mdc-icon-button {
      width: 32px !important;
      height: 32px !important;
      border-radius: 8px !important;
      color: var(--admin-muted, #6B7280) !important;
      margin-top: -2px;
      margin-right: -8px;
      flex-shrink: 0;
    }
    .cd__close.mat-mdc-icon-button:hover {
      background: var(--bg-surface-soft, #F8FAFC) !important;
      color: var(--text-heading, #111827) !important;
    }
    .cd__close .mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* Body */
    .cd__body {
      padding: 20px 24px;
    }

    .cd__message {
      margin: 0;
      font-size: 14px;
      color: var(--text-primary, #374151);
      line-height: 1.6;
    }

    .cd__item-name {
      display: inline-block;
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--bg-surface-soft, #F8FAFC);
      border: 1px solid var(--admin-border, #E5E7EB);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-heading, #111827);
      width: 100%;
      box-sizing: border-box;
    }

    .cd__warning {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 14px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--color-danger-soft, #FEF2F2);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .cd__warning mat-icon {
      font-size: 15px !important;
      width: 15px !important;
      height: 15px !important;
      color: var(--color-danger, #EF4444);
      flex-shrink: 0;
    }
    .cd__warning-text {
      font-size: 12px;
      color: var(--color-danger, #EF4444);
      font-weight: 500;
      line-height: 1.4;
    }

    /* Footer */
    .cd__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 24px;
      border-top: 1px solid var(--admin-border, #E5E7EB);
      background: var(--admin-surface, #fff);
    }

    /* Buttons */
    .cd__btn {
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

    .cd__btn-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .cd__btn--ghost {
      background: transparent;
      color: var(--text-secondary, #64748B);
      border: 1.5px solid var(--admin-border, #E5E7EB);
    }
    .cd__btn--ghost:hover {
      background: var(--bg-surface-soft, #F8FAFC);
      border-color: var(--border-strong, #CBD5E1);
      color: var(--text-heading, #111827);
    }

    .cd__btn--danger {
      background: var(--color-danger, #EF4444);
      color: #fff;
      box-shadow: 0 2px 10px rgba(239, 68, 68, 0.24);
    }
    .cd__btn--danger:hover {
      background: #DC2626;
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.32);
      transform: translateY(-1px);
    }
    .cd__btn--danger:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.18);
    }

    @media (max-width: 480px) {
      .cd { min-width: unset; }
      .cd__header { padding: 16px; }
      .cd__body { padding: 16px; }
      .cd__footer { padding: 12px 16px; }
    }
  `],
  template: `
    <div class="cd">

      <!-- Header -->
      <header class="cd__header">
        <div class="cd__header-icon">
          <mat-icon>delete_forever</mat-icon>
        </div>
        <div class="cd__header-copy">
          <h2 class="cd__title">{{ data.title }}</h2>
          <p class="cd__subtitle">{{ 'CONFIRM_DIALOG.SUBTITLE' | translate }}</p>
        </div>
        <button class="cd__close" mat-icon-button mat-dialog-close aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <!-- Corpo -->
      <div class="cd__body">
        <p class="cd__message">{{ data.message }}</p>

        @if (data.itemName) {
          <span class="cd__item-name">{{ data.itemName }}</span>
        }

        <div class="cd__warning">
          <mat-icon>warning_amber</mat-icon>
          <span class="cd__warning-text">{{ 'CONFIRM_DIALOG.WARNING' | translate }}</span>
        </div>
      </div>

      <!-- Rodapé -->
      <footer class="cd__footer">
        <button class="cd__btn cd__btn--ghost" mat-dialog-close type="button">
          {{ 'CONFIRM_DIALOG.CANCEL' | translate }}
        </button>
        <button class="cd__btn cd__btn--danger" type="button" (click)="confirm()">
          <mat-icon class="cd__btn-icon">{{ data.confirmIcon ?? 'delete' }}</mat-icon>
          {{ data.confirmLabel ?? ('CONFIRM_DIALOG.CONFIRM' | translate) }}
        </button>
      </footer>

    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  }
}
