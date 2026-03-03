import {
  MovimientoRequest,
  MovimientoResponse,
  MovimientoSearchResponse,
  MovimientoFiltros,
  MovimientosAgrupadoPorCuentaResponse,
} from "../interfaces/movimiento.interface";
import { SearchResponse } from "@/types/api.types";
import { fetchAuthDelete, fetchAuthGet, fetchAuthPatch, fetchAuthPost, buildSearchQuery } from "@/utils/api-client";

export class MovimientoService {
  async create(token: string, request: MovimientoRequest): Promise<MovimientoResponse> {
    return fetchAuthPost<MovimientoResponse, MovimientoRequest>(token, "/movimiento", request, {
      defaultError: "Error al crear el movimiento",
    });
  }

  async update(token: string, id: string, request: Partial<MovimientoRequest>): Promise<MovimientoResponse> {
    const { cuentaId: _omit, ...payload } = request ?? {};
    return fetchAuthPatch<MovimientoResponse, Partial<Omit<MovimientoRequest, 'cuentaId'>>>(token, `/movimiento/${id}`, payload, {
      defaultError: "Error al actualizar el movimiento",
    });
  }

  async agrupado(token: string, filtros?: MovimientoFiltros): Promise<MovimientosAgrupadoPorCuentaResponse> {
    const query = buildSearchQuery(filtros as unknown as Record<string, string | number | boolean | undefined | null>);
    return fetchAuthGet<MovimientosAgrupadoPorCuentaResponse>(token, `/movimiento/agrupado${query}`, {
      defaultError: "Error al obtener los movimientos agrupados",
    });
  }

  async search(token: string, filtros?: MovimientoFiltros): Promise<SearchResponse<MovimientoSearchResponse>> {
    const query = buildSearchQuery(filtros as unknown as Record<string, string | number | boolean | undefined | null>);
    return fetchAuthGet<SearchResponse<MovimientoSearchResponse>>(token, `/movimiento/search${query}`, {
      defaultError: "Error al buscar movimientos",
    });
  }

  async getById(token: string, id: string): Promise<MovimientoSearchResponse> {
    return fetchAuthGet<MovimientoSearchResponse>(token, `/movimiento/${id}`, {
      defaultError: "Error al obtener el movimiento",
    });
  }

  async delete(token: string, id: string): Promise<void> {
    return fetchAuthDelete<void>(token, `/movimiento/${id}`, {
      defaultError: "Error al eliminar el movimiento",
    });
  }
}