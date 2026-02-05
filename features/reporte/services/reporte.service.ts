import { ReporteMensualParams, ReporteMensualResponse } from "../interfaces/reporte.interface";
import { buildSearchQuery, fetchAuthGet } from "@/utils/api-client";

export class ReporteService {
  async getReporteMensual(token: string, params: ReporteMensualParams): Promise<ReporteMensualResponse> {
    const query = buildSearchQuery(params as unknown as Record<string, string | number | boolean | undefined | null>);
    return fetchAuthGet<ReporteMensualResponse>(token, `/reportes/mensual${query}`, {
      defaultError: "Error al obtener el reporte mensual",
    });
  }
}
