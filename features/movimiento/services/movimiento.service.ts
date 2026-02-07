import { MovimientoRequest, MovimientoResponse, MovimientoSearchResponse, MovimientosPorInfoSearchResponse, MovimientoFiltros } from "../interfaces/movimiento.interface";
import { fetchAuthDelete, fetchAuthGet, fetchAuthPatch, fetchAuthPost, buildSearchQuery } from "@/utils/api-client";

export class MovimientoService {
  async create(token: string, request: MovimientoRequest): Promise<MovimientoResponse> {
    return fetchAuthPost<MovimientoResponse, MovimientoRequest>(token, "/movimiento", request, {
      defaultError: "Error al crear el movimiento",
    });
  }

  async update(token: string, id: string, request: Partial<MovimientoRequest>): Promise<MovimientoResponse> {
    const { infoInicialId: _omit, ...payload } = request ?? {};
    return fetchAuthPatch<MovimientoResponse, Partial<Omit<MovimientoRequest, 'infoInicialId'>>>(token, `/movimiento/${id}`, payload, {
      defaultError: "Error al actualizar el movimiento",
    });
  }

  async getByInfoInicial(token: string): Promise<MovimientosPorInfoSearchResponse> {
    return fetchAuthGet<MovimientosPorInfoSearchResponse>(token, "/movimiento/por-info", {
      defaultError: "Error al obtener los movimientos",
    });
  }

  async search(token: string, filtros?: MovimientoFiltros): Promise<MovimientosPorInfoSearchResponse> {
    const query = buildSearchQuery(filtros as unknown as Record<string, string | number | boolean | undefined | null>);
    return fetchAuthGet<MovimientosPorInfoSearchResponse>(token, `/movimiento/por-info${query}`, {
      defaultError: "Error al obtener los movimientos",
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