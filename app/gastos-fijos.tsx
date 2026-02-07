import { GastoFijoModal } from '@/components/gasto-fijo-modal';
import { Header } from '@/components/ui/header';
import { useMisGastosFijos } from '@/features/gasto-fijo/hooks/gasto-fijo.hook';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GastosFijosScreen() {
  const insets = useSafeAreaInsets();
  const [isGastoFijoModalVisible, setIsGastoFijoModalVisible] = useState(false);
  const { gastosFijos, loading, error, fetchMisGastosFijos } = useMisGastosFijos();

  useEffect(() => {
    fetchMisGastosFijos();
  }, []);

  const formatCurrency = (amount: string | number | null | undefined) => {
    const num =
      amount === null || amount === undefined || amount === ''
        ? 0
        : typeof amount === 'string'
          ? parseFloat(amount) || 0
          : Number.isFinite(amount)
            ? amount
            : 0;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleRefresh = () => {
    fetchMisGastosFijos();
  };

  return (
    <View style={styles.container}>
      <Header title="Mis Gastos Fijos" onBack={() => router.back()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6CB4EE" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Cargando gastos fijos...
            </Text>
          </View>
        ) : error ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <MaterialCommunityIcons name="alert-circle" size={48} color="#E74C3C" />
              <Text variant="bodyLarge" style={styles.errorText}>
                Error al cargar los datos
              </Text>
              <Text variant="bodySmall" style={styles.errorSubtext}>
                {error}
              </Text>
            </Card.Content>
          </Card>
        ) : gastosFijos.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContent}>
                <MaterialCommunityIcons name="receipt-outline" size={64} color="#999999" />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No hay gastos fijos
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Registra tus gastos fijos para comenzar a llevar un control de tus pagos recurrentes
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setIsGastoFijoModalVisible(true)}
                  style={styles.addButton}
                  buttonColor="#6CB4EE"
                  icon="plus-circle"
                >
                  Agregar Gastos Fijos
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Botón para agregar más gastos fijos */}
            <View style={styles.addButtonContainer}>
              <Button
                mode="contained"
                onPress={() => setIsGastoFijoModalVisible(true)}
                style={styles.addButton}
                buttonColor="#6CB4EE"
                icon="plus-circle"
              >
                Agregar Gastos Fijos
              </Button>
            </View>

            {/* Lista de gastos fijos */}
            {gastosFijos.map((gastoFijo) => (
              <Card key={gastoFijo.id} style={styles.gastoFijoCard}>
                <Card.Content>
                  <View style={styles.gastoFijoHeader}>
                    <View style={styles.gastoFijoLeft}>
                      <View
                        style={[
                          styles.categoriaIconContainer,
                          { backgroundColor: `${gastoFijo.categoria.color}20` },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={gastoFijo.categoria.icono as any}
                          size={24}
                          color={gastoFijo.categoria.color}
                        />
                      </View>
                      <View style={styles.gastoFijoInfo}>
                        <Text variant="titleMedium" style={styles.gastoFijoNombre}>
                          {gastoFijo.nombre}
                        </Text>
                        <Text variant="bodySmall" style={styles.gastoFijoCategoria}>
                          {gastoFijo.categoria.nombre}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.gastoFijoRight}>
                      <Text variant="titleLarge" style={styles.gastoFijoMonto}>
                        {formatCurrency(gastoFijo.montoFijo || 0)}
                      </Text>
                      <Text variant="bodySmall" style={styles.gastoFijoMontoLabel}>
                        por mes
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {/* Modal para agregar gastos fijos */}
      <GastoFijoModal
        visible={isGastoFijoModalVisible}
        onDismiss={() => setIsGastoFijoModalVisible(false)}
        onSuccess={() => {
          fetchMisGastosFijos();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  errorText: {
    marginTop: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    color: '#666666',
    textAlign: 'center',
  },
  emptyCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
    color: '#666666',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButtonContainer: {
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 12,
  },
  gastoFijoCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  gastoFijoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gastoFijoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoriaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gastoFijoInfo: {
    flex: 1,
  },
  gastoFijoNombre: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  gastoFijoCategoria: {
    color: '#666666',
  },
  gastoFijoRight: {
    alignItems: 'flex-end',
  },
  gastoFijoMonto: {
    fontWeight: 'bold',
    color: '#333333',
  },
  gastoFijoMontoLabel: {
    color: '#999999',
    marginTop: 2,
  },
});
