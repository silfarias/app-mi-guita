
export interface Persona {
    id: number;
    nombre: string;
    apellido: string;
}

export interface Usuario {
    id: number;
    nombreUsuario: string;
    email: string;
    emailVerificado: boolean;
    activo: boolean;
    ultimoAcceso: string;
    fotoPerfil: string;
    persona: Persona;
}

/** Usuario sin persona (ej. respuestas de reportes/resumen). */
export type UsuarioInfoInicial = Omit<Usuario, "persona">;