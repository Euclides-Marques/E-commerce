import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AddressService } from '../../core/services/address.service';
import { OrderService } from '../../core/services/order.service';
import { CartService } from '../../core/services/cart.service';
import { AddressDto } from '../../core/models/address.model';
import { OrderDto } from '../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="max-w-3xl mx-auto animate-fade-in">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ 'CHECKOUT.TITLE' | translate }}</h1>

      @if (loadingAddresses()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <mat-stepper orientation="horizontal" [linear]="true" #stepper>

          <!-- STEP 1: Endereço -->
          <mat-step label="{{ 'CHECKOUT.STEP_ADDRESS' | translate }}" [completed]="!!selectedAddressId()">
            <div class="py-6 space-y-4">
              @if (addresses().length === 0) {
                <p class="text-gray-500 text-sm">{{ 'CHECKOUT.NO_ADDRESS' | translate }}</p>
              }

              @for (addr of addresses(); track addr.id) {
                <div
                  class="border-2 rounded-xl p-4 cursor-pointer transition-all"
                  [class.border-primary-500]="selectedAddressId() === addr.id"
                  [class.border-gray-200]="selectedAddressId() !== addr.id"
                  (click)="selectedAddressId.set(addr.id)">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-gray-800">{{ addr.label }}</span>
                        @if (addr.isDefault) {
                          <span class="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">padrão</span>
                        }
                      </div>
                      <p class="text-sm text-gray-600 mt-1">{{ addr.recipient }}</p>
                      <p class="text-sm text-gray-500">{{ addr.street }}, {{ addr.number }}{{ addr.complement ? ', ' + addr.complement : '' }}</p>
                      <p class="text-sm text-gray-500">{{ addr.neighborhood }} · {{ addr.city }}/{{ addr.state }} · CEP {{ addr.zipCode }}</p>
                    </div>
                    <mat-icon [class.text-primary-500]="selectedAddressId() === addr.id" [class.text-gray-300]="selectedAddressId() !== addr.id">
                      {{ selectedAddressId() === addr.id ? 'radio_button_checked' : 'radio_button_unchecked' }}
                    </mat-icon>
                  </div>
                </div>
              }

              <!-- Formulário novo endereço -->
              <button mat-stroked-button color="primary" (click)="showAddressForm.set(!showAddressForm())">
                <mat-icon>{{ showAddressForm() ? 'close' : 'add' }}</mat-icon>
                {{ showAddressForm() ? ('CHECKOUT.CANCEL_NEW_ADDRESS' | translate) : ('CHECKOUT.NEW_ADDRESS' | translate) }}
              </button>

              @if (showAddressForm()) {
                <form [formGroup]="addressForm" class="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                  <div class="grid grid-cols-2 gap-3">
                    <mat-form-field appearance="outline" class="col-span-2">
                      <mat-label>{{ 'ADDRESS.LABEL' | translate }}</mat-label>
                      <input matInput formControlName="label" placeholder="Ex: Casa, Trabalho" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="col-span-2">
                      <mat-label>{{ 'ADDRESS.RECIPIENT' | translate }}</mat-label>
                      <input matInput formControlName="recipient" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'ADDRESS.ZIP_CODE' | translate }}</mat-label>
                      <input matInput formControlName="zipCode" maxlength="9" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'ADDRESS.STATE' | translate }}</mat-label>
                      <input matInput formControlName="state" maxlength="2" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="col-span-2">
                      <mat-label>{{ 'ADDRESS.STREET' | translate }}</mat-label>
                      <input matInput formControlName="street" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'ADDRESS.NUMBER' | translate }}</mat-label>
                      <input matInput formControlName="number" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>{{ 'ADDRESS.COMPLEMENT' | translate }}</mat-label>
                      <input matInput formControlName="complement" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="col-span-2">
                      <mat-label>{{ 'ADDRESS.NEIGHBORHOOD' | translate }}</mat-label>
                      <input matInput formControlName="neighborhood" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="col-span-2">
                      <mat-label>{{ 'ADDRESS.CITY' | translate }}</mat-label>
                      <input matInput formControlName="city" />
                    </mat-form-field>
                  </div>
                  <mat-checkbox formControlName="isDefault">{{ 'ADDRESS.SET_DEFAULT' | translate }}</mat-checkbox>
                  <div class="flex gap-2 pt-2">
                    <button mat-raised-button color="primary" [disabled]="addressForm.invalid || savingAddress()"
                      (click)="onSaveAddress()">
                      {{ 'ADDRESS.SAVE' | translate }}
                    </button>
                  </div>
                </form>
              }

              <div class="pt-4">
                <button mat-raised-button color="primary" matStepperNext [disabled]="!selectedAddressId()">
                  {{ 'CHECKOUT.NEXT' | translate }}
                </button>
              </div>
            </div>
          </mat-step>

          <!-- STEP 2: Resumo -->
          <mat-step label="{{ 'CHECKOUT.STEP_REVIEW' | translate }}">
            <div class="py-6 space-y-4">
              <h3 class="font-semibold text-gray-800">{{ 'CHECKOUT.ORDER_SUMMARY' | translate }}</h3>

              @if (cartService.cart(); as cart) {
                <div class="space-y-2">
                  @for (item of cart.items; track item.productId) {
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-700">{{ item.productName }} × {{ item.quantity }}</span>
                      <span class="font-medium">{{ item.subtotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                    </div>
                  }
                </div>
                <mat-divider></mat-divider>
                <div class="flex justify-between text-sm text-gray-600">
                  <span>{{ 'CHECKOUT.SHIPPING' | translate }}</span>
                  <span class="text-green-600 font-medium">{{ 'CHECKOUT.FREE_SHIPPING' | translate }}</span>
                </div>
                <div class="flex justify-between font-bold text-lg">
                  <span>{{ 'CART.TOTAL' | translate }}</span>
                  <span class="text-primary-500">{{ cart.totalPrice | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                </div>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'CHECKOUT.NOTES' | translate }}</mat-label>
                  <textarea matInput [formControl]="notesCtrl" rows="2"></textarea>
                </mat-form-field>
              }

              <div class="flex gap-3 pt-2">
                <button mat-stroked-button matStepperPrevious>{{ 'CHECKOUT.BACK' | translate }}</button>
                <button mat-raised-button color="primary" [disabled]="placing()" (click)="onPlaceOrder()">
                  @if (placing()) { <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner> }
                  {{ 'CHECKOUT.CONFIRM_ORDER' | translate }}
                </button>
              </div>
            </div>
          </mat-step>

          <!-- STEP 3: Confirmação -->
          <mat-step label="{{ 'CHECKOUT.STEP_CONFIRMATION' | translate }}">
            @if (placedOrder()) {
              <div class="py-8 text-center space-y-4">
                <mat-icon class="text-green-500" style="font-size:64px;width:64px;height:64px;">check_circle</mat-icon>
                <h2 class="text-xl font-bold text-gray-800">{{ 'CHECKOUT.SUCCESS_TITLE' | translate }}</h2>
                <p class="text-gray-600">{{ 'CHECKOUT.ORDER_NUMBER' | translate }}: <strong>{{ placedOrder()!.orderNumber }}</strong></p>
                <p class="text-sm text-gray-500">{{ 'CHECKOUT.ESTIMATED_DELIVERY' | translate }}:
                  {{ placedOrder()!.estimatedDelivery | date:'dd/MM/yyyy' }}
                </p>
                <div class="flex justify-center gap-4 pt-4">
                  <a [routerLink]="['/orders', placedOrder()!.id]" mat-raised-button color="primary">
                    {{ 'CHECKOUT.VIEW_ORDER' | translate }}
                  </a>
                  <a routerLink="/products" mat-stroked-button color="primary">
                    {{ 'CART.CONTINUE_SHOPPING' | translate }}
                  </a>
                </div>
              </div>
            }
          </mat-step>

        </mat-stepper>
      }
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly addressService = inject(AddressService);
  readonly orderService = inject(OrderService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly addresses = this.addressService.addresses;
  readonly loadingAddresses = signal(false);
  readonly selectedAddressId = signal<string | null>(null);
  readonly showAddressForm = signal(false);
  readonly savingAddress = signal(false);
  readonly placing = signal(false);
  readonly placedOrder = signal<OrderDto | null>(null);

  readonly notesCtrl = this.fb.control('');

  readonly addressForm = this.fb.group({
    label: ['', Validators.required],
    recipient: ['', Validators.required],
    zipCode: ['', Validators.required],
    street: ['', Validators.required],
    number: ['', Validators.required],
    complement: [''],
    neighborhood: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', [Validators.required, Validators.maxLength(2)]],
    country: ['Brasil'],
    isDefault: [false],
  });

  ngOnInit(): void {
    this.loadingAddresses.set(true);
    this.addressService.getAddresses().subscribe({
      next: addrs => {
        this.loadingAddresses.set(false);
        const def = addrs.find(a => a.isDefault);
        if (def) this.selectedAddressId.set(def.id);
      },
      error: () => {
        this.loadingAddresses.set(false);
        this.snackBar.open('Erro ao carregar endereços.', 'Fechar', { duration: 3000 });
      },
    });

    if (this.cartService.isEmpty()) {
      this.cartService.getCart().subscribe();
    }
  }

  onSaveAddress(): void {
    if (this.addressForm.invalid) return;
    this.savingAddress.set(true);
    const val = this.addressForm.getRawValue() as any;
    this.addressService.createAddress(val).subscribe({
      next: addr => {
        this.savingAddress.set(false);
        this.showAddressForm.set(false);
        this.selectedAddressId.set(addr.id);
        this.addressForm.reset({ country: 'Brasil', isDefault: false });
      },
      error: () => {
        this.savingAddress.set(false);
        this.snackBar.open('Erro ao salvar endereço.', 'Fechar', { duration: 3000 });
      },
    });
  }

  onPlaceOrder(): void {
    const addressId = this.selectedAddressId();
    if (!addressId) return;
    this.placing.set(true);
    this.orderService.placeOrder(addressId, this.notesCtrl.value ?? undefined).subscribe({
      next: order => {
        this.placing.set(false);
        this.placedOrder.set(order);
        this.cartService.clearLocal();
      },
      error: (err) => {
        this.placing.set(false);
        const msg = err?.error?.errors?.[0] ?? 'Erro ao finalizar pedido.';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }
}
