import { Component } from '@angular/core';
import { ProductosService } from '../../../services/productos.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalogo',
  imports: [NgIf, NgFor, CommonModule, FormsModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent {
  registros: any[] = [];
  tablaSeleccionada: string = 'productos';
  tipoSeleccionado: string = '';
  ordenSeleccionado: string = '';
  mostrarImagenProducto = false;
  productoSeleccionado: any = null;

  tiposFiltro = [
    { valor: 'todo', nombre: 'Todo' },
    { valor: 'tornillo', nombre: 'Tornillo' },
    { valor: 'herramienta', nombre: 'Herramienta' },
    { valor: 'griferia', nombre: 'Griferia' },
    { valor: 'electrico', nombre: 'Electrico' },
    { valor: 'gas', nombre: 'Gas' },
    { valor: 'pintura', nombre: 'Pintura' },
    { valor: 'alcantarillado', nombre: 'Alcantarillado' },
    { valor: 'accesorio', nombre: 'Accesorio' },
    { valor: 'estufa', nombre: 'Estufa' },
    { valor: 'cerrajeria', nombre: 'Cerrajeria' },
    { valor: 'material', nombre: 'Material' },
  ];

  ordenNombres: { [key: string]: string } = {
    idMenor: 'ID Ascendente',
    idMayor: 'ID Descendente',
    precioMenor: 'Menor Precio',
    precioMayor: 'Mayor Precio',
    cantidadMenor: 'Menor Cantidad',
    cantidadMayor: 'Mayor Cantidad',
  };

  idProductoBuscar: string = '';
  productoEncontrado: any = null;
  productoOriginal: any = null;
  productos: any[] = [];
  productosCompletos: any[] = [];
  productosFiltrados: any[] = [];
  productosOriginales: Map<string, any> = new Map();

  constructor(private productoServicio: ProductosService) {
    this.productoServicio.selectedOption$.subscribe((option) => {
      this.tipoSeleccionado = option;
      this.cargarTabla();
    });
  }

  ngOnInit() {
    this.ordenSeleccionado = 'idMenor';
    this.cargarTabla();
  }

  obtenerProductos() {
    this.productoServicio.obtenerRegistros('productos').subscribe((data) => {
      this.productos = data;
      this.productosCompletos = [...data];
    });
  }

  filtrarProductos() {
    const texto = this.idProductoBuscar.toLowerCase();

    if (texto === '') {
      this.productosFiltrados = [];
      return;
    }

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
        .buscarRegistroPorId(this.tablaSeleccionada, this.idProductoBuscar)
        .subscribe((producto) => {
          if (producto && !producto.error && producto !== '') {
            this.productoEncontrado = { ...producto, editando: false };
            this.productoOriginal = { ...producto };
            this.idProductoBuscar = '';
            this.productosFiltrados = [];
          } else {
            this.productoServicio
              .buscarRegistrosPorNombreInicio(this.tablaSeleccionada, texto)
              .subscribe((productos) => {
                if (productos && productos.length > 0) {
                  this.productos = productos;
                  this.productosFiltrados = [];
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

  cargarTabla() {
    if (this.tipoSeleccionado === 'todo' || this.tipoSeleccionado === '') {
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

  verImagenProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.mostrarImagenProducto = true;
  }

  cerrarVistaImagen() {
    this.mostrarImagenProducto = false;
  }

  actualizarLista(id: number) {
    this.registros = this.registros.filter(
      (producto) => producto.idProducto !== id
    );
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
}
