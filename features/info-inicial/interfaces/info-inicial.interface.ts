import { Usuario } from "@/features/auth/interfaces/usuario.interface";
import { MedioPagoElemento } from "@/features/medio-pago/interfaces/medio-pago.interface";
import { SearchResponse } from "@/types/api.types";

export interface MedioPagoInfoInicial {
  medioPagoId: number;
  monto: number;
}

export interface InfoInicialRequest {
  anio: number;
  mes: string;
  mediosPago: MedioPagoInfoInicial[];
}

/** Usuario tal como lo devuelve el endpoint de info inicial (sin persona) */
export type UsuarioInfoInicial = Omit<Usuario, "persona">;

export interface InfoInicialResponse {
  id: number;
  usuario: UsuarioInfoInicial;
  anio: number;
  mes: string;
  mediosPago: MedioPagoElemento[];
  montoTotal: number;
}

export type InfoInicialPorUsuarioResponse = SearchResponse<InfoInicialResponse>;