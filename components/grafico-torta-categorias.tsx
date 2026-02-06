import { ResumenPorCategoria } from '@/features/reporte/interfaces/reporte.interface';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface GraficoTortaCategoriasProps {
  data: ResumenPorCategoria[];
}

const screenWidth = Dimensions.get('window').width;
const chartWidth = Math.min(screenWidth * 0.5, 180);
const chartHeight = 160;

const chartConfig = {
  color: (opacity = 1) => `rgba(108, 180, 238, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
  style: {
    borderRadius: 16,
    paddingRight: 0,
  },
  propsForLabels: {
    fontSize: 11,
  },
};

export function GraficoTortaCategorias({ data }: GraficoTortaCategoriasProps) {
  if (!data || data.length === 0) return null;

  const pieData = data.map((item) => ({
    name: item.categoria.nombre,
    population: item.total,
    color: item.categoria.color || '#6CB4EE',
    legendFontColor: '#666666',
    legendFontSize: 12,
  }));

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="chart-donut" size={24} color="#6CB4EE" />
          <Text variant="titleMedium" style={styles.title}>
            Distribución por categorías
          </Text>
        </View>
        <View style={styles.chartWrapper}>
          <View style={styles.chartContainer}>
            <PieChart
              data={pieData}
              width={chartWidth}
              height={chartHeight}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              hasLegend={false}
              absolute={false}
              avoidFalseZero
            />
          </View>
          <View style={styles.legendContainer}>
            {pieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text variant="bodySmall" style={styles.legendLabel}>
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontWeight: '600',
    color: '#333333',
  },
  chartWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  legendLabel: {
    color: '#666666',
    flex: 1,
    flexShrink: 1,
  },
});
