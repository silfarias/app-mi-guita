import { buildSearchQuery, fetchAuthGet, fetchAuthPatch } from "@/utils/api-client";
import {
  PagoGastoFijoByIdResponse,
  PagoGastoFijoPorInfoInicialResponse,
  PagoGastoFijoRequest,
} from "../interfaces/pago-gasto-fijo.interface";

export class PagoGastoFijoService {
  async getById(token: string, id: number): Promise<PagoGastoFijoByIdResponse> {
    return fetchAuthGet(token, `/pago-gasto-fijo/${id}`, {
      defaultError: "Error al obtener el pago de gasto fijo",
      notFoundError: "Pago de gasto fijo no encontrado",
    });
  }

  async getPorInfoInicial(token: string, infoInicialId: number): Promise<PagoGastoFijoPorInfoInicialResponse> {
    const query = buildSearchQuery({ infoInicialId });
    try {
      return await fetchAuthGet(token, `/pago-gasto-fijo/por-info-inicial${query}`, {
        defaultError: "Error al obtener los pagos por info inicial",
        notFoundError: "Info inicial no encontrada",
      });
    } catch (err) {
      // 404 = aún no hay pagos para esta info inicial (ej. recién registrada); no es un error
      if (err instanceof Error && err.message === "Info inicial no encontrada") {
        return { infoInicial: null, pagos: [] };
      }
      throw err;
    }
  }

  async update(
    token: string,
    id: string,
    request: Partial<PagoGastoFijoRequest>
  ): Promise<PagoGastoFijoByIdResponse> {
    return fetchAuthPatch(token, `/pago-gasto-fijo/${id}`, request, {
      defaultError: "Error al actualizar el pago de gasto fijo",
    });
  }
}
