import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { InfoInicialResponse } from "@/features/info-inicial/interfaces/info-inicial.interface";
import { MedioPago } from "@/features/medio-pago/interfaces/medio-pago.interface";

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