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
    alert("Método guardarEdicion iniciado"); // Para verificar que el método se está ejecutando
    
    try {
      // Para ventas, haremos algo completamente diferente
      if (this.tablaSeleccionada === 'ventas') {
        // Construir un objeto mínimo directamente desde los valores del formulario (si estás usando un formulario)
        // o desde valores que sepamos con certeza
        const ventaMinimaData = {
          idVenta: this.ventaEditando, // Usamos el ID que guardamos al iniciar la edición
          idProducto: typeof this.ventaEditada.idProducto === 'number' ? this.ventaEditada.idProducto : parseInt(this.ventaEditada.idProducto),
          cantidad: typeof this.ventaEditada.cantidad === 'number' ? this.ventaEditada.cantidad : parseInt(this.ventaEditada.cantidad),
          valorUnitario: typeof this.ventaEditada.valorUnitario === 'number' ? this.ventaEditada.valorUnitario : parseFloat(this.ventaEditada.valorUnitario),
          precioTotal: typeof this.ventaEditada.precioTotal === 'number' ? this.ventaEditada.precioTotal : parseFloat(this.ventaEditada.precioTotal)
        };
        
        alert("Objeto ventaMinimaData creado: " + JSON.stringify(ventaMinimaData));
        
        // Usar directamente una petición HTTP en lugar del servicio
        // Esto nos permite verificar si el problema está en el servicio
        const apiURL = 'https://inventario-ferreteria-production-d9a8.up.railway.app/api/ventas/' + ventaMinimaData.idVenta;
        
        // Si prefieres seguir usando el servicio, comenta la petición fetch y descomenta la línea del servicio
        fetch(apiURL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ventaMinimaData)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error en la respuesta: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          alert('Venta editada con éxito');
          this.ventaEditando = null;
          this.obtenerRegistros();
        })
        .catch(error => {
          alert('Error en fetch: ' + error.message);
          console.error('Error en la petición fetch:', error);
        });
        
        // Alternativa usando el servicio (descomenta si prefieres usar esto)
        /*
        this.productoServicio.editarRegistro(this.tablaSeleccionada, ventaMinimaData).subscribe({
          next: () => {
            alert('Venta editada con éxito usando servicio');
            this.ventaEditando = null;
            this.obtenerRegistros();
          },
          error: (err) => {
            alert('Error usando servicio: ' + JSON.stringify(err));
            console.error('Error en la petición servicio:', err);
          },
        });
        */
      } else {
        // Para otras tablas, mantener el comportamiento original
        if ('aplicarDescuento' in this.ventaEditada) {
          delete this.ventaEditada.aplicarDescuento;
        }
        
        this.productoServicio.editarRegistro(this.tablaSeleccionada, this.ventaEditada).subscribe({
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
    } catch (error) {
      alert("Error en guardarEdicion: " + error);
      console.error("Error en guardarEdicion:", error);
    }
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
