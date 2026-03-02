import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { MedioPago } from "@/features/medio-pago/interfaces/medio-pago.interface";

export interface PagoGastoFijoRequest {
  /** Opcional: si no se envía y el gasto tiene montoFijo > 0, el backend usa montoFijo automáticamente. */
  montoPago?: number;
  medioPagoId?: number;
  pagado: boolean;
}

export interface PagoLite {
  /** Presente si ya existe registro de pago para ese mes; undefined si aún no se creó. */
  id?: number;
  montoPago: number;
  pagado: boolean;
  medioPago?: MedioPago;
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
  montoFijo: string | number;
  activo?: boolean;
  categoria: Categoria;
  esDebitoAutomatico: boolean;
  medioPago?: MedioPago;
}

export interface PagoGastoFijoPorGastoFijoResponse {
  gastoFijo: GastoFijoEnPago;
  pago: PagoLite;
}

/** Respuesta simplificada para pagos de gastos fijos por mes (sin info inicial). */
export interface PagoGastoFijoPorMesResponse {
  pagos: PagoGastoFijoPorGastoFijoResponse[];
}

export interface PagoGastoFijoByIdResponse {
  id: number;
  gastoFijo: GastoFijoEnPago;
  montoPago: number | string;
  pagado: boolean;
}