import { Categoria, CategoriaSearchParams, CategoriaSearchResponse } from "../interfaces/categoria.interface";
import { buildSearchQuery, fetchAuthGet } from "@/utils/api-client";

const DEFAULT_PAGE_SIZE_ALL = 9999;

export class CategoriaService {
  async search(token: string, params?: CategoriaSearchParams): Promise<CategoriaSearchResponse> {
    const queryParams = {
      ...(params as Record<string, string | number | boolean | undefined | null>),
      pageSize: (params as { pageSize?: number })?.pageSize ?? DEFAULT_PAGE_SIZE_ALL,
      pageNumber: (params as { pageNumber?: number })?.pageNumber ?? 1,
    };
    const query = buildSearchQuery(queryParams);
    return fetchAuthGet(token, `/categoria/search${query}`, {
      defaultError: "Error al obtener categorías",
    });
  }

  async getById(id: number, token: string): Promise<Categoria> {
    return fetchAuthGet(token, `/categoria/${id}`, {
      defaultError: "Error al obtener la categoría",
      notFoundError: "Categoría no encontrada",
    });
  }
}
