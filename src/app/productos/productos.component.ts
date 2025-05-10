import { Component, EventEmitter, Output } from '@angular/core';
import { ProductosService } from '../../../services/productos.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BuscarProductoComponent } from '../buscar-producto/buscar-producto.component';

@Component({
  selector: 'app-productos',
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    BuscarProductoComponent,
    CommonModule,
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
})
export class ProductosComponent {
  registros: any[] = [];
  mostrarFormulario = false;
  tablaSeleccionada: string = 'productos';
  tipoSeleccionado: string = '';
  ordenSeleccionado: string = '';

  tipos = [
    { valor: 'tornillo', nombre: 'Tornillo' },
    { valor: 'herramienta', nombre: 'Herramienta' },
    { valor: 'griferia', nombre: 'Griferia' },
    { valor: 'electrico', nombre: 'Electrico' },
    { valor: 'pealpe', nombre: 'Pealpe' },
    { valor: 'pintura', nombre: 'Pintura' },
    { valor: 'alcantarillado', nombre: 'Alcantarillado' },
  ];

  tiposFiltro = [
    { valor: 'todo', nombre: 'Todo' },
    { valor: 'tornillo', nombre: 'Tornillo' },
    { valor: 'herramienta', nombre: 'Herramienta' },
    { valor: 'griferia', nombre: 'Griferia' },
    { valor: 'electrico', nombre: 'Electrico' },
    { valor: 'pealpe', nombre: 'Pealpe' },
    { valor: 'pintura', nombre: 'Pintura' },
    { valor: 'alcantarillado', nombre: 'Alcantarillado' },
  ];

  ordenNombres: { [key: string]: string } = {
    idMenor: 'ID Ascendente',
    idMayor: 'ID Descendente',
    precioMenor: 'Menor Precio',
    precioMayor: 'Mayor Precio',
    cantidadMenor: 'Menor Cantidad',
    cantidadMayor: 'Mayor Cantidad',
  };

  productoForm: FormGroup;
  ventaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productoServicio: ProductosService
  ) {
    this.productoServicio.selectedOption$.subscribe((option) => {
      this.tipoSeleccionado = option;
      this.cargarTabla();
    });

    // Formulario para productos
    this.productoForm = this.fb.group({
      idProducto: ['', Validators.required],
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(1)]],
      precioDescuento: [null],
      cantidad: ['', Validators.required],
    });

    // Formulario para ventas
    this.ventaForm = this.fb.group({
      idVenta: ['', Validators.required],
      cliente: ['', Validators.required],
      fecha: ['', Validators.required],
      total: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.ordenSeleccionado = 'idMenor';
    this.cargarTabla();
  }

  cargarTabla() {
    if (this.tipoSeleccionado === 'todo' || '') {
      this.obtenerRegistros();
    } else {
      this.obtenerProductosTipo();
    }
  }

  obtenerRegistros() {
    this.productoServicio
      .obtenerRegistros(this.tablaSeleccionada)
      .subscribe((data) => {
        this.registros = data;

        const obtenerNumeroID = (id: string): number => {
          const match = id.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        };

        if (this.ordenSeleccionado !== '') {
          switch (this.ordenSeleccionado) {
            case 'precioMenor':
              this.registros.sort((a, b) => a.precio - b.precio);
              break;
            case 'precioMayor':
              this.registros.sort((a, b) => b.precio - a.precio);
              break;
            case 'cantidadMenor':
              this.registros.sort((a, b) => a.cantidad - b.cantidad);
              break;
            case 'cantidadMayor':
              this.registros.sort((a, b) => b.cantidad - a.cantidad);
              break;
            case 'idMenor':
              this.registros.sort(
                (a, b) =>
                  obtenerNumeroID(a.idProducto) - obtenerNumeroID(b.idProducto)
              );
              break;
            case 'idMayor':
              this.registros.sort(
                (a, b) =>
                  obtenerNumeroID(b.idProducto) - obtenerNumeroID(a.idProducto)
              );
              break;
          }
        }
      });
  }

  obtenerProductosTipo() {
    this.productoServicio
      .obtenerRegistrosTipo(this.tablaSeleccionada, this.tipoSeleccionado)
      .subscribe((data) => {
        this.registros = data;

        const obtenerNumeroID = (id: string): number => {
          const match = id.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        };

        if (this.ordenSeleccionado !== '') {
          switch (this.ordenSeleccionado) {
            case 'precioMenor':
              this.registros.sort((a, b) => a.precio - b.precio);
              break;
            case 'precioMayor':
              this.registros.sort((a, b) => b.precio - a.precio);
              break;
            case 'cantidadMenor':
              this.registros.sort((a, b) => a.cantidad - b.cantidad);
              break;
            case 'cantidadMayor':
              this.registros.sort((a, b) => b.cantidad - a.cantidad);
              break;
            case 'idMenor':
              this.registros.sort(
                (a, b) =>
                  obtenerNumeroID(a.idProducto) - obtenerNumeroID(b.idProducto)
              );
              break;
            case 'idMayor':
              this.registros.sort(
                (a, b) =>
                  obtenerNumeroID(b.idProducto) - obtenerNumeroID(a.idProducto)
              );
              break;
          }
        }
      });
  }

  agregarRegistro() {
    const form =
      this.tablaSeleccionada === 'productos'
        ? this.productoForm
        : this.ventaForm;

    if (form.valid) {
      this.productoServicio
        .agregarRegistro(this.tablaSeleccionada, form.value)
        .subscribe({
          next: (response) => {
            alert(`Producto agregado con éxito.`);
            this.obtenerRegistros();
            this.productoServicio.notificarProductoCreado();
            form.reset();
            this.mostrarFormulario = false;
          },
          error: (err) => {
            alert(
              `No se pudo agregar el ${this.tablaSeleccionada.slice(0, -1)}.`
            );
            console.error(`Error al agregar ${this.tablaSeleccionada}:`, err);
          },
        });
    } else {
      alert('Por favor, completa todos los campos obligatorios.');
    }
  }

  editarRegistro(registro: any) {
    const { editando, ...registroLimpio } = registro;

    console.log('Enviando al backend:', registroLimpio);

    this.productoServicio
      .editarRegistro(this.tablaSeleccionada, registroLimpio)
      .subscribe({
        next: () => {
          alert(`Producto editado con éxito.`);
          registro.editando = false;
        },
        error: (err) => {
          alert(`No se pudo editar el ${this.tablaSeleccionada.slice(0, -1)}.`);
          console.error(`Error al editar ${this.tablaSeleccionada}:`, err);
        },
      });
  }

  actualizarProductoEditado(productoEditado: any) {
    const index = this.registros.findIndex(
      (p) => p.idProducto === productoEditado.idProducto
    );
    if (index !== -1) {
      this.registros[index] = { ...productoEditado };
    }
  }

  actualizarLista(id: number) {
    this.registros = this.registros.filter(
      (producto) => producto.idProducto !== id
    );
  }

  activarEdicion(producto: any) {
    producto.editando = true;
  }

  cancelarEdicion(producto: any) {
    producto.editando = false;
    this.obtenerRegistros();
  }

  eliminarRegistro(id: string) {
    if (
      confirm(
        `¿Estás seguro de eliminar este ${this.tablaSeleccionada.slice(0, -1)}?`
      )
    ) {
      this.productoServicio
        .eliminarRegistro(this.tablaSeleccionada, id)
        .subscribe(() => {
          this.registros = this.registros.filter((r) => r.id !== id);
        });
      this.cargarTabla();
      alert('Producto eliminado con éxito.');
    }
  }
}
