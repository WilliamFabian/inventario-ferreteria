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
      this.registros = data.sort(
        (a: any, b: any) =>
          new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime()
      );
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
    this.ventaOriginal = JSON.parse(JSON.stringify(venta));
    this.ventaEditando = venta.idVenta;
    this.ventaEditada = { ...venta, aplicarDescuento: false };
    console.log(
      'Iniciando edición. Venta original guardada:',
      this.ventaOriginal
    );
  }

  guardarEdicion() {
    try {
      console.log('Guardando edición...');
      console.log('Venta original:', this.ventaOriginal);
      console.log('Venta editada:', this.ventaEditada);

      if ('aplicarDescuento' in this.ventaEditada) {
        delete this.ventaEditada.aplicarDescuento;
      }

      // Verificamos si la cantidad ha cambiado
      const cantidadOriginal = this.ventaOriginal.cantidad;
      const cantidadNueva = this.ventaEditada.cantidad;
      const idProducto = this.ventaOriginal.idProducto;

      console.log(
        `Cantidad original: ${cantidadOriginal}, Cantidad nueva: ${cantidadNueva}, ID Producto: ${idProducto}`
      );

      // Si la cantidad cambió
      if (cantidadNueva !== cantidadOriginal && idProducto) {
        console.log('La cantidad ha cambiado. Actualizando inventario...');

        // Primero buscamos el producto para obtener su inventario actual
        this.productoServicio
          .buscarRegistroPorId('productos', idProducto)
          .subscribe({
            next: (producto) => {
              console.log('Producto encontrado:', producto);

              // Calculamos el ajuste al inventario
              // Si vendemos más ahora (cantidadNueva > cantidadOriginal), debemos restar más del inventario
              // Si vendemos menos ahora (cantidadNueva < cantidadOriginal), debemos devolver al inventario
              const ajusteInventario = cantidadOriginal - cantidadNueva;
              const nuevoInventario = producto.cantidad + ajusteInventario;

              console.log(
                `Ajuste al inventario: ${ajusteInventario}, Nuevo inventario será: ${nuevoInventario}`
              );

              // Actualizamos el producto con el nuevo inventario
              const productoActualizado = {
                ...producto,
                cantidad: nuevoInventario,
              };

              // Actualizamos el producto primero
              this.productoServicio
                .editarRegistro('productos', productoActualizado)
                .subscribe({
                  next: (respProducto) => {
                    console.log(
                      'Inventario actualizado correctamente:',
                      respProducto
                    );

                    // Ahora actualizamos la venta
                    this.productoServicio
                      .editarRegistro(this.tablaSeleccionada, this.ventaEditada)
                      .subscribe({
                        next: (respVenta) => {
                          console.log(
                            'Venta actualizada correctamente:',
                            respVenta
                          );
                          alert('Venta e inventario actualizados con éxito');
                          this.ventaEditando = null;
                          this.ventaOriginal = null;
                          this.obtenerRegistros();
                        },
                        error: (err) => {
                          console.error('Error al actualizar la venta:', err);
                          alert(
                            'No se pudo actualizar la venta. Revirtiendo cambios en inventario.'
                          );

                          // Revertimos el cambio en el inventario
                          this.productoServicio
                            .editarRegistro('productos', producto)
                            .subscribe();
                        },
                      });
                  },
                  error: (err) => {
                    console.error('Error al actualizar el inventario:', err);
                    alert('No se pudo actualizar el inventario del producto');
                  },
                });
            },
            error: (err) => {
              console.error('Error al buscar el producto:', err);
              alert('No se pudo obtener la información del producto');
            },
          });
      } else {
        // Si no cambió la cantidad, solo actualizamos la venta
        console.log('La cantidad no cambió. Solo actualizando la venta.');

        this.productoServicio
          .editarRegistro(this.tablaSeleccionada, this.ventaEditada)
          .subscribe({
            next: (resp) => {
              console.log('Venta actualizada correctamente:', resp);
              alert('Venta editada con éxito');
              this.ventaEditando = null;
              this.ventaOriginal = null;
              this.obtenerRegistros();
            },
            error: (err) => {
              console.error('Error al actualizar la venta:', err);
              alert('No se pudo guardar la venta editada');
            },
          });
      }
    } catch (error) {
      console.error('Error en guardarEdicion:', error);
      alert('Ocurrió un error al procesar la edición');
    }
  }

  cancelarEdicion() {
    console.log('Cancelando edición');
    this.ventaEditando = null;
    this.ventaEditada = {};
    this.ventaOriginal = null;
  }

  actualizarPrecioUnitarioEdicion() {
    const productoSeleccionado = this.productos.find(
      (p) => p.idProducto === this.ventaEditada.idProducto
    );
    if (productoSeleccionado) {
      this.ventaEditada.valorUnitario = this.ventaEditada.aplicarDescuento
        ? productoSeleccionado.precioDescuento
        : productoSeleccionado.precio;
      this.calcularPrecioTotalEdicion();
    }
  }

  calcularPrecioTotalEdicion() {
    this.ventaEditada.precioTotal =
      this.ventaEditada.cantidad * this.ventaEditada.valorUnitario;
  }
}
