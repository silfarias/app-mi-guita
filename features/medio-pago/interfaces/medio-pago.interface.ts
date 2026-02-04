import { SearchMetadata, SearchResponse } from "@/types/api.types";

export enum TipoMedioPago {
  BILLETERA_VIRTUAL = 'BILLETERA_VIRTUAL',
  BANCO = 'BANCO',
}

export interface MedioPago {
  id: number;
  nombre: string;
  tipo: TipoMedioPago;
}

export interface MedioPagoSearchParams {
  id?: number;
  nombre?: string;
  tipo?: TipoMedioPago | string;
}

export type MedioPagoSearchResponse = SearchResponse<MedioPago>;
export type MedioPagoSearchMetadata = SearchMetadata;
