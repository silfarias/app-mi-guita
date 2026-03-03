
export enum TipoCuentaEnum {
    EFECTIVO = 'EFECTIVO',
    BANCO = 'BANCO',
    BILLETERA = 'BILLETERA',
}

export interface CuentaRequest {
    nombre: string;
    tipo: TipoCuentaEnum;
    saldoInicial: number;
}

export interface CuentaBulkRequest {
    cuentas: CuentaRequest[];
}

export interface CuentaItemResponse {
  id: number;
  nombre: string;
  tipo: TipoCuentaEnum;
  saldoActual: number;
}

/** Respuesta de POST /cuenta/bulk: array de cuentas creadas con saldoActual. */
export type CuentaBulkResponse = CuentaItemResponse[];
export type CuentaListResponse = CuentaItemResponse[];