export interface DashboardPresupuestoItem {
  categoria: string;
  presupuesto: number;
  gastado: number;
  restante: number;
  porcentaje: number;
  estado: 'OK' | 'ALERTA' | 'EXCEDIDO';
}

export interface DashboardMovimientoItem {
  descripcion: string;
  monto: number;
  tipo: 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA' | 'SALDO_INICIAL';
  fecha: string;
}

export interface DashboardResumenResponse {
  saldoTotal: number;
  ingresosMes: number;
  egresosMes: number;
  balanceMes: number;
  topCategoriasGasto: { categoria: string; total: number }[];
  gastosPorCategoria: { categoria: string; total: number }[];
  gastosPorCuenta: { cuenta: string; total: number }[];
  ultimosMovimientos: DashboardMovimientoItem[];
  presupuestos: DashboardPresupuestoItem[];
  alertas: string[];
}

