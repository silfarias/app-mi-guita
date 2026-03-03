import { Usuario } from "./usuario.interface";

export interface VerifyEmailRequest {
    codigo: string;
}

export interface VerifyEmailResponse {
    message: string;
    usuario: Usuario;
}

export interface SendVerificationEmailResponse {
    message: string;
}