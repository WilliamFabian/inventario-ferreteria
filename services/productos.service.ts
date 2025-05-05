import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {

  private apiUrl = 'https://inventario-ferreteria-production-d9a8.up.railway.app/api';
  private productoCreadoSubject = new Subject<void>();
  private selectedOptionSource = new BehaviorSubject<string>('');
  selectedOption$ = this.selectedOptionSource.asObservable(); 

  constructor(private http: HttpClient) {}

  updateSelectedOption(option: string) {
    this.selectedOptionSource.next(option);
  }

  notificarProductoCreado() {
    this.productoCreadoSubject.next();
  }

  onProductoCreado(): Observable<void> {
    return this.productoCreadoSubject.asObservable();
  }

  obtenerRegistros(tabla: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${tabla}`);
  }

  obtenerRegistrosTipo(tabla: string, tipo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${tabla}/${tipo}`);
  }

  buscarRegistroPorId(tabla: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${tabla}/id/${id}`);
  }

  buscarRegistroPorNombre(tabla: string, nombre: string): Observable<any> {
    const nombreCodificado = encodeURIComponent(nombre);
    return this.http.get<any>(`${this.apiUrl}/${tabla}/nombre/${nombreCodificado}`);
  }

  agregarRegistro(tabla: string, registro: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${tabla}/agregar`, registro);
  }

  editarRegistro(tabla: string, registro: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${tabla}/editar`, registro);
  }

  eliminarRegistro(tabla: string, id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${tabla}/${id}`);
  }
}
