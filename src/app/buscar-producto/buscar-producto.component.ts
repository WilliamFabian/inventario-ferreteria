import { Component, EventEmitter, Output } from '@angular/core';
import { ProductosService } from '../../../services/productos.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buscar-producto',
  templateUrl: './buscar-producto.component.html',
  styleUrls: ['./buscar-producto.component.css'],
  imports: [FormsModule, CommonModule],
})
export class BuscarProductoComponent {
  idProductoBuscar: string = '';
  productoEncontrado: any = null;
  productoOriginal: any = null;
  @Output() productoEditado = new EventEmitter<any>();
  @Output() productoEliminado = new EventEmitter<number>();
  tabla: string = 'productos';
  productos: any[] = [];
  productosCompletos: any[] = [];
  productosFiltrados: any[] = [];
  mostrarTablaMultiple: boolean = false;
  productosOriginales: Map<string, any> = new Map();

  //Para ventas.
  mostrarFormularioVenta: boolean = false;
  productoParaVender: any = null;
  cantidadVenta: number = 1;
  aplicarDescuentoVenta: boolean = false;
  valorUnitarioVenta: number = 0;
  precioTotalVenta: number = 0;

  constructor(private productoServicio: ProductosService) {}

  ngOnInit() {
    this.obtenerProductos();
    this.productoServicio.onProductoCreado().subscribe(() => {
      this.obtenerProductos();
    });
  }

  obtenerProductos() {
    this.productoServicio.obtenerRegistros('productos').subscribe((data) => {
      this.productos = data;
      this.productosCompletos = [...data]; // Guardar una copia completa
    });
  }

  filtrarProductos() {
    const texto = this.idProductoBuscar.toLowerCase();

    // Si no hay texto, limpiamos la lista de filtrados
    if (texto === '') {
      this.productosFiltrados = [];
      return;
    }

    // Siempre filtrar desde la lista completa original
    this.productosFiltrados = this.productosCompletos.filter(
      (producto) =>
        producto.idProducto.toLowerCase().includes(texto) ||
        producto.nombre.toLowerCase().includes(texto)
    );
  }

  buscarProducto() {
    const texto = this.idProductoBuscar.trim();

    if (this.idProductoBuscar !== '') {
      this.productoServicio
        .buscarRegistroPorId(this.tabla, this.idProductoBuscar)
        .subscribe((producto) => {
          if (producto && !producto.error && producto !== '') {
            this.productoEncontrado = { ...producto, editando: false };
            this.productoOriginal = { ...producto };
            this.idProductoBuscar = '';
            this.productosFiltrados = [];
            this.mostrarTablaMultiple = false;
          } else {
            this.productoServicio
              .buscarRegistrosPorNombreInicio(this.tabla, texto)
              .subscribe((productos) => {
                if (productos && productos.length > 0) {
                  this.productos = productos; // Solo cambiamos this.productos para mostrar los resultados
                  this.productosFiltrados = []; // Limpiar productos filtrados
                  this.mostrarTablaMultiple = false;
                  this.mostrarTablaMultiple = true;
                  this.productoEncontrado = null;
                  this.idProductoBuscar = '';
                } else {
                  alert('Producto no encontrado.');
                }
              });
          }
        });
    } else {
      alert('Introduzca el ID o Nombre del producto');
    }
  }

