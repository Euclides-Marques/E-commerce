import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AddressService } from '../../../core/services/address.service';
import { AddressDto } from '../../../core/models/address.model';

@Component({
  selector: 'app-profile-addresses',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="addr">

      <!-- ── List header ────────────────────────────────────────── -->
      <div class="addr__head">
        <div>
          <h2 class="addr__title">{{ 'PROFILE.ADDRESSES.TITLE' | translate }}</h2>
          @if (svc.addresses().length > 0 && !showForm()) {
            <p class="addr__sub">
              {{ 'PROFILE.ADDRESSES.COUNT' | translate:{ count: svc.addresses().length } }}
            </p>
          }
        </div>
        @if (!showForm()) {
          <button class="addr__btn-add" (click)="openAdd()">
            <mat-icon>add</mat-icon>
            {{ 'PROFILE.ADDRESSES.ADD_BTN' | translate }}
          </button>
        }
      </div>

      <!-- ── Loading ────────────────────────────────────────────── -->
      @if (loading()) {
        <div class="addr__loading">
          <mat-spinner diameter="28"></mat-spinner>
          <span>{{ 'PROFILE.ADDRESSES.LOADING' | translate }}</span>
        </div>
      }

      <!-- ── Empty state ────────────────────────────────────────── -->
      @if (!loading() && !showForm() && svc.addresses().length === 0) {
        <div class="addr__empty">
          <div class="addr__empty-icon">
            <mat-icon>location_off</mat-icon>
          </div>
          <p class="addr__empty-heading">{{ 'PROFILE.ADDRESSES.EMPTY_HEADING' | translate }}</p>
          <p class="addr__empty-sub">{{ 'PROFILE.ADDRESSES.EMPTY_SUB' | translate }}</p>
        </div>
      }

      <!-- ── Address list ───────────────────────────────────────── -->
      @if (!loading() && !showForm() && svc.addresses().length > 0) {
        <div class="addr__list">
          @for (a of svc.addresses(); track a.id) {
            <div class="addr-card" [class.addr-card--default]="a.isDefault">

              <div class="addr-card__left">
                <div class="addr-card__icon-wrap" [class.addr-card__icon-wrap--active]="a.isDefault">
                  <mat-icon>{{ labelIcon(a.label) }}</mat-icon>
                </div>
                <div class="addr-card__info">
                  <div class="addr-card__top">
                    <span class="addr-card__label">{{ a.label }}</span>
                    @if (a.isDefault) {
                      <span class="addr-card__badge">
                        <mat-icon class="addr-card__badge-icon">star</mat-icon>
                        {{ 'PROFILE.ADDRESSES.DEFAULT_BADGE' | translate }}
                      </span>
                    }
                  </div>
                  <p class="addr-card__recipient">{{ a.recipient }}</p>
                  <p class="addr-card__line">
                    {{ a.street }}, {{ a.number }}{{ a.complement ? ', ' + a.complement : '' }}
                  </p>
                  <p class="addr-card__line">{{ a.neighborhood }} — {{ a.city }}, {{ a.state }}</p>
                  <p class="addr-card__cep">CEP {{ a.zipCode }}</p>
                </div>
              </div>

              <div class="addr-card__actions">
                @if (!a.isDefault) {
                  <button class="addr-card__btn"
                          [title]="'PROFILE.ADDRESSES.ACTION_DEFAULT' | translate"
                          [disabled]="busy() === 'default:' + a.id"
                          (click)="onSetDefault(a.id)">
                    @if (busy() === 'default:' + a.id) {
                      <mat-spinner diameter="14"></mat-spinner>
                    } @else {
                      <mat-icon>star_border</mat-icon>
                    }
                  </button>
                }
                <button class="addr-card__btn"
                        [title]="'PROFILE.ADDRESSES.ACTION_EDIT' | translate"
                        (click)="openEdit(a)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button class="addr-card__btn addr-card__btn--danger"
                        [title]="'PROFILE.ADDRESSES.ACTION_DELETE' | translate"
                        [disabled]="busy() === 'del:' + a.id"
                        (click)="onDelete(a.id)">
                  @if (busy() === 'del:' + a.id) {
                    <mat-spinner diameter="14"></mat-spinner>
                  } @else {
                    <mat-icon>delete_outline</mat-icon>
                  }
                </button>
              </div>

            </div>
          }
        </div>
      }

      <!-- ── Add / Edit form ────────────────────────────────────── -->
      @if (showForm()) {
        <div class="addr-form">

          <div class="addr-form__head">
            <div class="addr-form__head-left">
              <div class="addr-form__head-icon">
                <mat-icon>{{ editId() ? 'edit' : 'add_location_alt' }}</mat-icon>
              </div>
              <h3 class="addr-form__title">
                {{ (editId() ? 'PROFILE.ADDRESSES.FORM_EDIT_TITLE' : 'PROFILE.ADDRESSES.FORM_ADD_TITLE') | translate }}
              </h3>
            </div>
            <button class="addr-form__close" (click)="closeForm()"
                    [attr.aria-label]="'PROFILE.ADDRESSES.BTN_CANCEL' | translate">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="addr-form__body">

            <div class="form-row form-row--2">
              <div class="form-field">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_LABEL' | translate }}
                  <span class="form-req">*</span>
                </label>
                <input formControlName="label" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_LABEL' | translate" />
                @if (f['label'].invalid && f['label'].touched) {
                  <span class="form-error">{{ 'PROFILE.ADDRESSES.REQUIRED' | translate }}</span>
                }
              </div>
              <div class="form-field">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_RECIPIENT' | translate }}
                  <span class="form-req">*</span>
                </label>
                <input formControlName="recipient" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_RECIPIENT' | translate" />
                @if (f['recipient'].invalid && f['recipient'].touched) {
                  <span class="form-error">{{ 'PROFILE.ADDRESSES.REQUIRED' | translate }}</span>
                }
              </div>
            </div>

            <div class="form-row form-row--cep">
              <div class="form-field">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_ZIP' | translate }}
                  <span class="form-req">*</span>
                </label>
                <input formControlName="zipCode" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_ZIP' | translate"
                       maxlength="9" />
                @if (f['zipCode'].invalid && f['zipCode'].touched) {
                  <span class="form-error">{{ 'PROFILE.ADDRESSES.REQUIRED' | translate }}</span>
                }
              </div>
              <div class="form-field form-field--grow">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_STREET' | translate }}
                  <span class="form-req">*</span>
                </label>
                <input formControlName="street" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_STREET' | translate" />
                @if (f['street'].invalid && f['street'].touched) {
                  <span class="form-error">{{ 'PROFILE.ADDRESSES.REQUIRED' | translate }}</span>
                }
              </div>
            </div>

            <div class="form-row form-row--3">
              <div class="form-field">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_NUMBER' | translate }}
                  <span class="form-req">*</span>
                </label>
                <input formControlName="number" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_NUMBER' | translate" />
                @if (f['number'].invalid && f['number'].touched) {
                  <span class="form-error">{{ 'PROFILE.ADDRESSES.REQUIRED_SHORT' | translate }}</span>
                }
              </div>
              <div class="form-field">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_COMPLEMENT' | translate }}
                </label>
                <input formControlName="complement" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_COMPLEMENT' | translate" />
              </div>
              <div class="form-field">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_NEIGHBORHOOD' | translate }}
                  <span class="form-req">*</span>
                </label>
                <input formControlName="neighborhood" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_NEIGHBORHOOD' | translate" />
                @if (f['neighborhood'].invalid && f['neighborhood'].touched) {
                  <span class="form-error">{{ 'PROFILE.ADDRESSES.REQUIRED_SHORT' | translate }}</span>
                }
              </div>
            </div>

            <div class="form-row form-row--3">
              <div class="form-field form-field--grow">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_CITY' | translate }}
                  <span class="form-req">*</span>
                </label>
                <input formControlName="city" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_CITY' | translate" />
                @if (f['city'].invalid && f['city'].touched) {
                  <span class="form-error">{{ 'PROFILE.ADDRESSES.REQUIRED_SHORT' | translate }}</span>
                }
              </div>
              <div class="form-field">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_STATE' | translate }}
                  <span class="form-req">*</span>
                </label>
                <input formControlName="state" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_STATE' | translate"
                       maxlength="2" style="text-transform: uppercase" />
                @if (f['state'].invalid && f['state'].touched) {
                  <span class="form-error">{{ 'PROFILE.ADDRESSES.REQUIRED_SHORT' | translate }}</span>
                }
              </div>
              <div class="form-field">
                <label class="form-label">
                  {{ 'PROFILE.ADDRESSES.FIELD_COUNTRY' | translate }}
                  <span class="form-req">*</span>
                </label>
                <input formControlName="country" class="form-input"
                       [placeholder]="'PROFILE.ADDRESSES.PH_COUNTRY' | translate" />
              </div>
            </div>

            <label class="form-checkbox">
              <input type="checkbox" formControlName="isDefault" class="form-checkbox__input" />
              <span class="form-checkbox__box"></span>
              <span class="form-checkbox__text">
                {{ 'PROFILE.ADDRESSES.SET_DEFAULT_CHECK' | translate }}
              </span>
            </label>

            <div class="addr-form__footer">
              <button type="button" class="addr-form__btn-cancel" (click)="closeForm()">
                {{ 'PROFILE.ADDRESSES.BTN_CANCEL' | translate }}
              </button>
              <button type="submit" class="addr-form__btn-save"
                      [disabled]="form.invalid || saving()">
                @if (saving()) {
                  <mat-spinner diameter="16" class="addr-spinner"></mat-spinner>
                } @else {
                  <mat-icon>{{ editId() ? 'save' : 'add' }}</mat-icon>
                }
                {{ (editId() ? 'PROFILE.ADDRESSES.BTN_SAVE' : 'PROFILE.ADDRESSES.BTN_ADD') | translate }}
              </button>
            </div>

          </form>
        </div>
      }

    </div>
  `,
  styles: [`
    /* ── Page header ─────────────────────────────────────────────── */
    .addr__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
    }
    .addr__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 3px;
      letter-spacing: -0.2px;
    }
    .addr__sub {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
    }

    .addr__btn-add {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 8px 16px 8px 10px;
      background: var(--brand-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      font-family: 'Inter', sans-serif;
      transition: background .15s, box-shadow .15s;
      flex-shrink: 0;
    }
    .addr__btn-add mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }
    .addr__btn-add:hover {
      background: var(--brand-hover);
      box-shadow: 0 3px 12px rgba(240,78,35,.28);
    }

    /* ── Loading ─────────────────────────────────────────────────── */
    .addr__loading {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 32px;
      color: var(--text-secondary);
      font-size: 14px;
      justify-content: center;
    }

    /* ── Empty state ─────────────────────────────────────────────── */
    .addr__empty {
      text-align: center;
      padding: 48px 24px;
    }
    .addr__empty-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: var(--bg-page);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .addr__empty-icon mat-icon {
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
      color: var(--text-placeholder);
    }
    .addr__empty-heading {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 6px;
    }
    .addr__empty-sub {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.6;
    }

    /* ── Address list ────────────────────────────────────────────── */
    .addr__list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Address card ────────────────────────────────────────────── */
    .addr-card {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 20px;
      background: var(--bg-page);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      transition: border-color .15s, box-shadow .15s;
    }
    .addr-card:hover {
      border-color: #CBD5E1;
      box-shadow: var(--shadow-sm);
    }
    .addr-card--default {
      border-color: rgba(240,78,35,.25);
      background: rgba(240,78,35,.025);
    }
    .addr-card--default:hover { border-color: rgba(240,78,35,.38); }

    .addr-card__left {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      flex: 1;
      min-width: 0;
    }
    .addr-card__icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .addr-card__icon-wrap--active {
      background: rgba(240,78,35,.08);
      border-color: rgba(240,78,35,.2);
    }
    .addr-card__icon-wrap mat-icon {
      font-size: 19px !important;
      width: 19px !important;
      height: 19px !important;
      color: var(--text-secondary);
    }
    .addr-card__icon-wrap--active mat-icon { color: var(--brand-primary); }

    .addr-card__info { flex: 1; min-width: 0; }

    .addr-card__top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      flex-wrap: wrap;
    }
    .addr-card__label {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.1px;
    }
    .addr-card__badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 8px 2px 5px;
      background: rgba(240,78,35,.08);
      color: var(--brand-primary);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid rgba(240,78,35,.15);
    }
    .addr-card__badge-icon {
      font-size: 11px !important;
      width: 11px !important;
      height: 11px !important;
    }
    .addr-card__recipient {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      margin: 0 0 3px;
    }
    .addr-card__line {
      font-size: 12.5px;
      color: var(--text-secondary);
      margin: 0 0 2px;
      line-height: 1.5;
    }
    .addr-card__cep {
      font-size: 12px;
      color: var(--text-placeholder);
      margin: 4px 0 0;
    }

    .addr-card__actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .addr-card__btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: border-color .15s, color .15s, background .15s;
      padding: 0;
    }
    .addr-card__btn mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }
    .addr-card__btn:hover:not(:disabled) {
      border-color: var(--brand-primary);
      color: var(--brand-primary);
      background: rgba(240,78,35,.04);
    }
    .addr-card__btn--danger:hover:not(:disabled) {
      border-color: #EF4444;
      color: #EF4444;
      background: rgba(239,68,68,.05);
    }
    .addr-card__btn:disabled { opacity: .5; cursor: not-allowed; }

    /* ── Form card ───────────────────────────────────────────────── */
    .addr-form {
      background: var(--bg-page);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .addr-form__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
    }
    .addr-form__head-left { display: flex; align-items: center; gap: 10px; }
    .addr-form__head-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(240,78,35,.08);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .addr-form__head-icon mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      color: var(--brand-primary);
    }
    .addr-form__title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
    .addr-form__close {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: background .15s, color .15s;
      padding: 0;
    }
    .addr-form__close mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }
    .addr-form__close:hover { background: var(--bg-page); color: var(--text-primary); }

    .addr-form__body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* ── Form rows ───────────────────────────────────────────────── */
    .form-row { display: grid; gap: 10px; }
    .form-row--2   { grid-template-columns: 1fr 1fr; }
    .form-row--3   { grid-template-columns: 1fr 1fr 1fr; }
    .form-row--cep { grid-template-columns: 160px 1fr; }

    .form-field { display: flex; flex-direction: column; gap: 5px; }
    .form-field--grow { flex: 1; }

    .form-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.55px;
      color: var(--text-secondary);
    }
    .form-req { color: var(--brand-primary); }

    .form-input {
      height: 38px;
      padding: 0 12px;
      border: 1.5px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      font-size: 13.5px;
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
      width: 100%;
      box-sizing: border-box;
    }
    .form-input::placeholder { color: var(--text-placeholder); }
    .form-input:focus {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px rgba(240,78,35,.1);
    }
    .form-input:hover:not(:focus) { border-color: #CBD5E1; }

    .form-error {
      font-size: 11.5px;
      color: #EF4444;
      font-weight: 500;
    }

    /* ── Checkbox ────────────────────────────────────────────────── */
    .form-checkbox {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }
    .form-checkbox__input { display: none; }
    .form-checkbox__box {
      width: 18px;
      height: 18px;
      border-radius: 5px;
      border: 2px solid var(--border-subtle);
      background: var(--bg-surface);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color .15s, background .15s;
    }
    .form-checkbox__input:checked ~ .form-checkbox__box {
      background: var(--brand-primary);
      border-color: var(--brand-primary);
    }
    .form-checkbox__input:checked ~ .form-checkbox__box::after {
      content: '';
      width: 4px;
      height: 8px;
      border: 2px solid #fff;
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
      margin-top: -2px;
      display: block;
    }
    .form-checkbox__text {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    /* ── Form footer ─────────────────────────────────────────────── */
    .addr-form__footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 4px;
      border-top: 1px solid var(--border-subtle);
      margin-top: 4px;
    }
    .addr-form__btn-cancel {
      padding: 9px 18px;
      border: 1.5px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: border-color .15s, color .15s;
    }
    .addr-form__btn-cancel:hover {
      border-color: #94A3B8;
      color: var(--text-primary);
    }
    .addr-form__btn-save {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 20px;
      background: var(--brand-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: background .15s, box-shadow .15s;
    }
    .addr-form__btn-save mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }
    .addr-form__btn-save:hover:not(:disabled) {
      background: var(--brand-hover);
      box-shadow: 0 3px 12px rgba(240,78,35,.28);
    }
    .addr-form__btn-save:disabled { background: #CBD5E1; cursor: not-allowed; }
    .addr-spinner { --mdc-circular-progress-active-indicator-color: #fff; }

    /* ── Responsive ──────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .addr-card { flex-direction: column; }
      .addr-card__actions { align-self: flex-end; }
      .form-row--2, .form-row--3 { grid-template-columns: 1fr; }
      .form-row--cep { grid-template-columns: 1fr; }
    }
  `],
})
export class ProfileAddressesComponent implements OnInit {
  readonly svc = inject(AddressService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly loading  = signal(false);
  readonly saving   = signal(false);
  readonly busy     = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly editId   = signal<string | null>(null);

  readonly form = this.fb.group({
    label:        ['', Validators.required],
    recipient:    ['', Validators.required],
    zipCode:      ['', Validators.required],
    street:       ['', Validators.required],
    number:       ['', Validators.required],
    complement:   [''],
    neighborhood: ['', Validators.required],
    city:         ['', Validators.required],
    state:        ['', Validators.required],
    country:      ['', Validators.required],
    isDefault:    [false],
  });

  get f() { return this.form.controls; }

  labelIcon(label: string): string {
    const l = label.toLowerCase();
    if (l.includes('casa') || l.includes('resid') || l.includes('home')) return 'home';
    if (l.includes('trab') || l.includes('escrit') || l.includes('work')) return 'business';
    if (l.includes('parente') || l.includes('familia') || l.includes('family')) return 'people';
    return 'location_on';
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.svc.getAddresses().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  openAdd(): void {
    this.editId.set(null);
    this.form.reset({ country: this.translate.instant('PROFILE.ADDRESSES.PH_COUNTRY'), isDefault: false });
    this.showForm.set(true);
  }

  openEdit(a: AddressDto): void {
    this.editId.set(a.id);
    this.form.patchValue(a);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editId.set(null);
    this.form.reset({ isDefault: false });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.editId();
    const payload = this.form.getRawValue() as any;
    const req$ = id ? this.svc.updateAddress(id, payload) : this.svc.createAddress(payload);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        const msg = this.translate.instant(id ? 'PROFILE.ADDRESSES.SAVED' : 'PROFILE.ADDRESSES.CREATED');
        this.snackBar.open(msg, this.translate.instant('PROFILE.ADDRESSES.OK'), { duration: 2500 });
        this.closeForm();
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open(
          this.translate.instant('PROFILE.ADDRESSES.SAVE_ERROR'),
          this.translate.instant('PROFILE.ADDRESSES.CLOSE'),
          { duration: 3500 }
        );
      },
    });
  }

  onSetDefault(id: string): void {
    this.busy.set('default:' + id);
    this.svc.setDefault(id).subscribe({
      next: () => {
        this.busy.set(null);
        this.snackBar.open(
          this.translate.instant('PROFILE.ADDRESSES.DEFAULT_SET'),
          this.translate.instant('PROFILE.ADDRESSES.OK'),
          { duration: 2000 }
        );
      },
      error: () => {
        this.busy.set(null);
        this.snackBar.open(
          this.translate.instant('PROFILE.ADDRESSES.DEFAULT_ERROR'),
          this.translate.instant('PROFILE.ADDRESSES.CLOSE'),
          { duration: 3000 }
        );
      },
    });
  }

  onDelete(id: string): void {
    this.busy.set('del:' + id);
    this.svc.deleteAddress(id).subscribe({
      next: () => {
        this.busy.set(null);
        this.snackBar.open(
          this.translate.instant('PROFILE.ADDRESSES.DELETED'),
          this.translate.instant('PROFILE.ADDRESSES.OK'),
          { duration: 2000 }
        );
      },
      error: () => {
        this.busy.set(null);
        this.snackBar.open(
          this.translate.instant('PROFILE.ADDRESSES.DELETE_ERROR'),
          this.translate.instant('PROFILE.ADDRESSES.CLOSE'),
          { duration: 3000 }
        );
      },
    });
  }
}
