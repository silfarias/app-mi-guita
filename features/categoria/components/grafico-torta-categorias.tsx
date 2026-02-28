import { ResumenPorCategoria } from '@/features/reporte/interfaces/reporte.interface';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface GraficoTortaCategoriasProps {
  data: ResumenPorCategoria[];
}

const screenWidth = Dimensions.get("window").width;
// Ancho fijo más pequeño para asegurar que quepa bien y se vea completo
const chartWidth = 150;
const chartHeight = 150;

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
    percentage: item.porcentaje ? item.porcentaje.toFixed(0) : '0',
  }));

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="chart-donut" size={24} color="#6CB4EE" />
            <Text variant="titleMedium" style={styles.title}>
              Distribución por categorías
            </Text>
          </View>
          <View style={styles.chartWrapper}>
            {/* Gráfico de torta a la izquierda */}
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                width={chartWidth}
                height={chartHeight}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="30"
                hasLegend={false}
                absolute={true}
                avoidFalseZero
              />
            </View>
            
            {/* Leyenda a la derecha con porcentajes */}
            <View style={styles.legendContainer}>
              <ScrollView 
                style={styles.legendScrollContainer}
                contentContainerStyle={styles.legendContentContainer}
                showsVerticalScrollIndicator={false}
              >
                {pieData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <View style={styles.legendTextContainer}>
                      <Text variant="bodySmall" style={styles.legendPercentage}>
                        {item.percentage}%
                      </Text>
                      <Text 
                        variant="bodySmall" 
                        style={styles.legendLabel}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item.name}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
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
    elevation: 0,
    overflow: 'visible',
  },
  contentWrapper: {
    padding: 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8
  },
  title: {
    fontWeight: '600',
    color: '#333333',
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chartContainer: {
    width: '50%',
    height: chartHeight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible'
  },
  legendContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: -15,
  },
  legendScrollContainer: {
    maxHeight: chartHeight,
  },
  legendContentContainer: {
    paddingRight: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    gap: 5
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    flexShrink: 0,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 5
  },
  legendPercentage: {
    color: '#333333',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 2,
  },
  legendLabel: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 16,
  },
});
