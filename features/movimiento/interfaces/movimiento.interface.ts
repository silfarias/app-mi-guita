import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { CuentaItemResponse } from "@/features/cuenta/interfaces/cuenta.interface";
import { MedioPago } from "@/features/medio-pago/interfaces/medio-pago.interface";
import { SearchMetadata, SearchRequest, SearchResponse } from "@/types/api.types";

export enum TipoMovimientoEnum {
    INGRESO = 'INGRESO',
    EGRESO = 'EGRESO',
    TRANSFERENCIA = 'TRANSFERENCIA',
    SALDO_INICIAL = 'SALDO_INICIAL'
}

export interface MovimientoRequest {
    cuentaId: number;
    fecha: string;
    tipoMovimiento: TipoMovimientoEnum;
    descripcion: string;
    categoriaId: number;
    monto: number;
}

export interface MovimientoResponse {
    id: number;
    fecha: string;
    tipoMovimiento: TipoMovimientoEnum;
    cuenta: CuentaItemResponse;
    categoria: Categoria;
    descripcion: string;
    monto: number;
}

export interface MovimientoListItem {
    id: number;
    fecha: string;
    tipoMovimiento: TipoMovimientoEnum;
    categoria: Categoria | null;
    descripcion: string;
    monto: string;
}

export interface MovimientosAgrupadoResponse {
    cuenta: CuentaItemResponse;
    movimientos: MovimientoListItem[];
}

export interface MovimientoSearchResponse {
    id: number;
    cuenta: CuentaItemResponse;
    fecha: string;
    tipoMovimiento: TipoMovimientoEnum;
    categoria: Categoria | null;
    descripcion: string;
    monto: number;
}

export type MovimientosAgrupadoPorCuentaResponse = SearchResponse<MovimientosAgrupadoResponse>;
export type MovimientosPorInfoSearchMetadata = SearchMetadata;

export interface MovimientoFiltros extends SearchRequest {
  cuentaId?: number;
  tipoMovimiento?: TipoMovimientoEnum;
  categoriaId?: number;
  fechaDesde?: string; // formato YYYY-MM-DD
  fechaHasta?: string; // formato YYYY-MM-DD
}