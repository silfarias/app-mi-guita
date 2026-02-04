import { InfoInicialRequest, InfoInicialResponse } from "../interfaces/info-inicial.interface";
import { fetchAuthPost } from "@/utils/api-client";

export class InfoInicialService {
  async create(token: string, request: InfoInicialRequest): Promise<InfoInicialResponse> {
    return fetchAuthPost<InfoInicialResponse, InfoInicialRequest>(token, "/info-inicial", request, {
      defaultError: "Error al registrar la información inicial",
    });
  }
}
