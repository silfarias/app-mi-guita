import { fetchAuthGet } from "@/utils/api-client";
import { ResumenPagoGastoFijoResponse } from "../interfaces/resumen-pago-gasto-fijo.interface";

export class ResumenPagoGastoFijoService {
  async getPorInfoInicial(
    token: string,
    infoInicialId: number
  ): Promise<ResumenPagoGastoFijoResponse> {
    return fetchAuthGet(token, `/resumen-pago-gasto-fijo/info-inicial/${infoInicialId}`, {
      defaultError: "Error al obtener el resumen de pagos",
      notFoundError: "Resumen no encontrado",
    });
  }
}
