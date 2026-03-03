import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

import { BoxProfile } from '@/components/box-profile';
import { ChangePasswordModal } from '@/features/auth/components/change-password-modal';
import { EditUserModal } from '@/features/auth/components/edit-user-modal';
import { VerifyEmailModal } from '@/features/auth/components/verify-email-modal';
import { SettingsRow } from '@/components/settings-row';
import { Header } from '@/components/ui/header';
import { ErrorStateCard, LoadingStateBlock } from '@/common/components';
import { useProfile, useSendVerificationEmail } from '@/features/auth/hooks/auth.hook';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const { usuario, loading, error, fetchProfile } = useProfile();
  const { sendVerificationEmail, loading: sendingEmail } = useSendVerificationEmail();
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isEditUserModalVisible, setIsEditUserModalVisible] = useState(false);
  const [isVerifyEmailModalVisible, setIsVerifyEmailModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSendVerificationEmail = async () => {
    const ok = await sendVerificationEmail();
    if (ok) {
      Toast.show({
        type: 'success',
        text1: 'Correo enviado',
        text2: 'Revisá tu bandeja de entrada y seguí las instrucciones para verificar tu email.',
        position: 'top',
        visibilityTime: 4000,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo enviar el correo de verificación. Intentá de nuevo más tarde.',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

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
            <View style={styles.emailCard}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="email" size={20} color="#6CB4EE" />
                <Text variant="titleMedium" style={styles.infoLabel}>
                  Email
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {usuario.email}
              </Text>
              <View style={styles.emailVerificationRow}>
                <View style={[
                  styles.verificationBadge,
                  usuario.emailVerificado ? styles.verificationBadgeVerified : styles.verificationBadgeNotVerified,
                ]}>
                  <MaterialCommunityIcons
                    name={usuario.emailVerificado ? 'check-circle' : 'alert-circle-outline'}
                    size={18}
                    color={usuario.emailVerificado ? '#2E7D32' : '#E65100'}
                    style={styles.verificationBadgeIcon}
                  />
                  <Text variant="bodyMedium" style={[
                    styles.verificationBadgeText,
                    { color: usuario.emailVerificado ? '#2E7D32' : '#E65100' },
                  ]}>
                    {usuario.emailVerificado ? 'Correo verificado' : 'Correo no verificado'}
                  </Text>
                </View>
                {!usuario.emailVerificado && (
                  <View style={styles.verificationActions}>
                    <Button
                      mode="outlined"
                      onPress={handleSendVerificationEmail}
                      loading={sendingEmail}
                      disabled={sendingEmail}
                      style={styles.verifyButton}
                      compact
                    >
                      Enviar correo de verificación
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => setIsVerifyEmailModalVisible(true)}
                      disabled={sendingEmail}
                      style={styles.verifyCodeButton}
                      compact
                      textColor="#6CB4EE"
                    >
                      Ya tengo el código
                    </Button>
                  </View>
                )}
              </View>
            </View>
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

      {usuario && (
        <VerifyEmailModal
          visible={isVerifyEmailModalVisible}
          onDismiss={() => setIsVerifyEmailModalVisible(false)}
          onSuccess={() => {
            fetchProfile();
          }}
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
  emailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    color: '#666666',
    fontWeight: '600',
  },
  infoValue: {
    color: '#333333',
    marginLeft: 28,
  },
  emailVerificationRow: {
    marginLeft: 28,
    marginTop: 12,
    gap: 12,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  verificationBadgeVerified: {
    backgroundColor: '#E8F5E9',
  },
  verificationBadgeNotVerified: {
    backgroundColor: '#FFF3E0',
  },
  verificationBadgeIcon: {
    marginRight: 6,
  },
  verificationBadgeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  verificationActions: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
  },
  verifyButton: {
    alignSelf: 'flex-start',
    borderColor: '#6CB4EE',
  },
  verifyCodeButton: {
    alignSelf: 'flex-start',
  },
});
