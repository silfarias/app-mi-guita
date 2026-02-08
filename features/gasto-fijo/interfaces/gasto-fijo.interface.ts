import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { SearchRequest } from "@/types/api.types";


export interface GastoFijoResponse {
  id: number;
  nombre: string;
  montoFijo?: string;
  /** Si el gasto fijo está activo para el usuario. Por defecto true. */
  activo?: boolean;
  categoria: Categoria;
}

export interface GastoFijoFiltros extends SearchRequest {
  id?: number;
  categoriaId?: number;
  infoInicialId?: number;
  /** Filtrar por estado activo (true/false). Sin enviar = todos. */
  activo?: boolean;
}