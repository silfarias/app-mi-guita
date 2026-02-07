import { fetchAuthDelete, fetchAuthGet, fetchAuthPatch, fetchAuthPost } from "@/utils/api-client";
import { BulkGastoFijoRequest, GastoFijoRequest } from "../interfaces/gasto-fijo-request.interface";
import { GastoFijoResponse } from "../interfaces/gasto-fijo.interface";
import { GetMisGastosFijosResponse } from "../interfaces/get-mis-gastos-fijos.interface";

export class GastoFijoService {
  async create(token: string, request: GastoFijoRequest): Promise<GastoFijoResponse> {
    return fetchAuthPost<GastoFijoResponse, GastoFijoRequest>(
      token, "/gasto-fijo", request, {
        defaultError: "Error al crear el gasto fijo",
      }
    );
  }

  async createBulk(token: string, request: BulkGastoFijoRequest): Promise<GastoFijoResponse[]> {
    return fetchAuthPost<GastoFijoResponse[], BulkGastoFijoRequest>(
      token, "/gasto-fijo/bulk", request, {
        defaultError: "Error al crear los gastos fijos",
      }
    );
  }

  async update(token: string, id: string, request: Partial<GastoFijoRequest>): Promise<GastoFijoResponse> {
    return fetchAuthPatch<GastoFijoResponse, Partial<GastoFijoRequest>>(
      token, `/gasto-fijo/${id}`, request, {
      defaultError: "Error al actualizar el gasto fijo",
    });
  }

  async getMisGastosFijos(token: string): Promise<GetMisGastosFijosResponse> {
    return fetchAuthGet<GetMisGastosFijosResponse>(
      token, 
      "/gasto-fijo/mis-gastos-fijos", {
      defaultError: "Error al obtener los gastos fijos",
    });
  }

  async getById(token: string, id: string): Promise<GastoFijoResponse> {
    return fetchAuthGet<GastoFijoResponse>(
      token, 
      `/gasto-fijo/${id}`, {
      defaultError: "Error al obtener el gasto fijo",
    });
  }


  async delete(token: string, id: string): Promise<void> {
    return fetchAuthDelete<void>(token, `/gasto-fijo/${id}`, {
      defaultError: "Error al eliminar el gasto fijo",
    });
  }
}
