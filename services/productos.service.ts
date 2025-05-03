import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  //URL del backend.
  private apiUrl = 'inventario-ferreteria.railway.internal';
  private productoCreadoSubject = new Subject<void>();
  private selectedOptionSource = new BehaviorSubject<string>('');
  selectedOption$ = this.selectedOptionSource.asObservable(); 

  constructor(private http: HttpClient) {}

  updateSelectedOption(option: string) {
    this.selectedOptionSource.next(option);
  }

  // Llamado cuando se crea un producto
  notificarProductoCreado() {
    this.productoCreadoSubject.next();
  }

  // Escuchado por quien necesita actualizar
  onProductoCreado(): Observable<void> {
    return this.productoCreadoSubject.asObservable();
  }

  // Obtener todos los registros de una tabla (productos o ventas)
  obtenerRegistros(tabla: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${tabla}`);
  }

  // Obtener registros por tipo (solo para productos, si aplica)
  obtenerRegistrosTipo(tabla: string, tipo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${tabla}/${tipo}`);
  }

  // Obtener registro por ID
  buscarRegistroPorId(tabla: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${tabla}/id/${id}`);
  }

  //Obtener registro por Nombre.
  buscarRegistroPorNombre(tabla: string, nombre: string): Observable<any> {
    const nombreCodificado = encodeURIComponent(nombre);
    return this.http.get<any>(`${this.apiUrl}/${tabla}/nombre/${nombreCodificado}`);
  }

  // Agregar un registro (productos o ventas)
  agregarRegistro(tabla: string, registro: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${tabla}/agregar`, registro);
  }

  // Editar un registro
  editarRegistro(tabla: string, registro: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${tabla}/editar`, registro);
  }

  // Eliminar un registro
  eliminarRegistro(tabla: string, id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${tabla}/${id}`);
  }
}
