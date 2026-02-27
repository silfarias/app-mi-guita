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
    return fetchAuthGet(token, `/pago-gasto-fijo/por-info-inicial${query}`, {
      defaultError: "Error al obtener los pagos por info inicial",
      // Si no hay info inicial para ese mes, no es un error: solo no hay datos
      notFoundReturnValue: { infoInicial: undefined as any, pagos: [] } as PagoGastoFijoPorInfoInicialResponse,
    });
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
