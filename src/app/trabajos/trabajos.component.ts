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
  selector: 'app-trabajos',
  templateUrl: './trabajos.component.html',
  styleUrl: './trabajos.component.css',
  imports: [NgIf, NgFor, CommonModule, FormsModule, ReactiveFormsModule],
})
export class TrabajosComponent implements OnInit {
  registros: any[] = [];
  mostrarFormulario = false;
  tablaSeleccionada = 'trabajos';
  trabajoForm: FormGroup;

  trabajoEditando: any = null;
  trabajoEditado: any = {};

  constructor(
    private fb: FormBuilder,
    private productoServicio: ProductosService
  ) {
    this.trabajoForm = this.fb.group({
      descripcion: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(1)]],
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
            new Date(b.fechaTrabajo).getTime() - new Date(a.fechaTrabajo).getTime()
        );
      },
      error: (err) => {
        console.error('Error al obtener los trabajos', err);
      },
    });
  }

  agregarRegistro() {
    if (this.trabajoForm.valid) {
      let datosTrabajo = this.trabajoForm.value;

      this.productoServicio
        .agregarRegistro(this.tablaSeleccionada, datosTrabajo)
        .subscribe({
          next: () => {
            alert('Trabajo agregado con exito.');
            this.obtenerRegistros(); // Recargar la lista
            this.trabajoForm.reset();
            this.mostrarFormulario = false;
          },
          error: (err) => {
            alert('No se pudo guardar el trabajo.');
            console.error('Error en la peticion:', err);
          },
        });
    } else {
      alert('Por favor, completa todos los campos obligatorios.');
    }
  }

  iniciarEdicion(trabajo: any) {
    this.trabajoEditando = { ...trabajo };
  }

  guardarEdicion() {
    if (this.trabajoEditando) {
      this.productoServicio
        .editarRegistro(this.tablaSeleccionada, this.trabajoEditando)
        .subscribe({
          next: () => {
            this.obtenerRegistros();
            this.trabajoEditando = null;
          },
          error: (err) => {
            console.error('Error al actualizar el trabajo', err);
          },
        });
      alert('Trabajo editado con exito.');
    }
  }

  cancelarEdicion() {
    this.trabajoEditando = null;
  }

  eliminarRegistro(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este trabajo?')) {
      this.productoServicio
        .eliminarRegistro(this.tablaSeleccionada, id)
        .subscribe({
          next: () => {
            alert('Trabajo eliminado con exito.');
            this.obtenerRegistros(); // Recargar la lista de trabajos
          },
          error: (err) => {
            alert('Error al eliminar el trabajo.');
            console.error('Error al eliminar el trabajo:', err);
          },
        });
    }
  }
}
