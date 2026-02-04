export interface Persona {
    id: number;
    nombre: string;
    apellido: string;
}

export interface Usuario {
    id: number;
    nombreUsuario: string;
    email: string;
    activo: boolean;
    ultimoAcceso: string;
    fotoPerfil: string;
    persona: Persona;
}