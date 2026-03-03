import { SearchMetadata, SearchResponse } from "@/types/api.types";

export enum TipoCategoriaEnum {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO'
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: TipoCategoriaEnum;
  color: string;
  icono: string;
  activo: boolean;
}

export interface CategoriaSearchParams {
  id?: number;
  nombre?: string;
  activo?: boolean;
  /** Filtrar por tipo de categoría (INGRESO / EGRESO). */
  tipo?: TipoCategoriaEnum;
}

export type CategoriaSearchResponse = SearchResponse<Categoria>;
export type CategoriaSearchMetadata = SearchMetadata;