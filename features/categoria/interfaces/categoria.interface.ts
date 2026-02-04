import { SearchMetadata, SearchResponse } from "@/types/api.types";

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  activo: boolean;
}

export interface CategoriaSearchParams {
  id?: number;
  nombre?: string;
  activo?: boolean;
}

export type CategoriaSearchResponse = SearchResponse<Categoria>;
export type CategoriaSearchMetadata = SearchMetadata;
