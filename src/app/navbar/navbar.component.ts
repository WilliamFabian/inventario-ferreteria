import { NgClass, NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductosService } from '../../../services/productos.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterModule, NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NavbarComponent {

  constructor(private productoServicio: ProductosService){}

  categorias = [
      {valor: 'tornillo', nombre: 'Tornillo'},
      {valor: 'herramienta', nombre: 'Herramienta'},
      {valor: 'griferia', nombre: 'Griferia'},
      {valor: 'electrico', nombre: 'Electrico'},
      {valor: 'pealpe', nombre: 'Pealpe'},
      {valor: 'pintura', nombre: 'Pintura'}
  ];

  onUserSelection(option: string) {
    this.productoServicio.updateSelectedOption(option);
  }

}