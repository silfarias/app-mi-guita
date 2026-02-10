export interface GastoFijoRequest {
  nombre: string;
  montoFijo: number;
  categoriaId: number;
  esDebitoAutomatico: boolean;
  medioPagoId?: number;
}

/** No enviar activo en POST; los nuevos se crean con activo: true. */
export interface GastoFijoUpdateRequest {
  nombre?: string;
  montoFijo?: number;
  categoriaId?: number;
  /** Opcional en PATCH: activar/desactivar el gasto fijo. */
  activo?: boolean;
  esDebitoAutomatico?: boolean;
  medioPagoId?: number;
}

export interface BulkGastoFijoRequest {
  gastosFijos: GastoFijoRequest[];
}