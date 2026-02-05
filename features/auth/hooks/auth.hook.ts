import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuthStore } from '../../../store/auth.store';
import { ChangePasswordRequest } from '../interfaces/change-password.interface';
import { EditUserRequest } from '../interfaces/edit-user.interface';
import { LoginRequest } from '../interfaces/login.interface';
import { SignupRequest } from '../interfaces/signup.interface';
import { Usuario } from '../interfaces/usuario.interface';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export function useLoginForm() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    defaultValues: { nombreUsuario: '', contrasena: '' },
  });

  const onSubmit = async (data: LoginRequest) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.access_token, response.usuario);
      router.replace('/(tabs)' as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return { control, handleSubmit, errors, onSubmit, loading, error, setError };
}

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
      if (data.contrasena !== data.confirmarContrasena) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }
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
      router.replace('/(tabs)' as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
      console.error('Error en signup:', err);
    } finally {
      setLoading(false);
    }
  };

  return { control, handleSubmit, errors, onSubmit, loading, error, setError, password };
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setError(null);
    setLoading(true);
    try {
      if (accessToken) {
        try {
          await authService.logout(accessToken);
        } catch (err) {
          console.warn('Error al cerrar sesión en el backend:', err);
        }
      }
      logout();
      router.replace('/login' as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
      console.error('Error en logout:', err);
      logout();
      router.replace('/login' as any);
    } finally {
      setLoading(false);
    }
  };

  return { logout: handleLogout, loading, error };
}

export function useProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const fetchProfile = async () => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const userData = await authService.getCurrentUser(accessToken);
      setUsuario(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener información del usuario');
      console.error('Error en fetchProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  return { usuario, loading, error, fetchProfile, refetch: fetchProfile };
}

export function useChangePassword() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const changePassword = async (request: ChangePasswordRequest) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return false;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (request.contrasena !== request.confirmarContrasena) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return false;
      }
      await authService.changePassword(accessToken, request);
      setSuccess('Contraseña cambiada exitosamente');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error, success, setError, setSuccess };
}

export function useEditUser() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUsuario = useAuthStore((s) => s.setUsuario);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const editUser = async (userId: number, request: EditUserRequest) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return false;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await authService.editUser(accessToken, userId, request);
      // Actualizar el usuario en el store
      setUsuario(response.usuario);
      setSuccess('Usuario actualizado exitosamente');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { editUser, loading, error, success, setError, setSuccess };
}
