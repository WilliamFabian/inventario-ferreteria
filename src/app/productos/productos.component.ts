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
  selectedFile: File | null = null;
  mostrarImagenProducto = false;
  productoSeleccionado: any = null;

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
    {valor: 'material', nombre: 'Material'},
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
    if (this.tipoSeleccionado === 'todo' || this.tipoSeleccionado === '') {
      this.obtenerRegistros();
    } else {
      this.obtenerProductosTipo();
    }
  }

  //Cloudinary.
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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
      // Si es productos y hay imagen, subimos a Cloudinary
      if (this.tablaSeleccionada === 'productos' && this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('upload_preset', 'inventario-ferreteria'); // Reemplaza con tu preset
        formData.append('cloud_name', 'dsdnkc3eb'); // Reemplaza con tu cloud name

        // Subir imagen a Cloudinary
        fetch('https://api.cloudinary.com/v1_1/dsdnkc3eb/image/upload', {
          method: 'POST',
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            // Agregar la URL de la imagen al formulario
            const datosConImagen = {
              ...form.value,
              imagen: data.secure_url,
            };

            this.productoServicio
              .agregarRegistro(this.tablaSeleccionada, datosConImagen)
              .subscribe({
                next: (response) => {
                  alert(`Producto agregado con éxito.`);
                  this.cargarTabla();
                  this.productoServicio.notificarProductoCreado();
                  form.reset();
                  this.selectedFile = null; // limpiar imagen
                  this.mostrarFormulario = false;
                },
                error: (err) => {
                  alert(
                    `No se pudo agregar el ${this.tablaSeleccionada.slice(
                      0,
                      -1
                    )}.`
                  );
                  console.error(
                    `Error al agregar ${this.tablaSeleccionada}:`,
                    err
                  );
                },
              });
          })
          .catch((error) => {
            alert('Error al subir la imagen.');
            console.error('Cloudinary error:', error);
          });
      } else {
        // Si no es productos o no hay imagen, se usa la lógica original
        this.productoServicio
          .agregarRegistro(this.tablaSeleccionada, form.value)
          .subscribe({
            next: (response) => {
              alert(`Registro agregado con éxito.`);
              this.cargarTabla();
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
      }
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
