import { InfoInicialModal } from '@/components/info-inicial-modal';
import { Header } from '@/components/ui/header';
import {
  EmptyStateCard,
  ErrorStateCard,
  LoadingStateBlock,
} from '@/common/components';
import {
  InfoInicialExplanationBanner,
  InfoInicialMediosPagoList,
  InfoInicialMonthHeader,
  InfoInicialTotalCard,
} from '@/features/info-inicial/components';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function InfoInicialMesScreen() {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const {
    data: infoInicial,
    loading: loadingInfo,
    error: errorInfo,
    fetch,
  } = useInfoInicialPorUsuario();

  useEffect(() => {
    fetch();
  }, []);

  const infoInicialData = infoInicial && infoInicial.length > 0 ? infoInicial[0] : null;
  const montoTotal = infoInicialData?.montoTotal ?? 0;

  const handleEdit = () => {
    if (infoInicialData) {
      setIsEditModalVisible(true);
    }
  };

  const handleRefresh = () => {
    fetch();
  };

  return (
    <View style={styles.container}>
      <Header title="Inicio del Mes" onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingInfo ? (
          <LoadingStateBlock message="Cargando información..." />
        ) : errorInfo ? (
          <ErrorStateCard message={errorInfo} onRetry={handleRefresh} />
        ) : infoInicialData ? (
          <>
            <InfoInicialMonthHeader
              mes={infoInicialData.mes}
              anio={infoInicialData.anio}
              onEdit={handleEdit}
            />

            <InfoInicialExplanationBanner text="Esta es la cantidad de dinero con la que iniciaste este mes" />

            <InfoInicialTotalCard montoTotal={montoTotal} />

            <InfoInicialMediosPagoList
              mediosPago={infoInicialData.mediosPago || []}
              montoTotal={typeof montoTotal === 'string' ? parseFloat(montoTotal) : montoTotal}
            />
          </>
        ) : (
          <EmptyStateCard
            icon="information-outline"
            iconColor="#CCCCCC"
            iconSize={48}
            title="No hay información inicial disponible"
            description="Registra tu información inicial para comenzar"
          />
        )}
      </ScrollView>

      <InfoInicialModal
        visible={isEditModalVisible}
        onDismiss={() => setIsEditModalVisible(false)}
        infoInicialId={infoInicialData?.id || null}
        onSuccess={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
});
