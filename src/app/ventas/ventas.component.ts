import { Component } from '@angular/core';
import { ProductosService } from '../../../services/productos.service';
import { NgFor, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-ventas',
  imports: [NgIf, NgFor, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css',
})
export class VentasComponent {
  registros: any[] = [];
  mostrarFormulario = false;
  tablaSeleccionada = 'ventas';
  productoBusqueda: string = '';
  productosFiltrados: any[] = [];
  aplicarDescuento = false;
  ventaEditando: string | null = null;
  ventaEditada: any = {};
  cantidadOriginal: number = 0;

  ventaForm: FormGroup;
  productos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private productoServicio: ProductosService
  ) {
    this.ventaForm = this.fb.group({
      idVenta: ['', Validators.required],
      idProducto: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      valorUnitario: [{ value: '', disabled: true }],
      precioTotal: [{ value: '', disabled: true }],
      descuento: [false],
    });
  }

  ngOnInit() {
    this.obtenerRegistros();
    this.obtenerProductos();
  }

  filtrarProductos() {
    const texto = this.productoBusqueda.toLowerCase();
    this.productosFiltrados = this.productos.filter(
      (producto) =>
        producto.idProducto.toLowerCase().includes(texto) ||
        producto.nombre.toLowerCase().includes(texto)
    );
  }

  obtenerRegistros() {
    this.productoServicio.obtenerRegistros('ventas').subscribe((data) => {
      this.registros = data.sort((a: any, b: any) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime());
    });
  }
  obtenerProductos() {
    this.productoServicio.obtenerRegistros('productos').subscribe((data) => {
      this.productos = data;
    });
  }

  actualizarPrecioUnitario() {
    const idProducto = this.ventaForm.get('idProducto')?.value;
    const producto = this.productos.find((p) => p.idProducto === idProducto);
    if (producto) {
      const precioSeleccionado = this.aplicarDescuento
        ? producto.precioDescuento
        : producto.precio;
      this.ventaForm.patchValue({
        valorUnitario: precioSeleccionado,
        precioTotal: this.ventaForm.get('cantidad')?.value * precioSeleccionado,
      });
    }
  }

  calcularPrecioTotal() {
    const cantidad = this.ventaForm.get('cantidad')?.value;
    const valorUnitario = this.ventaForm.get('valorUnitario')?.value;
    this.ventaForm.patchValue({ precioTotal: cantidad * valorUnitario });
  }

  toggleDescuento() {
    this.aplicarDescuento = this.ventaForm.get('descuento')?.value;
    this.actualizarPrecioUnitario();
  }

  agregarRegistro() {
    if (this.ventaForm.valid) {
      this.ventaForm.get('valorUnitario')?.enable();
      this.ventaForm.get('precioTotal')?.enable();

      let datosVenta = this.ventaForm.getRawValue();


      delete datosVenta.descuento;

      console.log('Datos a enviar:', datosVenta);

      this.productoServicio
        .agregarRegistro(this.tablaSeleccionada, datosVenta)
        .subscribe({
          next: () => {
            alert('Venta agregada con éxito.');
            this.obtenerRegistros();
            this.ventaForm.reset();
            this.mostrarFormulario = false;
          },
          error: (err) => {
            alert('No se pudo guardar la venta');
            console.error('Error en la petición:', err);
          },
        });

      this.ventaForm.get('valorUnitario')?.disable();
      this.ventaForm.get('precioTotal')?.disable();
    } else {
      alert('Por favor, completa todos los campos obligatorios.');
    }
  }

  eliminarRegistro(id: string) {
    if (
      confirm(
        `¿Estás seguro de eliminar esta ${this.tablaSeleccionada.slice(0, -1)}?`
      )
    ) {
      this.productoServicio
        .eliminarRegistro(this.tablaSeleccionada, id)
        .subscribe({
          next: () => {
            this.registros = this.registros.filter((r) => r.id !== id);
            alert('Venta eliminada con éxito');
            this.obtenerRegistros();
          },
          error: () => {
            alert('No se pudo eliminar la venta');
          },
        });
    }
  }

  editarVenta(venta: any) {
    this.ventaEditando = venta.idVenta;
    this.ventaEditada = { ...venta, aplicarDescuento: false };
    // Guardamos la cantidad original para comparar después
    this.cantidadOriginal = venta.cantidad;
  }
  
  guardarEdicion() {
    if ('aplicarDescuento' in this.ventaEditada) {
      delete this.ventaEditada.aplicarDescuento;
    }
    
    // Calculamos la diferencia entre la cantidad nueva y la original
    const diferenciaCantidad = this.ventaEditada.cantidad - this.cantidadOriginal;
    
    // Primero actualizamos la venta
    this.productoServicio.editarRegistro(this.tablaSeleccionada, this.ventaEditada).subscribe({
      next: () => {
        // Si la edición de la venta fue exitosa, actualizamos el inventario
        if (diferenciaCantidad !== 0) {
          // Obtenemos el producto asociado a la venta
          this.productoServicio.buscarRegistroPorId('productos', this.ventaEditada.idProducto).subscribe({
            next: (producto) => {
              // Actualizamos la cantidad en el producto
              // Si la diferencia es positiva, se vendió más, entonces restamos al inventario
              // Si la diferencia es negativa, se vendió menos, entonces sumamos al inventario
              const productoActualizado = {
                ...producto,
                cantidad: producto.cantidad - diferenciaCantidad
              };
              
              // Actualizamos el producto en la base de datos
              this.productoServicio.editarRegistro('productos', productoActualizado).subscribe({
                next: () => {
                  alert('Venta e inventario actualizados con éxito');
                  this.ventaEditando = null;
                  this.obtenerRegistros();
                },
                error: (err) => {
                  alert('Se actualizó la venta pero no se pudo actualizar el inventario');
                  console.error('Error al actualizar inventario:', err);
                  this.ventaEditando = null;
                  this.obtenerRegistros();
                }
              });
            },
            error: (err) => {
              alert('No se pudo obtener información del producto para actualizar inventario');
              console.error('Error al obtener producto:', err);
              this.ventaEditando = null;
              this.obtenerRegistros();
            }
          });
        } else {
          // Si no hubo cambio en la cantidad, simplemente cerramos la edición
          alert('Venta editada con éxito');
          this.ventaEditando = null;
          this.obtenerRegistros();
        }
      },
      error: (err) => {
        alert('No se pudo guardar la venta editada');
        console.error('Error en la petición:', err);
      },
    });
  }
  
  cancelarEdicion() {
    this.ventaEditando = null;
    this.ventaEditada = {};
    this.cantidadOriginal = 0;
  }
  
  actualizarPrecioUnitarioEdicion() {
    const productoSeleccionado = this.productos.find(p => p.idProducto === this.ventaEditada.idProducto);
    if (productoSeleccionado) {
      this.ventaEditada.valorUnitario = this.ventaEditada.aplicarDescuento 
        ? productoSeleccionado.precioDescuento 
        : productoSeleccionado.precio;
      this.calcularPrecioTotalEdicion();
    }
  }
  
  calcularPrecioTotalEdicion() {
    this.ventaEditada.precioTotal = this.ventaEditada.cantidad * this.ventaEditada.valorUnitario;
  }
}
