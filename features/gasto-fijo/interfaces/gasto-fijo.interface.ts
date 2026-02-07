import { Categoria } from "@/features/categoria/interfaces/categoria.interface";
import { SearchRequest } from "@/types/api.types";


export interface GastoFijoResponse {
  id: number;
  nombre: string;
  monto: string;
  categoria: Categoria;
}

export interface GastoFijoFiltros extends SearchRequest {
  id?: number;
  categoriaId?: number;
  infoInicialId?: number;
}