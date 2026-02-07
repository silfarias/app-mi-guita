import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Portal, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FormActions } from '@/common/components/form-actions';
import { FormErrorBlock } from '@/common/components/form-error-block';

export interface PortalModalFormProps {
  /** Controla la visibilidad del modal. */
  visible: boolean;
  /** Al cerrar (backdrop o botón cerrar). */
  onDismiss: () => void;
  /** Título del header (ej. "Crear Movimiento", "Editar Gasto Fijo"). */
  title: string;
  /** Contenido del formulario (inputs). El padre usa react-hook-form y coloca aquí los campos. */
  children: React.ReactNode;
  /** Función a ejecutar al enviar. El padre pasa handleSubmit(onSubmit) de react-hook-form. */
  onSubmit: () => void | Promise<void>;
  /** Mientras true, se deshabilitan botones y se muestra loading en el botón Enviar. */
  loading?: boolean;
  /** Mensaje de error general (API). Se muestra en FormErrorBlock debajo del formulario. */
  error?: string;
  /** Texto del botón principal. */
  submitLabel?: string;
  /** Texto del botón cancelar. */
  cancelLabel?: string;
  /** Color del botón enviar. */
  submitButtonColor?: string;
  /** Si true, en lugar del formulario se muestra un loading (ActivityIndicator + texto). */
  initialLoading?: boolean;
  /** Si se define, se muestra en lugar del formulario (ej. "No hay info inicial" + botón Cerrar). */
  customEmptyState?: React.ReactNode;
  /** Contenido opcional arriba del ScrollView (ej. banner informativo). */
  topContent?: React.ReactNode;
  /** Deshabilitar además el botón Enviar (ej. cuando falta un requisito). */
  submitDisabled?: boolean;
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    width: '100%',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
});

/**
 * Modal de formulario reutilizable: Portal + Modal con header, contenido en ScrollView,
 * bloque de error y botones Cancelar/Enviar. Pensado para usarse con react-hook-form:
 * el padre usa useForm, pasa handleSubmit(handler) a onSubmit y renderiza los campos como children.
 */
export function PortalModalForm({
  visible,
  onDismiss,
  title,
  children,
  onSubmit,
  loading = false,
  error,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  submitButtonColor = '#6CB4EE',
  initialLoading = false,
  customEmptyState,
  topContent,
  submitDisabled = false,
}: PortalModalFormProps) {
  const handleClose = () => {
    if (!loading) {
      onDismiss();
    }
  };

  if (!visible) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalWrapper}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
            disabled={loading || initialLoading}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={loading}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="window-close" size={24} color="#333333" />
                </TouchableOpacity>
              </View>

              {initialLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6CB4EE" />
                  <Text variant="bodyMedium" style={styles.loadingText}>
                    Cargando datos...
                  </Text>
                </View>
              ) : customEmptyState ? (
                customEmptyState
              ) : (
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {topContent}
                  {children}
                  {error ? <FormErrorBlock message={error} /> : null}
                  <FormActions
                    cancelLabel={cancelLabel}
                    submitLabel={submitLabel}
                    onCancel={handleClose}
                    onSubmit={onSubmit}
                    disabled={loading || submitDisabled}
                    loading={loading}
                    submitButtonColor={submitButtonColor}
                  />
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}
