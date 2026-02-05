import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { InfoInicialResponse } from "@/features/info-inicial/interfaces/info-inicial.interface";
import { MedioPago } from "@/features/medio-pago/interfaces/medio-pago.interface";
import { SearchMetadata, SearchResponse } from "@/types/api.types";

export enum TipoMovimientoEnum {
    INGRESO = 'INGRESO',
    EGRESO = 'EGRESO',
}

export interface MovimientoRequest {
    infoInicialId: number;
    fecha: string;
    tipoMovimiento: TipoMovimientoEnum;
    descripcion: string;
    categoriaId: number;
    monto: number;
    medioPagoId: number;
}

export interface MovimientoResponse {
    infoInicial: InfoInicialResponse;
    fecha: string;
    tipoMovimiento: TipoMovimientoEnum;
    categoria: Categoria;
    descripcion: string;
    monto: number;
    medioPago: MedioPago;
}

export interface MovimientoListItem {
    id: number;
    fecha: string;
    tipoMovimiento: TipoMovimientoEnum;
    categoria: Categoria;
    descripcion: string;
    monto: string;
    medioPago: MedioPago;
}

export interface MovimientosPorInfoResponse {
    infoInicial: InfoInicialResponse;
    movimientos: MovimientoListItem[];
}

export interface MovimientoSearchResponse {
    infoInicial: InfoInicialResponse;
    fecha: string;
    tipoMovimiento: TipoMovimientoEnum;
    categoria: Categoria;
    descripcion: string;
    monto: number;
    medioPago: MedioPago;
}

export type MovimientosPorInfoSearchResponse = SearchResponse<MovimientosPorInfoResponse>;
export type MovimientosPorInfoSearchMetadata = SearchMetadata;

export interface MovimientoFiltros {
  infoInicialId?: number;
  tipoMovimiento?: TipoMovimientoEnum;
  categoriaId?: number;
  medioPagoId?: number;
  fechaDesde?: string; // formato YYYY-MM-DD
  fechaHasta?: string; // formato YYYY-MM-DD
}