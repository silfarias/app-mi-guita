import { fetchAuthGet } from "@/utils/api-client";
import { ResumenPagoGastoFijoResponse } from "../interfaces/resumen-pago-gasto-fijo.interface";

export class ResumenPagoGastoFijoService {
  async getPorInfoInicial(
    token: string,
    infoInicialId: number
  ): Promise<ResumenPagoGastoFijoResponse | null> {
    try {
      return await fetchAuthGet<ResumenPagoGastoFijoResponse>(
        token,
        `/resumen-pago-gasto-fijo/info-inicial/${infoInicialId}`,
        {
          defaultError: "Error al obtener el resumen de pagos",
        }
      );
    } catch (error) {
      // Si el error es que no se encontró el resumen, retornar null en lugar de lanzar error
      if (
        error instanceof Error &&
        (error.message.includes("No se encontró") ||
          error.message.includes("no encontrado") ||
          error.message.includes("404"))
      ) {
        return null;
      }
      // Para otros errores, lanzar el error normalmente
      throw error;
    }
  }
}
