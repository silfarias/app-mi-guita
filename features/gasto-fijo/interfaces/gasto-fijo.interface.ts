import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { SearchRequest } from "@/types/api.types";


export interface GastoFijoResponse {
  id: number;
  nombre: string;
  tipo: 'FIJO' | 'VARIABLE';
  montoEstimado?: number;
  diaVencimiento?: string;
  activo?: boolean;
  esDebitoAutomatico: boolean;
  categoria: Categoria;
}

export interface GastoFijoFiltros extends SearchRequest {
  id?: number;
  nombre?: string;
  categoriaId?: number;
  activo?: boolean;
  esDebitoAutomatico?: boolean;
}