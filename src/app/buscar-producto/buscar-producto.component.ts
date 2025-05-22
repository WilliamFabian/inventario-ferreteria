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

  mostrarFormularioVenta: boolean = false;
  productoParaVender: any = null;
  cantidadVenta!: number;
  aplicarDescuentoVenta: boolean = false;
  valorUnitarioVenta: number = 0;
  precioTotalVenta: number = 0;

  //Imagen.
  formularioImagenVisible: boolean = false;
  productoSeleccionado: any = null;
  imagenSeleccionada: File | null = null;
  nombreImagenSeleccionada: string | null = null;
  mostrarImagenProducto = false;

  tipos = [
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
    {valor: 'material', nombre: 'Material'},
  ];

  constructor(private productoServicio: ProductosService) {}

  ngOnInit() {
    this.obtenerProductos();
    this.productoServicio.onProductoCreado().subscribe(() => {
      this.obtenerProductos();
    });
  }

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      this.nombreImagenSeleccionada = file.name;
    }
  }

  subirImagen() {
    // Verificar que se haya seleccionado una imagen y un producto
    if (!this.imagenSeleccionada || !this.productoSeleccionado) {
      alert('Selecciona una imagen y un producto.');
      return;
    }

    // Crear un FormData con la imagen seleccionada
    const formData = new FormData();
    formData.append('file', this.imagenSeleccionada);
    formData.append('upload_preset', 'inventario-ferreteria'); // Tu preset
    formData.append('cloud_name', 'dsdnkc3eb'); // Tu cloud name
    formData.append('folder', 'productos'); // Carpeta en Cloudinary

    // Subir la imagen a Cloudinary
    fetch('https://api.cloudinary.com/v1_1/dsdnkc3eb/image/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        // Obtener la URL de la imagen subida
        const urlImagen = data.secure_url;

        // Excluir la propiedad 'editando' del producto
        const { editando, ...productoSinEditando } = this.productoSeleccionado;

        // Crear el objeto actualizado con la nueva URL de la imagen
        const productoActualizado = {
          ...productoSinEditando,
          imagen: urlImagen,
        };

        // Llamar al servicio para actualizar el producto con la imagen
        this.productoServicio
          .editarRegistro('productos', productoActualizado)
          .subscribe({
            next: () => {
              alert('Imagen subida y asociada al producto.');
              this.obtenerProductos(); // Recargar los productos
              this.cerrarFormularioImagen(); // Cerrar el formulario de imagen
            },
            error: (err) => {
              alert('Error al guardar la imagen en el producto.');
              console.error(err);
            },
          });
      })
      .catch((error) => {
        alert('Error al subir la imagen a Cloudinary.');
        console.error(error);
      });
  }

  verImagenProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.mostrarImagenProducto = true;
  }

  cerrarVistaImagen() {
    this.mostrarImagenProducto = false;
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
                  this.productos = productos;
                  this.productosFiltrados = [];
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

  activarEdicion(producto?: any) {
    const productoObjetivo = producto || this.productoEncontrado;

    if (productoObjetivo) {
      if (!this.productosOriginales) {
        this.productosOriginales = new Map();
      }
      this.productosOriginales.set(productoObjetivo.idProducto, {
        ...productoObjetivo,
      });

      productoObjetivo.editando = true;
    }
  }

  cancelarEdicion(producto?: any) {
    const productoObjetivo = producto || this.productoEncontrado;

    if (productoObjetivo && this.productosOriginales) {
      const original = this.productosOriginales.get(
        productoObjetivo.idProducto
      );

      if (original) {
        Object.assign(productoObjetivo, original);
        productoObjetivo.editando = false;
      }
    }
  }

  guardarEdicion(producto?: any) {
    const productoObjetivo = producto || this.productoEncontrado;

    if (productoObjetivo) {
      const { editando, ...productoLimpio } = productoObjetivo;

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
          },
        });
    }
  }

  eliminarProducto(producto?: any) {
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

            if (productoObjetivo === this.productoEncontrado) {
              this.productoEncontrado = null;
            }

            const index = this.productos.findIndex(
              (p) => p.idProducto === productoObjetivo.idProducto
            );
            if (index !== -1) {
              this.productos.splice(index, 1);
            }

            const indexCompleto = this.productosCompletos.findIndex(
              (p) => p.idProducto === productoObjetivo.idProducto
            );
            if (indexCompleto !== -1) {
              this.productosCompletos.splice(indexCompleto, 1);
            }
          },
          error: (err) => {
            alert('No se pudo eliminar el producto.');
          },
          complete: () => console.log('Eliminación completada'),
        });
    }
  }

  //Para ventas.
  venderProducto(producto?: any) {
    this.productoParaVender = producto || this.productoEncontrado;

    if (this.productoParaVender) {
      this.mostrarFormularioVenta = true;
      this.aplicarDescuentoVenta = false;
      this.actualizarPrecioUnitarioVenta();
    }
  }

  actualizarPrecioUnitarioVenta() {
    if (this.productoParaVender) {
      if (
        this.aplicarDescuentoVenta &&
        this.productoParaVender.precioDescuento
      ) {
        this.valorUnitarioVenta = Number(
          this.productoParaVender.precioDescuento
        );
      } else {
        this.valorUnitarioVenta = Number(this.productoParaVender.precio);
      }

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
      alert(
        'No hay suficiente stock disponible. Stock actual: ' +
          this.productoParaVender.cantidad
      );
      return;
    }

    const datosVenta = {
      idProductoVenta: this.productoParaVender.idProducto,
      cantidad: this.cantidadVenta,
      valorUnitario: this.valorUnitarioVenta,
      precioTotal: this.precioTotalVenta,
    };

    this.productoServicio.agregarRegistro('ventas', datosVenta).subscribe({
      next: () => {
        alert('Venta realizada con éxito');

        this.productoParaVender.cantidad -= this.cantidadVenta;
        this.guardarEdicion(this.productoParaVender);
        this.cerrarFormularioVenta();
      },
      error: (err) => {
        alert('No se pudo realizar la venta');
      },
    });
  }

  cerrarFormularioVenta() {
    this.mostrarFormularioVenta = false;
    this.productoParaVender = null;
  }

  //Imagen.
  mostrarFormularioImagen(producto: any) {
    this.productoSeleccionado = producto;
    this.formularioImagenVisible = true;
    this.imagenSeleccionada = null;
    this.nombreImagenSeleccionada = null;
  }

  cerrarFormularioImagen() {
    this.formularioImagenVisible = false;
    this.productoSeleccionado = null;
    this.imagenSeleccionada = null;
    this.nombreImagenSeleccionada = null;
  }
}
