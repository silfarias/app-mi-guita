import { Usuario } from "./usuario.interface";

export interface EditUserRequest {
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    email: string;
    fotoPerfil?: File | Blob | any; // Para multipart/form-data
    urlFotoPerfil?: string; // URL de la foto actual
}

export interface EditUserResponse {
    message: string;
    usuario: Usuario;
}
