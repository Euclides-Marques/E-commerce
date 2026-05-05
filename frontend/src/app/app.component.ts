import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private translate = inject(TranslateService);

  ngOnInit(): void {
    const savedLang = localStorage.getItem('preferred_language') ?? 'pt-BR';
    this.translate.addLangs(['pt-BR', 'en-US', 'es-ES']);
    this.translate.use(savedLang).subscribe();
  }
}