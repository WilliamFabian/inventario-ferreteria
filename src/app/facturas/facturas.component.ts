import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';

@Component({
  selector: 'app-facturas',
  imports: [NgIf, NgFor, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css',
})
export class FacturasComponent {
  registros: any[] = [];
  mostrarFormulario = false;
  tablaSeleccionada = 'facturas';
  facturaForm: FormGroup;

  facturaEditando: any = null;
  facturaEditado: any = {};

  constructor(
    private fb: FormBuilder,
    private productoServicio: ProductosService
  ) {
    this.facturaForm = this.fb.group({
      codigoFactura: [''],
      vendedor: ['', Validators.required],
      nit: ['', Validators.required],
      valorFactura: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.obtenerRegistros();
  }

  obtenerRegistros() {
    this.productoServicio.obtenerRegistros(this.tablaSeleccionada).subscribe({
      next: (datos) => {
        this.registros = datos.sort(
          (a: any, b: any) =>
            new Date(b.fechaFactura).getTime() -
            new Date(a.fechaFactura).getTime()
        );
      },
      error: (err) => {
        console.error('Error al obtener las facturas', err);
      },
    });
  }

  agregarRegistro() {
    if (this.facturaForm.valid) {
      let datosFactura = this.facturaForm.value;

      this.productoServicio
        .agregarRegistro(this.tablaSeleccionada, datosFactura)
        .subscribe({
          next: () => {
            alert('Factura agregada con exito.');
            this.obtenerRegistros();
            this.facturaForm.reset();
            this.mostrarFormulario = false;
          },
          error: (err) => {
            alert('No se pudo guardar la factura.');
            console.error('Error en la peticion:', err);
          },
        });
    } else {
      alert('Por favor, completa todos los campos obligatorios.');
    }
  }

  iniciarEdicion(factura: any) {
    this.facturaEditando = { ...factura };
  }

  guardarEdicion() {
    if (this.facturaEditando) {
      this.productoServicio
        .editarRegistro(this.tablaSeleccionada, this.facturaEditando)
        .subscribe({
          next: () => {
            this.obtenerRegistros();
            this.facturaEditando = null;
          },
          error: (err) => {
            console.error('Error al actualizar la factura', err);
          },
        });
      alert('Factura editada con exito.');
    }
  }

  cancelarEdicion() {
    this.facturaEditando = null;
  }

  eliminarRegistro(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
      this.productoServicio
        .eliminarRegistro(this.tablaSeleccionada, id)
        .subscribe({
          next: () => {
            alert('Factura eliminada con exito.');
            this.obtenerRegistros();
          },
          error: (err) => {
            alert('Error al eliminar la factura.');
            console.error('Error al eliminar la factura:', err);
          },
        });
    }
  }
}
