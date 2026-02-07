import { CategoriaModal } from '@/components/categoria-modal';
import { MedioPagoModal } from '@/components/medio-pago-modal';
import { FormActions, SelectTriggerField } from '@/common/components';
import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { useMediosPago } from '@/features/medio-pago/hooks/medio-pago.hook';
import { Categoria } from '@/features/categoria/interfaces/categoria.interface';
import { InfoInicialResponse } from '@/features/info-inicial/interfaces/info-inicial.interface';
import { MedioPago } from '@/features/medio-pago/interfaces/medio-pago.interface';
import { MovimientoFiltros, TipoMovimientoEnum } from '@/features/movimiento/interfaces/movimiento.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Menu, Text } from 'react-native-paper';

export interface MovimientosFilterCardProps {
  filtrosTemporales: Partial<MovimientoFiltros>;
  onFiltrosChange: (filtros: Partial<MovimientoFiltros>) => void;
  onAplicar: () => void;
  onLimpiar: () => void;
}

const filterSelectStyle = { backgroundColor: '#F5F5F5', minHeight: 44 } as const;
const filterContainerStyle = { marginTop: 0, marginBottom: 16 } as const;
const filterLabelStyle = { marginBottom: 8, color: '#666666', fontWeight: '500' as const } as const;

function formatMesSelector(mes: string, anio: number): string {
  return `${mes} ${anio}`;
}

