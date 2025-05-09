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
    });
  }

  filtrarProductos() {
    //recuperar
    const texto = this.idProductoBuscar.toLowerCase();
    this.productosFiltrados = this.productos.filter(
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
          } else {
            this.productoServicio
              .buscarRegistrosPorNombreInicio(this.tabla, texto)
              .subscribe((productos) => {
                if (productos && productos.length > 0) {
                  this.productos = productos;
                  this.productosFiltrados = []; // ✅ limpiar productos filtrados anteriores
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
  }
}
