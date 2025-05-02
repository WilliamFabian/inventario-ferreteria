import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { ProductosComponent } from './productos/productos.component';
import { VentasComponent } from './ventas/ventas.component';
import { ReportesComponent } from './reportes/reportes.component';
import { TrabajosComponent } from './trabajos/trabajos.component';

export const routes: Routes = [
  { path: '', redirectTo: '/menu', pathMatch: 'full' }, // Redirige al menú por defecto
  { path: 'menu', component: MenuComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'ventas', component: VentasComponent },
  {path: 'reportes', component: ReportesComponent},
  {path: 'trabajos', component: TrabajosComponent},
];
