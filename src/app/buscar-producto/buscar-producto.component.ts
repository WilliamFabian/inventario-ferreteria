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
  productosCompletos: any[] = []; // Nueva variable para la lista completa
  productosFiltrados: any[] = [];
  mostrarTablaMultiple: boolean = false;

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

  activarEdicion() {
    if (this.productoEncontrado) {
      this.productoOriginal = { ...this.productoEncontrado };
      this.productoEncontrado.editando = true;
    }
  }

  cancelarEdicion() {
    if (this.productoOriginal) {
      this.productoEncontrado = { ...this.productoOriginal };
      this.productoEncontrado.editando = false;
    }
  }

  guardarEdicion() {
    if (this.productoEncontrado) {
      const { editando, ...productoLimpio } = this.productoEncontrado;

      console.log('Enviando al backend:', productoLimpio);

      this.productoServicio
        .editarRegistro(this.tabla, productoLimpio)
        .subscribe({
          next: () => {
            alert('Producto editado con éxito.');
            this.productoEncontrado.editando = false;
            this.productoEditado.emit(this.productoEncontrado);
          },
          error: (err) => {
            alert('No se pudo editar el producto.');
            console.error('Error al editar el producto:', err);
          },
        });
    }
  }

  eliminarProducto() {
    if (
      this.productoEncontrado &&
      confirm('¿Estás seguro de eliminar este producto?')
    ) {
      this.productoServicio
        .eliminarRegistro(this.tabla, this.productoEncontrado.idProducto)
        .subscribe({
          next: () => {
            alert('Producto eliminado con éxito.');
            this.productoEliminado.emit(this.productoEncontrado.idProducto);
            this.productoEncontrado = null;
          },
          error: (err) => {
            console.error('Error al eliminar el producto:', err);
            alert('No se pudo eliminar el producto.');
          },
          complete: () => console.log('Eliminación completada'),
        });
    }
  }

  cerrarProductoEncontrado() {
    this.productoEncontrado = null;
    this.mostrarTablaMultiple = false;
  }
}
