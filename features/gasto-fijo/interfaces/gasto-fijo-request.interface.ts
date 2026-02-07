export interface GastoFijoRequest {
    nombre: string;
    montoFijo: number;
    categoriaId: number;
}

export interface BulkGastoFijoRequest {
    gastosFijos: GastoFijoRequest[];
}