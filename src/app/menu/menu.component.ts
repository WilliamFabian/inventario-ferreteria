import { Component, OnInit, OnDestroy,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { GraficoBarrasComponent } from "../grafico-barras/grafico-barras.component";

@Component({
  selector: 'app-menu',
  imports: [GraficoBarrasComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MenuComponent implements OnInit, OnDestroy{
  constructor(private router: Router) {}

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = 'auto'; // Volver a lo normal cuando salgas
  }

  navegar(ruta: string) {
    this.router.navigate([`${ruta}`]);
  }
}
