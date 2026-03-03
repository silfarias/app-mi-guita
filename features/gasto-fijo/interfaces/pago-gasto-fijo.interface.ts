import { Categoria } from "@/features/categoria/interfaces/categoria.interface";

export interface PagoGastoFijoRequest {
  /** Monto del pago (PATCH espera "monto"). */
  monto: number;
  pagado: boolean;
  cuentaId: number;
}

export interface PagoLite {
  /** Presente si ya existe registro de pago para ese mes; undefined si aún no se creó. */
  id?: number;
  /** Monto del pago (endpoint por-mes devuelve "monto"). */
  monto?: number;
  /** Alternativa: mismo valor (otros endpoints pueden devolver "montoPago"). */
  montoPago?: number;
  pagado: boolean;
}

export interface PagoGastoFijoResponse {
  id: number;
  gastoFijoId: number;
  montoPago: number;
  pagado: boolean;
}

export interface GastoFijoEnPago {
  id: number;
  nombre: string;
  /** API por-mes devuelve montoEstimado. */
  montoEstimado?: number;
  diaVencimiento?: string;
  /** Compatibilidad con respuestas que envían montoFijo. */
  montoFijo?: string | number;
  activo?: boolean;
  categoria: Categoria;
  esDebitoAutomatico: boolean;
}

export interface PagoGastoFijoPorGastoFijoResponse {
  gastoFijo: GastoFijoEnPago;
  pago: PagoLite;
}

/** Respuesta del endpoint GET /pago-gasto-fijo/por-mes (anio, mes, pagos). */
export interface PagoGastoFijoPorMesResponse {
  anio?: number;
  mes?: string;
  pagos: PagoGastoFijoPorGastoFijoResponse[];
}

export interface PagoGastoFijoByIdResponse {
  id: number;
  gastoFijo: GastoFijoEnPago;
  mes?: string;
  anio?: number;
  monto: number;
  pagado: boolean;
}