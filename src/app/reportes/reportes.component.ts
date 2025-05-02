import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../../services/productos.service';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';

interface Reporte {
  idReporte: number;
  tipoReporte: string;
  valorMensual: number;
  fecha: string;
}

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
  imports: [NgFor, CommonModule],
})
export class ReportesComponent implements OnInit {
  reportes: Reporte[] = [];

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    this.obtenerReportes();
  }

  obtenerReportes(): void {
    this.productosService.obtenerRegistros('reportes').subscribe({
      next: (data) => {
        this.reportes = data.sort((a: any, b: any) => {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });
      },
      error: (err) => {
        console.error('Error al obtener los reportes:', err);
      }
    });
  }
  
}
