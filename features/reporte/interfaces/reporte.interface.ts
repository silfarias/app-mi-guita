import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { MedioPago } from "@/features/medio-pago/interfaces/medio-pago.interface";

export interface ReporteMensualParams {
  anio: number;
  mes: string;
}

export interface SaldoPorMedioPago {
  medioPago: MedioPago;
  saldoInicial: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoActual: number;
}

export interface ResumenPorCategoria {
  categoria: Categoria;
  total: number;
  porcentaje: number;
  cantidadMovimientos: number;
}

export interface ResumenPorMedioPago {
  medioPago: MedioPago;
  totalMovido: number;
  totalIngresos: number;
  totalEgresos: number;
  porcentajeMovimientos: number;
}

export interface ComparacionMesAnterior {
  variacionIngresos: number;
  variacionEgresos: number;
  variacionBalance: number;
}

export interface ReporteMensualResponse {
  anio: number;
  mes: string;
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  saldosPorMedioPago: SaldoPorMedioPago[];
  balanceTotal: number;
  resumenPorCategoria: ResumenPorCategoria[];
  top5Categorias: ResumenPorCategoria[];
  resumenPorMedioPago: ResumenPorMedioPago[];
  comparacionMesAnterior: ComparacionMesAnterior;
}
