import { fetchAuthPost } from "@/utils/api-client";

export interface CuentaBulkItem {
  nombre: string;
  tipo: string;
  saldoInicial: number;
}

export interface CuentaBulkRequest {
  cuentas: CuentaBulkItem[];
}

export class CuentaService {
  async createBulk(token: string, body: CuentaBulkRequest) {
    return fetchAuthPost(token, "/cuenta/bulk", body, {
      defaultError: "Error al registrar tus cuentas",
    });
  }
}

