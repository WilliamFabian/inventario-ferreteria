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
  ventaOriginal: any = null;

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
    // Guardamos una copia completa de la venta original
    this.ventaOriginal = {...venta};
    this.ventaEditando = venta.idVenta;
    this.ventaEditada = { ...venta, aplicarDescuento: false };
  }
  
  guardarEdicion() {
    if ('aplicarDescuento' in this.ventaEditada) {
      delete this.ventaEditada.aplicarDescuento;
    }
    
    // Calculamos la diferencia entre la cantidad nueva y la original
    const diferenciaCantidad = this.ventaEditada.cantidad - this.ventaOriginal.cantidad;
    
    // Solo si cambió la cantidad, actualizamos el inventario
    if (diferenciaCantidad !== 0 && this.ventaOriginal.idProducto) {
      // Buscamos el producto para obtener su cantidad actual
      this.productoServicio.buscarRegistroPorId('productos', this.ventaOriginal.idProducto).subscribe({
        next: (producto) => {
          if (producto) {
            // Calculamos el nuevo inventario
            // Si diferenciaCantidad es positivo, se vendió más, entonces restamos al inventario
            // Si diferenciaCantidad es negativo, se vendió menos, entonces sumamos al inventario
            const nuevoInventario = producto.cantidad - diferenciaCantidad;
            
            // Actualizamos el producto con el nuevo inventario
            const productoActualizado = {
              ...producto,
              cantidad: nuevoInventario
            };
            
            // Primero actualizamos el inventario
            this.productoServicio.editarRegistro('productos', productoActualizado).subscribe({
              next: () => {
                // Luego actualizamos la venta
                this.productoServicio.editarRegistro(this.tablaSeleccionada, this.ventaEditada).subscribe({
                  next: () => {
                    alert('Venta e inventario actualizados con éxito');
                    this.ventaEditando = null;
                    this.ventaOriginal = null;
                    this.obtenerRegistros();
                  },
                  error: (err) => {
                    alert('Se actualizó el inventario pero no se pudo actualizar la venta');
                    console.error('Error al actualizar venta:', err);
                    // Revertimos el cambio en el inventario
                    this.productoServicio.editarRegistro('productos', producto).subscribe();
                  }
                });
              },
              error: (err) => {
                alert('No se pudo actualizar el inventario del producto');
                console.error('Error al actualizar inventario:', err);
              }
            });
          } else {
            alert('No se encontró el producto asociado a esta venta');
            console.error('Producto no encontrado');
          }
        },
        error: (err) => {
          alert('Error al buscar el producto');
          console.error('Error en la petición:', err);
        }
      });
    } else {
      // Si no cambió la cantidad o no hay idProducto, solo actualizamos la venta
      this.productoServicio.editarRegistro(this.tablaSeleccionada, this.ventaEditada).subscribe({
        next: () => {
          alert('Venta editada con éxito');
          this.ventaEditando = null;
          this.ventaOriginal = null;
          this.obtenerRegistros();
        },
        error: (err) => {
          alert('No se pudo guardar la venta editada');
          console.error('Error en la petición:', err);
        }
      });
    }
  }
  
  cancelarEdicion() {
    this.ventaEditando = null;
    this.ventaEditada = {};
    this.ventaOriginal = null;
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
