import { FormActions, SelectTriggerField } from '@/common/components';
import { CategoriaModal } from '@/features/categoria/components/categoria-modal';
import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import { Categoria } from '@/features/categoria/interfaces/categoria.interface';
import { useCuentas } from '@/features/cuenta/hooks/cuenta.hook';
import { CuentaItemResponse } from '@/features/cuenta/interfaces/cuenta.interface';
import { MovimientoFiltros, TipoMovimientoEnum } from '@/features/movimiento/interfaces/movimiento.interface';
import { getFechasDelMes, MESES } from '@/features/consultas-historicas/utils/meses';
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

/** Genera los últimos 12 meses para el selector. */
function getMesesDisponibles(): { mes: string; anio: number }[] {
  const now = new Date();
  const result: { mes: string; anio: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      mes: MESES[d.getMonth()],
      anio: d.getFullYear(),
    });
  }
  return result;
}

export function MovimientosFilterCard({
  filtrosTemporales,
  onFiltrosChange,
  onAplicar,
  onLimpiar,
}: MovimientosFilterCardProps) {
  const [mesMenuVisible, setMesMenuVisible] = useState(false);
  const [cuentaMenuVisible, setCuentaMenuVisible] = useState(false);
  const [tipoMovimientoMenuVisible, setTipoMovimientoMenuVisible] = useState(false);
  const [isCategoriaModalVisible, setIsCategoriaModalVisible] = useState(false);

  const mesesDisponibles = getMesesDisponibles();
  const { data: cuentas, fetch: fetchCuentas } = useCuentas();
  const { data: categorias } = useCategorias({ activo: true });

  useEffect(() => {
    fetchCuentas();
  }, []);

  const mesAnioSeleccionado = filtrosTemporales.fechaDesde
    ? (() => {
        const [y, m] = filtrosTemporales.fechaDesde.split('-').map(Number);
        const mesStr = MESES[m - 1];
        return mesStr ? { mes: mesStr, anio: y } : null;
      })()
    : null;
  const cuentaSeleccionada = cuentas?.find((c) => c.id === filtrosTemporales.cuentaId);
  const categoriaSeleccionada = categorias?.find((c) => c.id === filtrosTemporales.categoriaId);

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
                  {mesAnioSeleccionado
                    ? formatMesSelector(mesAnioSeleccionado.mes, mesAnioSeleccionado.anio)
                    : 'Seleccionar mes'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                onFiltrosChange({
                  ...filtrosTemporales,
                  fechaDesde: undefined,
                  fechaHasta: undefined,
                });
                setMesMenuVisible(false);
              }}
              title="Todos los meses"
            />
            {mesesDisponibles.map((item) => (
              <Menu.Item
                key={`${item.mes}-${item.anio}`}
                onPress={() => {
                  const { fechaDesde, fechaHasta } = getFechasDelMes(item.mes, item.anio);
                  onFiltrosChange({
                    ...filtrosTemporales,
                    fechaDesde,
                    fechaHasta,
                  });
                  setMesMenuVisible(false);
                }}
                title={formatMesSelector(item.mes, item.anio)}
              />
            ))}
          </Menu>
        </View>

        {/* Cuenta */}
        <View style={styles.filterRow}>
          <Text variant="bodyMedium" style={filterLabelStyle}>Cuenta</Text>
          <Menu
            visible={cuentaMenuVisible}
            onDismiss={() => setCuentaMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={[styles.filterSelect, filterSelectStyle]}
                onPress={() => setCuentaMenuVisible(true)}
              >
                <Text style={styles.selectText}>
                  {cuentaSeleccionada ? cuentaSeleccionada.nombre : 'Todas las cuentas'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                onFiltrosChange({ ...filtrosTemporales, cuentaId: undefined });
                setCuentaMenuVisible(false);
              }}
              title="Todas las cuentas"
            />
            {cuentas?.map((c: CuentaItemResponse) => (
              <Menu.Item
                key={c.id}
                onPress={() => {
                  onFiltrosChange({ ...filtrosTemporales, cuentaId: c.id });
                  setCuentaMenuVisible(false);
                }}
                title={c.nombre}
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
