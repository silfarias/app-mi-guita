import { Usuario } from "./usuario.interface";

export interface ChangePasswordRequest {
    email: string;
    contrasena: string;
    confirmarContrasena: string;
}

export interface ChangePasswordResponse {
    message: string;
    usuario: Usuario;
}
