import { buildSearchQuery, fetchAuthGet } from "@/utils/api-client";
import { DashboardResumenResponse } from "../interfaces/dashboard.interface";

export class DashboardService {
  async getResumen(
    token: string,
    anio: number,
    mes: string
  ): Promise<DashboardResumenResponse> {
    const query = buildSearchQuery({ anio, mes });
    return fetchAuthGet(token, `/dashboard${query}`, {
      defaultError: "Error al obtener el resumen del dashboard",
    });
  }
}

