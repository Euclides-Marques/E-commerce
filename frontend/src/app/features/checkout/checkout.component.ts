import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [MatStepperModule, MatButtonModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Finalizar Compra</h1>
      <mat-stepper orientation="horizontal">
        <mat-step label="Endereço">
          <div class="py-6 text-center text-gray-400 italic">Implementado na ETAPA 7</div>
          <div><button mat-button matStepperNext>Próximo</button></div>
        </mat-step>
        <mat-step label="Pagamento">
          <div class="py-6 text-center text-gray-400 italic">Implementado na ETAPA 9</div>
        </mat-step>
        <mat-step label="Confirmação">
          <div class="py-6 text-center text-gray-400 italic">Implementado na ETAPA 8</div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
})
export class CheckoutComponent {}