import { InfoInicialModal } from '@/components/info-inicial-modal';
import { SideMenu, SideMenuItem } from '@/components/side-menu';
import { useLogout } from '@/features/auth/hooks/auth.hook';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { useAuthStore } from '@/store/auth.store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InfoInicialMesScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.usuario?.persona?.nombre || 'Usuario');
  const { logout, loading: logoutLoading } = useLogout();
  const { data: infoInicial, loading: loadingInfo, error: errorInfo, fetch } = useInfoInicialPorUsuario();

  useEffect(() => {
    fetch();
  }, []);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getMedioPagoIcon = (tipo: string) => {
    switch (tipo) {
      case 'BILLETERA_VIRTUAL':
        return 'wallet';
      case 'BANCO':
        return 'bank';
      default:
        return 'credit-card';
    }
  };

  const infoInicialData = infoInicial && infoInicial.length > 0 ? infoInicial[0] : null;

  const handleEdit = () => {
    if (infoInicialData) {
      setIsEditModalVisible(true);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuItems: SideMenuItem[] = [
    {
      icon: 'account-circle',
      label: 'Mi perfil',
      onPress: () => {
        closeMenu();
        router.push('/profile' as any);
      },
    },
    {
      icon: 'format-list-bulleted',
      label: 'Consultas Históricas',
      onPress: () => {
        closeMenu();
        router.push('/consultas-historicas' as any);
      },
    },
    {
      icon: 'logout',
      label: logoutLoading ? 'Cerrando sesión...' : 'Cerrar sesión',
      onPress: () => {
        closeMenu();
        logout();
      },
      disabled: logoutLoading,
      loading: logoutLoading,
      textColor: '#D32F2F',
      iconColor: '#D32F2F',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header con botón hamburguesa */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text variant="headlineSmall" style={styles.title}>
            Hola, {user}
          </Text>
          <IconButton
            icon="menu"
            size={28}
            onPress={toggleMenu}
            style={styles.menuButton}
          />
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingInfo ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6CB4EE" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Cargando información...
            </Text>
          </View>
        ) : errorInfo ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#D32F2F" />
            <Text variant="bodyLarge" style={styles.errorText}>
              {errorInfo}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetch}>
              <Text variant="bodyMedium" style={styles.retryButtonText}>
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        ) : infoInicialData ? (
          <>
            {/* Header del mes */}
            <View style={styles.monthHeader}>
              <View style={styles.monthHeaderContent}>
                <MaterialCommunityIcons name="calendar-month" size={24} color="#6CB4EE" />
                <View style={styles.monthHeaderText}>
                  <Text variant="titleLarge" style={styles.monthText}>
                    {infoInicialData.mes}
                  </Text>
                  <Text variant="bodyMedium" style={styles.yearText}>
                    {infoInicialData.anio}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <MaterialCommunityIcons name="pencil" size={20} color="#6CB4EE" />
                <Text variant="bodyMedium" style={styles.editButtonText}>
                  Editar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Card de Monto Total */}
            <View style={styles.totalCard}>
              <View style={styles.totalCardHeader}>
                <MaterialCommunityIcons name="cash-multiple" size={28} color="#FFFFFF" />
                <Text variant="titleMedium" style={styles.totalCardLabel}>
                  Monto Total Inicial
                </Text>
              </View>
              <Text variant="displaySmall" style={styles.totalAmount}>
                {formatCurrency(infoInicialData.montoTotal)}
              </Text>
            </View>

            {/* Medios de Pago */}
            <View style={styles.mediosPagoContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Distribución por Medio de Pago
              </Text>
              {infoInicialData.mediosPago && infoInicialData.mediosPago.length > 0 ? (
                infoInicialData.mediosPago.map((medio, index) => {
                  const montoNum = parseFloat(medio.monto);
                  const porcentaje = infoInicialData.montoTotal > 0
                    ? ((montoNum / infoInicialData.montoTotal) * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <View key={medio.id || index} style={styles.medioPagoCard}>
                      <View style={styles.medioPagoHeader}>
                        <View style={styles.medioPagoIconContainer}>
                          <MaterialCommunityIcons
                            name={getMedioPagoIcon(medio.medioPago.tipo) as any}
                            size={24}
                            color="#6CB4EE"
                          />
                        </View>
                        <View style={styles.medioPagoInfo}>
                          <Text variant="titleMedium" style={styles.medioPagoName}>
                            {medio.medioPago.nombre}
                          </Text>
                          <Text variant="bodySmall" style={styles.medioPagoTipo}>
                            {medio.medioPago.tipo === 'BILLETERA_VIRTUAL' ? 'Billetera Virtual' : 'Banco'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.medioPagoAmountContainer}>
                        <Text variant="headlineSmall" style={styles.medioPagoAmount}>
                          {formatCurrency(medio.monto)}
                        </Text>
                        <View style={styles.porcentajeBadge}>
                          <Text variant="bodySmall" style={styles.porcentajeText}>
                            {porcentaje}%
                          </Text>
                        </View>
                      </View>
                      {/* Barra de progreso visual */}
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${porcentaje}%` as `${number}%`,
                              backgroundColor: '#6CB4EE',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="wallet-outline" size={48} color="#CCCCCC" />
                  <Text variant="bodyLarge" style={styles.emptyStateText}>
                    No hay medios de pago registrados
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="information-outline" size={48} color="#CCCCCC" />
            <Text variant="bodyLarge" style={styles.emptyStateText}>
              No hay información inicial disponible
            </Text>
            <Text variant="bodyMedium" style={styles.emptyStateSubtext}>
              Registra tu información inicial para comenzar
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Menú lateral */}
      <SideMenu visible={isMenuOpen} onClose={closeMenu} items={menuItems} />

      {/* Modal de Edición */}
      <InfoInicialModal
        visible={isEditModalVisible}
        onDismiss={() => setIsEditModalVisible(false)}
        infoInicialId={infoInicialData?.id || null}
        onSuccess={() => {
          fetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
  },
  menuButton: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  monthHeader: {
    marginBottom: 24,
  },
  monthHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthHeaderText: {
    flex: 1,
  },
  monthText: {
    fontWeight: 'bold',
    color: '#333333',
  },
  yearText: {
    color: '#666666',
    marginTop: 2,
  },
  totalCard: {
    backgroundColor: '#6CB4EE',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#6CB4EE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  totalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  totalCardLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  totalAmount: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  mediosPagoContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  medioPagoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medioPagoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  medioPagoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medioPagoInfo: {
    flex: 1,
  },
  medioPagoName: {
    fontWeight: '600',
    color: '#333333',
  },
  medioPagoTipo: {
    color: '#666666',
    marginTop: 2,
  },
  medioPagoAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medioPagoAmount: {
    fontWeight: 'bold',
    color: '#333333',
  },
  porcentajeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  porcentajeText: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    color: '#666666',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: 8,
    color: '#999999',
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  editButtonText: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
});