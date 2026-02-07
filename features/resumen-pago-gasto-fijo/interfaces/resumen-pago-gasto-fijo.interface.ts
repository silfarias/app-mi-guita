import { UsuarioInfoInicial } from "@/features/info-inicial/interfaces/info-inicial.interface";
import { MedioPagoElemento } from "@/features/medio-pago/interfaces/medio-pago.interface";

export interface InfoInicialResumen {
  id: number;
  anio: number;
  mes: string;
  mediosPago: MedioPagoElemento[];
  montoTotal: number;
}

export interface ResumenPagoGastoFijoResponse {
  id: number;
  infoInicial: InfoInicialResumen;
  usuario: UsuarioInfoInicial;
  montoTotal: string;
  montoPagado: string;
  cantidadGastosTotales: number;
  cantidadGastosPagados: number;
  montoPendiente: number;
  porcentajePagado: number;
}