export function MovimientosFilterCard({
  filtrosTemporales,
  onFiltrosChange,
  onAplicar,
  onLimpiar,
}: MovimientosFilterCardProps) {
  const [mesMenuVisible, setMesMenuVisible] = useState(false);
  const [tipoMovimientoMenuVisible, setTipoMovimientoMenuVisible] = useState(false);
  const [isCategoriaModalVisible, setIsCategoriaModalVisible] = useState(false);
  const [isMedioPagoModalVisible, setIsMedioPagoModalVisible] = useState(false);

  const { data: infoIniciales, fetch: fetchInfoIniciales } = useInfoInicialPorUsuario();
  const { data: categorias } = useCategorias({ activo: true });
  const { data: mediosPago } = useMediosPago();

  useEffect(() => {
    fetchInfoIniciales();
  }, []);

  const infoInicialSeleccionada = infoIniciales?.find((info) => info.id === filtrosTemporales.infoInicialId);
  const categoriaSeleccionada = categorias?.find((c) => c.id === filtrosTemporales.categoriaId);
  const medioPagoSeleccionado = mediosPago?.find((m) => m.id === filtrosTemporales.medioPagoId);

  const tipoLabel =
    filtrosTemporales.tipoMovimiento === TipoMovimientoEnum.INGRESO
      ? 'Ingreso'
      : filtrosTemporales.tipoMovimiento === TipoMovimientoEnum.EGRESO
        ? 'Egreso'
        : '--';

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Filtrar movimientos
        </Text>

        {/* Mes */}
        <View style={styles.filterRow}>
          <Text variant="bodyMedium" style={filterLabelStyle}>Mes</Text>
          <Menu
            visible={mesMenuVisible}
            onDismiss={() => setMesMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={[styles.filterSelect, filterSelectStyle]}
                onPress={() => setMesMenuVisible(true)}
              >
                <Text style={styles.selectText}>
                  {infoInicialSeleccionada
                    ? formatMesSelector(infoInicialSeleccionada.mes, infoInicialSeleccionada.anio)
                    : 'Seleccionar mes'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                onFiltrosChange({ ...filtrosTemporales, infoInicialId: undefined });
                setMesMenuVisible(false);
              }}
              title="Todos los meses"
            />
            {infoIniciales?.map((info: InfoInicialResponse) => (
              <Menu.Item
                key={info.id}
                onPress={() => {
                  onFiltrosChange({ ...filtrosTemporales, infoInicialId: info.id });
                  setMesMenuVisible(false);
                }}
                title={formatMesSelector(info.mes, info.anio)}
              />
            ))}
          </Menu>
        </View>

        {/* Tipo de Movimiento */}
        <View style={styles.filterRow}>
          <Text variant="bodyMedium" style={filterLabelStyle}>Tipo de movimiento</Text>
          <Menu
            visible={tipoMovimientoMenuVisible}
            onDismiss={() => setTipoMovimientoMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={[styles.filterSelect, filterSelectStyle]}
                onPress={() => setTipoMovimientoMenuVisible(true)}
              >
                <Text style={styles.selectText}>{tipoLabel}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                onFiltrosChange({ ...filtrosTemporales, tipoMovimiento: undefined });
                setTipoMovimientoMenuVisible(false);
              }}
              title="Todos"
            />
            <Menu.Item
              onPress={() => {
                onFiltrosChange({ ...filtrosTemporales, tipoMovimiento: TipoMovimientoEnum.INGRESO });
                setTipoMovimientoMenuVisible(false);
              }}
              title="Ingreso"
            />
            <Menu.Item
              onPress={() => {
                onFiltrosChange({ ...filtrosTemporales, tipoMovimiento: TipoMovimientoEnum.EGRESO });
                setTipoMovimientoMenuVisible(false);
              }}
              title="Egreso"
            />
          </Menu>
        </View>

        {/* Categoría */}
        <SelectTriggerField
          label="Categoría"
          placeholder="Seleccionar categoría"
          selectedContent={
            categoriaSeleccionada ? (
              <View style={styles.selectedRow}>
                <MaterialCommunityIcons
                  name={categoriaSeleccionada.icono as any}
                  size={20}
                  color={categoriaSeleccionada.color}
                  style={styles.selectIcon}
                />
                <Text variant="bodyMedium" style={[styles.selectText, { color: categoriaSeleccionada.color }]}>
                  {categoriaSeleccionada.nombre}
                </Text>
              </View>
            ) : undefined
          }
          onPress={() => setIsCategoriaModalVisible(true)}
          containerStyle={filterContainerStyle}
          triggerStyle={filterSelectStyle}
          labelStyle={filterLabelStyle}
        />

        {/* Medio de Pago */}
        <SelectTriggerField
          label="Medio de pago"
          placeholder="Seleccionar medio de pago"
          selectedContent={
            medioPagoSeleccionado ? (
              <View style={styles.selectedRow}>
                <MaterialCommunityIcons
                  name={medioPagoSeleccionado.tipo === 'BILLETERA_VIRTUAL' ? 'wallet' : 'bank'}
                  size={20}
                  color="#6CB4EE"
                  style={styles.selectIcon}
                />
                <Text variant="bodyMedium" style={styles.selectText}>
                  {medioPagoSeleccionado.nombre}
                </Text>
              </View>
            ) : undefined
          }
          onPress={() => setIsMedioPagoModalVisible(true)}
          containerStyle={filterContainerStyle}
          triggerStyle={filterSelectStyle}
          labelStyle={filterLabelStyle}
        />

        {/* Botones */}
        <FormActions
          cancelLabel="Limpiar"
          submitLabel="Aplicar"
          onCancel={onLimpiar}
          onSubmit={onAplicar}
          submitButtonColor="#6CB4EE"
          style={styles.actions}
        />
      </Card.Content>

      <CategoriaModal
        visible={isCategoriaModalVisible}
        onDismiss={() => setIsCategoriaModalVisible(false)}
        onSelect={(categoria: Categoria) => {
          onFiltrosChange({ ...filtrosTemporales, categoriaId: categoria.id });
          setIsCategoriaModalVisible(false);
        }}
        selectedValue={filtrosTemporales.categoriaId}
      />

      <MedioPagoModal
        visible={isMedioPagoModalVisible}
        onDismiss={() => setIsMedioPagoModalVisible(false)}
        onSelect={(medio: MedioPago) => {
          onFiltrosChange({ ...filtrosTemporales, medioPagoId: medio.id });
          setIsMedioPagoModalVisible(false);
        }}
        selectedValue={filtrosTemporales.medioPagoId}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginBottom: 16,
    fontWeight: '600',
    color: '#333333',
  },
  filterRow: {
    marginBottom: 16,
  },
  filterSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  selectIcon: {
    marginRight: 8,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
  },
  actions: {
    marginTop: 8,
  },
});
