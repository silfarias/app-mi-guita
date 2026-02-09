import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { InfoInicialResponse } from "@/features/info-inicial/interfaces/info-inicial.interface";

export interface PagoGastoFijoRequest {
  /** Opcional: si no se envía y el gasto tiene montoFijo > 0, el backend usa montoFijo automáticamente. */
  montoPago?: number;
  pagado: boolean;
}

export interface PagoLite {
  /** Presente si ya existe registro de pago para ese mes; undefined si aún no se creó. */
  id?: number;
  montoPago: number;
  pagado: boolean;
}

export interface PagoGastoFijoResponse {
  id: number;
  gastoFijoId: number;
  infoInicialId: number;
  montoPago: number;
  pagado: boolean;
}

export interface GastoFijoEnPago {
  id: number;
  nombre: string;
  /** Backend puede devolver number o string. */
  montoFijo: string | number;
  activo?: boolean;
  categoria: Categoria;
}

export interface PagoGastoFijoPorGastoFijoResponse {
  gastoFijo: GastoFijoEnPago;
  pago: PagoLite;
}

export interface PagoGastoFijoPorInfoInicialResponse {
  infoInicial: InfoInicialResponse;
  pagos: PagoGastoFijoPorGastoFijoResponse[];
}

export interface PagoGastoFijoByIdResponse {
  id: number;
  gastoFijo: GastoFijoEnPago;
  infoInicial: InfoInicialResponse;
  montoPago: string;
  pagado: boolean;
}