  cerrarTablaMultiple() {
    this.productos = [];
    this.mostrarTablaMultiple = false;
    this.productoEncontrado = null;
  }


// Modificar los métodos existentes para trabajar con un producto específico

activarEdicion(producto?: any) {
  // Si se proporciona un producto específico, usamos ese
  const productoObjetivo = producto || this.productoEncontrado;
  
  if (productoObjetivo) {
    // Guardamos una copia original antes de la edición
    // Usamos el ID como clave para el mapa de productos originales
    if (!this.productosOriginales) {
      this.productosOriginales = new Map();
    }
    this.productosOriginales.set(productoObjetivo.idProducto, { ...productoObjetivo });
    
    // Activamos el modo de edición para este producto específico
    productoObjetivo.editando = true;
  }
}

cancelarEdicion(producto?: any) {
  // Si se proporciona un producto específico, usamos ese
  const productoObjetivo = producto || this.productoEncontrado;
  
  if (productoObjetivo && this.productosOriginales) {
    // Recuperamos la copia original guardada de este producto
    const original = this.productosOriginales.get(productoObjetivo.idProducto);
    
    if (original) {
      // Restauramos todos los valores originales
      Object.assign(productoObjetivo, original);
      productoObjetivo.editando = false;
    }
  }
}

guardarEdicion(producto?: any) {
  // Si se proporciona un producto específico, usamos ese
  const productoObjetivo = producto || this.productoEncontrado;
  
  if (productoObjetivo) {
    // Limpiamos la propiedad editando antes de enviar al backend
    const { editando, ...productoLimpio } = productoObjetivo;
    
    console.log('Enviando al backend:', productoLimpio);
    
    this.productoServicio
      .editarRegistro(this.tabla, productoLimpio)
      .subscribe({
        next: () => {
          alert('Producto editado con éxito.');
          productoObjetivo.editando = false;
          this.productoEditado.emit(productoObjetivo);
        },
        error: (err) => {
          alert('No se pudo editar el producto.');
          console.error('Error al editar el producto:', err);
        },
      });
  }
}

eliminarProducto(producto?: any) {
  // Si se proporciona un producto específico, usamos ese
  const productoObjetivo = producto || this.productoEncontrado;
  
  if (
    productoObjetivo &&
    confirm('¿Estás seguro de eliminar este producto?')
  ) {
    this.productoServicio
      .eliminarRegistro(this.tabla, productoObjetivo.idProducto)
      .subscribe({
        next: () => {
          alert('Producto eliminado con éxito.');
          this.productoEliminado.emit(productoObjetivo.idProducto);
          
          // Si es el mismo que productoEncontrado, lo limpiamos
          if (productoObjetivo === this.productoEncontrado) {
            this.productoEncontrado = null;
          }
          
          // Si está en la lista de productos, lo removemos
          const index = this.productos.findIndex(p => p.idProducto === productoObjetivo.idProducto);
          if (index !== -1) {
            this.productos.splice(index, 1);
          }
          
          // También lo removemos de la lista completa
          const indexCompleto = this.productosCompletos.findIndex(p => p.idProducto === productoObjetivo.idProducto);
          if (indexCompleto !== -1) {
            this.productosCompletos.splice(indexCompleto, 1);
          }
        },
        error: (err) => {
          console.error('Error al eliminar el producto:', err);
          alert('No se pudo eliminar el producto.');
        },
        complete: () => console.log('Eliminación completada'),
      });
  }
}

//Para ventas.
  venderProducto(producto?: any) {
    // Si se proporciona un producto específico, usamos ese
    this.productoParaVender = producto || this.productoEncontrado;
    
    if (this.productoParaVender) {
      this.mostrarFormularioVenta = true;
      this.cantidadVenta = 1;
      this.aplicarDescuentoVenta = false;
      this.actualizarPrecioUnitarioVenta();
    }
  }

  actualizarPrecioUnitarioVenta() {
    if (this.productoParaVender) {
      this.valorUnitarioVenta = this.aplicarDescuentoVenta && this.productoParaVender.precioDescuento 
        ? this.productoParaVender.precioDescuento 
        : this.productoParaVender.precio;
      this.calcularPrecioTotalVenta();
    }
  }

  calcularPrecioTotalVenta() {
    this.precioTotalVenta = this.cantidadVenta * this.valorUnitarioVenta;
  }

  toggleDescuentoVenta() {
    this.aplicarDescuentoVenta = !this.aplicarDescuentoVenta;
    this.actualizarPrecioUnitarioVenta();
  }

  guardarVenta() {
    if (this.cantidadVenta <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    if (this.cantidadVenta > this.productoParaVender.cantidad) {
      alert('No hay suficiente stock disponible. Stock actual: ' + this.productoParaVender.cantidad);
      return;
    }

    const datosVenta = {
      idProductoVenta: this.productoParaVender.idProducto,
      cantidad: this.cantidadVenta,
      valorUnitario: this.valorUnitarioVenta,
      precioTotal: this.precioTotalVenta
    };

    this.productoServicio.agregarRegistro('ventas', datosVenta).subscribe({
      next: () => {
        alert('Venta realizada con éxito');
        // Actualizar el stock del producto
        this.productoParaVender.cantidad -= this.cantidadVenta;
        this.guardarEdicion(this.productoParaVender);
        this.cerrarFormularioVenta();
      },
      error: (err) => {
        alert('No se pudo realizar la venta');
        console.error('Error al realizar la venta:', err);
      }
    });
  }

  cerrarFormularioVenta() {
    this.mostrarFormularioVenta = false;
    this.productoParaVender = null;
  }

}
