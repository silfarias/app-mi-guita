import { MedioPago, MedioPagoSearchParams, MedioPagoSearchResponse } from "../interfaces/medio-pago.interface";
import { buildSearchQuery, fetchAuthGet } from "@/utils/api-client";

export class MedioPagoService {
  async search(token: string, params?: MedioPagoSearchParams): Promise<MedioPagoSearchResponse> {
    const query = buildSearchQuery(params as Record<string, string | number | boolean | undefined | null>);
    return fetchAuthGet(token, `/medio-pago/search${query}`, {
      defaultError: "Error al obtener medios de pago",
    });
  }

  async getById(id: number, token: string): Promise<MedioPago> {
    return fetchAuthGet(token, `/medio-pago/${id}`, {
      defaultError: "Error al obtener el medio de pago",
      notFoundError: "Medio de pago no encontrado",
    });
  }
}