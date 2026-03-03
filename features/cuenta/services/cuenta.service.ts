import { fetchAuthGet, fetchAuthPost } from "@/utils/api-client";
import {
  CuentaBulkRequest,
  CuentaBulkResponse,
  CuentaItemResponse,
  CuentaListResponse,
} from "../interfaces/cuenta.interface";

export class CuentaService {

  async getByUsuario(token: string): Promise<CuentaListResponse> {
    return fetchAuthGet<CuentaListResponse>(token, "/cuenta/list", {
      defaultError: "Error al obtener las cuentas",
    });
  }

  async createBulk(
    token: string,
    body: CuentaBulkRequest
  ): Promise<CuentaBulkResponse> {
    return fetchAuthPost<CuentaBulkResponse, CuentaBulkRequest>(
      token,
      "/cuenta/bulk",
      body,
      {
        defaultError: "Error al registrar tus cuentas",
      }
    );
  }
}

