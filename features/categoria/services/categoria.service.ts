import { Categoria, CategoriaSearchParams, CategoriaSearchResponse } from "../interfaces/categoria.interface";
import { buildSearchQuery, fetchAuthGet } from "@/utils/api-client";

export class CategoriaService {
  async search(token: string, params?: CategoriaSearchParams): Promise<CategoriaSearchResponse> {
    const query = buildSearchQuery(params as Record<string, string | number | boolean | undefined | null>);
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
