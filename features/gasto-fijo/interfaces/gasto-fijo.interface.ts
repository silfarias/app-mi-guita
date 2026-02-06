import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { InfoInicialResponse } from "@/features/info-inicial/interfaces/info-inicial.interface";
import { SearchMetadata, SearchRequest } from "@/types/api.types";

export interface GastoFijoRequest {
  nombre: string;
  montoFijo: number;
  categoriaId: number;
}

export interface BulkGastoFijoRequest {
  gastosFijos: GastoFijoRequest[];
}

export interface GastoFijoResponse {
  id: number;
  nombre: string;
  monto: string;
  categoria: Categoria;
}

export interface PagoGastoFijo {
  id: number;
  infoInicial: InfoInicialResponse;
  montoPago: string;
  pagado: boolean;
}

export interface GastoFijoConPagos {
  id: number;
  nombre: string;
  monto: string;
  categoria: Categoria;
  pagos: PagoGastoFijo[];
}

export interface UsuarioGastosFijosResponse {
  usuario: {
    id: number;
    nombreUsuario: string;
    email: string;
    activo: boolean;
    ultimoAcceso: string;
    fotoPerfil: string;
  };
  gastosFijos: GastoFijoConPagos[];
  metadata: SearchMetadata;
}

export interface GastoFijoFiltros extends SearchRequest {
  id?: number;
  categoriaId?: number;
  infoInicialId?: number;
}