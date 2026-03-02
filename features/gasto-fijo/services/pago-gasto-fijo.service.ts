import { buildSearchQuery, fetchAuthGet, fetchAuthPatch } from "@/utils/api-client";
import {
  PagoGastoFijoByIdResponse,
  PagoGastoFijoPorMesResponse,
  PagoGastoFijoRequest,
} from "../interfaces/pago-gasto-fijo.interface";

export class PagoGastoFijoService {
  async getById(token: string, id: number): Promise<PagoGastoFijoByIdResponse> {
    return fetchAuthGet(token, `/pago-gasto-fijo/${id}`, {
      defaultError: "Error al obtener el pago de gasto fijo",
      notFoundError: "Pago de gasto fijo no encontrado",
    });
  }

  /** Obtener pagos de gastos fijos para un mes/año concreto (sin info inicial). */
  async getPagosPorMes(
    token: string,
    anio: number,
    mes: string
  ): Promise<PagoGastoFijoPorMesResponse> {
    const query = buildSearchQuery({ anio, mes });
    return fetchAuthGet(token, `/pago-gasto-fijo/pagos-por-mes${query}`, {
      defaultError: "Error al obtener los pagos de gastos fijos del mes",
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
