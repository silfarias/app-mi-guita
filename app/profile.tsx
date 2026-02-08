import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Text } from 'react-native-paper';

import { BoxProfile } from '@/components/box-profile';
import { ChangePasswordModal } from '@/components/change-password-modal';
import { EditUserModal } from '@/components/edit-user-modal';
import { SettingsRow } from '@/components/settings-row';
import { Header } from '@/components/ui/header';
import { ErrorStateCard, LoadingStateBlock } from '@/common/components';
import { useProfile } from '@/features/auth/hooks/auth.hook';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { usuario, loading, error, fetchProfile } = useProfile();
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isEditUserModalVisible, setIsEditUserModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Mi Perfil" onBack={() => router.back()} />

      {loading ? (
        <LoadingStateBlock message="Cargando perfil..." style={styles.loadingWrapper} />
      ) : error ? (
        <View style={styles.errorWrapper}>
          <ErrorStateCard message={error} onRetry={fetchProfile} />
        </View>
      ) : usuario ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={() => setIsEditUserModalVisible(true)}
          >
            {usuario.fotoPerfil ? (
              <View>
                <Image
                  source={{ uri: usuario.fotoPerfil }}
                  style={styles.profileImage}
                />
                <View style={styles.editImageOverlay}>
                  <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
                </View>
              </View>
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={80}
                  color="#6CB4EE"
                />
                <View style={styles.editImageOverlay}>
                  <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
                </View>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <BoxProfile icon="account" title="Nombre Completo" value={usuario.persona.nombre + ' ' + usuario.persona.apellido} />
            <BoxProfile icon="account-circle" title="Nombre de Usuario" value={usuario.nombreUsuario} />
            <BoxProfile icon="email" title="Email" value={usuario.email} />
          </View>

          <View style={styles.settingsContainer}>
            <Text variant="titleMedium" style={styles.settingsTitle}>
              Configuración
            </Text>
            <Card style={styles.settingsCard}>
              <SettingsRow
                icon="account-edit"
                label="Editar Perfil"
                onPress={() => setIsEditUserModalVisible(true)}
              />
              <View style={styles.settingsDivider} />
              <SettingsRow
                icon="lock-reset"
                label="Cambiar Contraseña"
                onPress={() => setIsChangePasswordModalVisible(true)}
              />
            </Card>
          </View>
        </ScrollView>
      ) : null}

      {usuario && (
        <EditUserModal
          visible={isEditUserModalVisible}
          onDismiss={() => {
            setIsEditUserModalVisible(false);
            fetchProfile();
          }}
          usuario={usuario}
          onSuccess={() => fetchProfile()}
        />
      )}

      {usuario && (
        <ChangePasswordModal
          visible={isChangePasswordModalVisible}
          onDismiss={() => setIsChangePasswordModalVisible(false)}
          email={usuario.email}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingWrapper: {
    flex: 1,
  },
  errorWrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6CB4EE',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#6CB4EE',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#6CB4EE',
  },
  infoContainer: {
    gap: 16,
    marginBottom: 32,
  },
  settingsContainer: {
    marginTop: 8,
  },
  settingsTitle: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 12,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
});
