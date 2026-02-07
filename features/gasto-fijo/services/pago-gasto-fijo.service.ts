import { buildSearchQuery, fetchAuthGet, fetchAuthPatch } from "@/utils/api-client";
import {
  PagoGastoFijoByIdResponse,
  PagoGastoFijoPorInfoInicialResponse,
  PagoGastoFijoRequest,
} from "../interfaces/pago-gasto-fijo.interface";

export class PagoGastoFijoService {
  async getById(token: string, id: number): Promise<PagoGastoFijoByIdResponse> {
    return fetchAuthGet(token, `/gasto-fijo-pago/${id}`, {
      defaultError: "Error al obtener el pago de gasto fijo",
      notFoundError: "Pago de gasto fijo no encontrado",
    });
  }

  async getPorInfoInicial(token: string, infoInicialId: number): Promise<PagoGastoFijoPorInfoInicialResponse> {
    const query = buildSearchQuery({ infoInicialId });
    return fetchAuthGet(token, `/gasto-fijo-pago/por-info-inicial${query}`, {
      defaultError: "Error al obtener los pagos por info inicial",
      notFoundError: "Info inicial no encontrada",
    });
  }

  async update(
    token: string,
    id: string,
    request: Partial<PagoGastoFijoRequest>
  ): Promise<PagoGastoFijoByIdResponse> {
    return fetchAuthPatch(token, `/gasto-fijo-pago/${id}`, request, {
      defaultError: "Error al actualizar el pago de gasto fijo",
    });
  }
}
