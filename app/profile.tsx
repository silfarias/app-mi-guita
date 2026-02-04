import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';

import { BoxProfile, BoxProfileStatus } from '@/components/box-profile';
import { useProfile } from '@/features/auth/hooks/auth.hook';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDate } from '@/utils/formatDate';
import { Header } from '@/components/ui/header';

export default function ProfileScreen() {
  const { usuario, loading, error, fetchProfile } = useProfile();

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>

      <Header title="Mi Perfil" onBack={() => router.back()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6CB4EE" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Cargando perfil...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#D32F2F" />
          <Text variant="bodyLarge" style={styles.errorText}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchProfile}
          >
            <Text variant="bodyMedium" style={styles.retryButtonText}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : usuario ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Foto de Perfil */}
          <View style={styles.profileImageContainer}>
            {usuario.fotoPerfil ? (
              <Image
                source={{ uri: usuario.fotoPerfil }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={80}
                  color="#6CB4EE"
                />
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <BoxProfile icon="account" title="Nombre Completo" value={usuario.persona.nombre + ' ' + usuario.persona.apellido} />
            <BoxProfile icon="account-circle" title="Nombre de Usuario" value={usuario.nombreUsuario} />
            <BoxProfile icon="email" title="Email" value={usuario.email} />
            <BoxProfileStatus isActive={usuario.activo} />
            <BoxProfile icon="clock-outline" title="Último Acceso" value={formatDate(usuario.ultimoAcceso)} />
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6CB4EE',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
  },
});
