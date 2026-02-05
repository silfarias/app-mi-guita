import { useEditUser } from '@/features/auth/hooks/auth.hook';
import { EditUserRequest } from '@/features/auth/interfaces/edit-user.interface';
import { Usuario } from '@/features/auth/interfaces/usuario.interface';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';

interface EditUserModalProps {
  visible: boolean;
  onDismiss: () => void;
  usuario: Usuario;
  onSuccess?: () => void;
}

export function EditUserModal({ visible, onDismiss, usuario, onSuccess }: EditUserModalProps) {
  const { editUser, loading, error, success, setError, setSuccess } = useEditUser();
  const [selectedImage, setSelectedImage] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [keepCurrentImage, setKeepCurrentImage] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EditUserRequest>({
    defaultValues: {
      nombre: usuario.persona.nombre,
      apellido: usuario.persona.apellido,
      nombreUsuario: usuario.nombreUsuario,
      email: usuario.email,
      urlFotoPerfil: usuario.fotoPerfil || '',
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos acceso a tu galería para seleccionar una foto de perfil.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'foto-perfil.jpg',
      });
      setKeepCurrentImage(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setKeepCurrentImage(false);
  };

  const keepImage = () => {
    setSelectedImage(null);
    setKeepCurrentImage(true);
  };

  const onSubmit = async (data: EditUserRequest) => {
    const request: EditUserRequest = {
      ...data,
    };

    // Lógica de foto de perfil según especificaciones:
    // - Si se envía fotoPerfil, reemplaza la imagen actual
    // - Si se envía urlFotoPerfil junto con fotoPerfil, se ignora urlFotoPerfil
    // - Si solo se envía urlFotoPerfil, se mantiene la imagen actual
    // - Si se envía urlFotoPerfil vacía, se elimina la imagen
    
    if (selectedImage) {
      // Nueva imagen seleccionada: enviar fotoPerfil (urlFotoPerfil se ignorará si también se envía)
      request.fotoPerfil = selectedImage;
      request.urlFotoPerfil = undefined;
    } else if (keepCurrentImage && usuario.fotoPerfil) {
      // Mantener imagen actual: solo enviar urlFotoPerfil
      request.fotoPerfil = undefined;
      request.urlFotoPerfil = usuario.fotoPerfil;
    } else {
      // Eliminar imagen: enviar urlFotoPerfil vacía
      request.fotoPerfil = undefined;
      request.urlFotoPerfil = '';
    }

    const successResult = await editUser(usuario.id, request);
    if (successResult) {
      reset();
      setSelectedImage(null);
      setKeepCurrentImage(true);
      // Mostrar toast de éxito
      Toast.show({
        type: 'success',
        text1: '¡Perfil actualizado!',
        text2: 'Tu información se ha actualizado exitosamente',
        position: 'top',
        visibilityTime: 3000,
      });
      // Refrescar el perfil y cerrar el modal
      onSuccess?.();
      setTimeout(() => {
        onDismiss();
      }, 300);
    }
  };

  const handleDismiss = () => {
    reset();
    setSelectedImage(null);
    setKeepCurrentImage(true);
    setError(null);
    setSuccess(null);
    // Limpiar el estado del hook
    setError(null);
    setSuccess(null);
    onDismiss();
  };

  const currentImageUri = selectedImage?.uri || (keepCurrentImage && usuario.fotoPerfil ? usuario.fotoPerfil : null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Editar Perfil
            </Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {error && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={24} color="#D32F2F" />
                <Text variant="bodyMedium" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            {/* Foto de Perfil */}
            <View style={styles.photoContainer}>
              <Text variant="bodyMedium" style={styles.photoLabel}>
                Foto de Perfil
              </Text>
              <View style={styles.photoSelectorContainer}>
                {currentImageUri ? (
                  <>
                    <View style={styles.photoPreview}>
                      <Image source={{ uri: currentImageUri }} style={styles.photoImage} />
                    </View>
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={selectedImage ? removeImage : () => {
                        removeImage();
                        setKeepCurrentImage(false);
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.photoPlaceholder} onPress={pickImage}>
                    <MaterialCommunityIcons name="camera-plus" size={32} color="#6CB4EE" />
                    <Text variant="bodySmall" style={styles.photoPlaceholderText}>
                      Agregar foto
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {!currentImageUri && (
                <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                  <MaterialCommunityIcons name="image" size={20} color="#6CB4EE" />
                  <Text variant="bodyMedium" style={styles.pickImageButtonText}>
                    Seleccionar foto
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Nombre */}
            <Controller
              control={control}
              name="nombre"
              rules={{
                required: 'El nombre es obligatorio',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Nombre"
                  placeholder="Juan"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  autoCapitalize="words"
                  disabled={loading}
                  error={!!errors.nombre}
                  style={styles.input}
                />
              )}
            />
            {errors.nombre && (
              <Text variant="bodySmall" style={styles.fieldError}>
                {errors.nombre.message}
              </Text>
            )}

            {/* Apellido */}
            <Controller
              control={control}
              name="apellido"
              rules={{
                required: 'El apellido es obligatorio',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Apellido"
                  placeholder="Pérez"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  autoCapitalize="words"
                  disabled={loading}
                  error={!!errors.apellido}
                  style={styles.input}
                />
              )}
            />
            {errors.apellido && (
              <Text variant="bodySmall" style={styles.fieldError}>
                {errors.apellido.message}
              </Text>
            )}

            {/* Nombre de Usuario */}
            <Controller
              control={control}
              name="nombreUsuario"
              rules={{
                required: 'El nombre de usuario es obligatorio',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Nombre de Usuario"
                  placeholder="usuario123"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  autoCapitalize="none"
                  disabled={loading}
                  error={!!errors.nombreUsuario}
                  style={styles.input}
                />
              )}
            />
            {errors.nombreUsuario && (
              <Text variant="bodySmall" style={styles.fieldError}>
                {errors.nombreUsuario.message}
              </Text>
            )}

            {/* Email */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'El email es obligatorio',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  placeholder="usuario@gmail.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  disabled={loading}
                  error={!!errors.email}
                  style={styles.input}
                />
              )}
            />
            {errors.email && (
              <Text variant="bodySmall" style={styles.fieldError}>
                {errors.email.message}
              </Text>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={handleDismiss}
              style={styles.modalButton}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.modalButton}
              loading={loading}
              disabled={loading}
              buttonColor="#6CB4EE"
            >
              Guardar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#D32F2F',
    flex: 1,
  },
  photoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  photoLabel: {
    color: '#666666',
    marginBottom: 12,
  },
  photoSelectorContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  photoSelector: {
    width: 120,
    height: 120,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#6CB4EE',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D32F2F',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  photoPlaceholderText: {
    color: '#666666',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
  },
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  pickImageButtonText: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  fieldError: {
    color: '#D32F2F',
    marginBottom: 16,
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
