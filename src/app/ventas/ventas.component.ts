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
  }
  
  guardarEdicion() {
    // Eliminar aplicarDescuento si existe
    if ('aplicarDescuento' in this.ventaEditada) {
      delete this.ventaEditada.aplicarDescuento;
    }
    
    // Crear un objeto para enviar dependiendo de la tabla
    let datosParaEnviar: any;
    
    if (this.tablaSeleccionada === 'ventas') {
      // Para ventas, crear un objeto nuevo con solo los campos necesarios
      // esto evita enviar campos de fecha problemáticos
      datosParaEnviar = {
        idVenta: this.ventaEditada.idVenta,
        idProducto: this.ventaEditada.idProducto,
        cantidad: this.ventaEditada.cantidad,
        valorUnitario: this.ventaEditada.valorUnitario,
        precioTotal: this.ventaEditada.precioTotal
        // No incluir fechaVenta ni ningún otro campo de tipo fecha
      };
    } else {
      // Para otras tablas, usar el objeto completo
      datosParaEnviar = this.ventaEditada;
    }
    
    // Usar el objeto adecuado según la tabla
    this.productoServicio.editarRegistro(this.tablaSeleccionada, datosParaEnviar).subscribe({
      next: () => {
        alert('Registro editado con éxito');
        this.ventaEditando = null;
        this.obtenerRegistros();
      },
      error: (err) => {
        alert('No se pudo guardar el registro editado');
        console.error('Error en la petición:', err);
      },
    });
  }
  
  cancelarEdicion() {
    this.ventaEditando = null;
    this.ventaEditada = {};
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
