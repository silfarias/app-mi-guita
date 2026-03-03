/** Ítem para POST /gasto-fijo/bulk */
export interface GastoFijoRequest {
  nombre: string;
  tipo: 'FIJO' | 'VARIABLE';
  montoEstimado: number;
  /** Fecha de vencimiento en formato YYYY-MM-DD */
  diaVencimiento: string;
  categoriaId: number;
  esDebitoAutomatico: boolean;
}

/** No enviar activo en POST; los nuevos se crean con activo: true. */
export interface GastoFijoUpdateRequest {
  nombre?: string;
  tipo?: 'FIJO' | 'VARIABLE';
  montoEstimado?: number;
  /** Fecha de vencimiento YYYY-MM-DD */
  diaVencimiento?: string;
  categoriaId?: number;
  activo?: boolean;
  esDebitoAutomatico?: boolean;
}

export interface BulkGastoFijoRequest {
  gastosFijos: GastoFijoRequest[];
}