import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { InfoInicialResponse } from "@/features/info-inicial/interfaces/info-inicial.interface";

export interface PagoGastoFijoRequest {
  montoPago: number;
  pagado: boolean;
}

export interface PagoLite {
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
  montoFijo: string;
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