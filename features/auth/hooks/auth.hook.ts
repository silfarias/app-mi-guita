import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuthStore } from '../../../store/auth.store';
import { LoginRequest } from '../interfaces/login.interface';
import { SignupRequest } from '../interfaces/signup.interface';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

/**
 * Hook para el formulario de login con react-hook-form.
 * En React Native se usa Controller (no register) porque los inputs
 * usan value/onChangeText en lugar de ref/onChange.
 */
export function useLoginForm() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: {
      nombreUsuario: '',
      contrasena: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.access_token, response.usuario);
      // La redirección se manejará automáticamente por el _layout.tsx
      router.replace('/(tabs)' as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      // Log del error completo para debugging
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    onSubmit,
    loading,
    error,
    setError,
  };
}

/**
 * Hook para el formulario de registro con react-hook-form.
 * Maneja el registro de nuevos usuarios y los autentica automáticamente.
 */
export function useSignupForm() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupRequest & { confirmarContrasena: string }>({
    defaultValues: {
      nombre: '',
      apellido: '',
      nombreUsuario: '',
      email: '',
      contrasena: '',
      confirmarContrasena: '',
      fotoPerfil: undefined,
    },
  });

  const password = watch('contrasena');

  const onSubmit = async (data: SignupRequest & { confirmarContrasena: string }) => {
    setError(null);
    setLoading(true);
    try {
      // Validar que las contraseñas coincidan
      if (data.contrasena !== data.confirmarContrasena) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Preparar los datos para el signup (sin confirmarContrasena)
      const signupData: SignupRequest = {
        nombre: data.nombre,
        apellido: data.apellido,
        nombreUsuario: data.nombreUsuario,
        email: data.email,
        contrasena: data.contrasena,
        fotoPerfil: data.fotoPerfil,
      };

      const response = await authService.signup(signupData);
      setAuth(response.access_token, response.usuario);
      // La redirección se manejará automáticamente por el _layout.tsx
      router.replace('/(tabs)' as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(message);
      // Log del error completo para debugging
      console.error('Error en signup:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    onSubmit,
    loading,
    error,
    setError,
    password, // Para validación de confirmación de contraseña
  };
}

/**
 * Hook para cerrar sesión.
 * Maneja el logout del usuario, limpia el estado de autenticación y redirige al login.
 */
export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setError(null);
    setLoading(true);
    try {
      // Si hay un token, intentar cerrar sesión en el backend
      if (accessToken) {
        try {
          await authService.logout(accessToken);
        } catch (err) {
          // Si falla el logout del backend, continuamos con el logout local
          // (puede ser que el token ya haya expirado)
          console.warn('Error al cerrar sesión en el backend:', err);
        }
      }

      // Limpiar el estado local de autenticación
      logout();

      // Redirigir al login
      router.replace('/login' as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(message);
      console.error('Error en logout:', err);
      // Aún así, limpiar el estado local y redirigir
      logout();
      router.replace('/login' as any);
    } finally {
      setLoading(false);
    }
  };

  return {
    logout: handleLogout,
    loading,
    error,
  };
}
