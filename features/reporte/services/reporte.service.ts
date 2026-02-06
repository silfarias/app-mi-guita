import { ReporteMensualParams, ReporteMensualResponse } from "../interfaces/reporte.interface";
import { buildSearchQuery, fetchAuthGet } from "@/utils/api-client";

export class ReporteService {
  async getReporteMensual(token: string, params: ReporteMensualParams): Promise<ReporteMensualResponse | null> {
    const query = buildSearchQuery(params as unknown as Record<string, string | number | boolean | undefined | null>);
    try {
      return await fetchAuthGet<ReporteMensualResponse>(token, `/reportes/mensual${query}`, {
        defaultError: "Error al obtener el reporte mensual",
      });
    } catch (error) {
      // Si el error es que no se encontró información inicial, retornar null en lugar de lanzar error
      if (error instanceof Error && error.message.includes("No se encontró información inicial")) {
        return null;
      }
      // Para otros errores, lanzar el error normalmente
      throw error;
    }
  }
}
