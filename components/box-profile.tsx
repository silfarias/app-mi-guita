import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface BoxProfileProps {
  icon: string;
  title: string;
  value: string;
}

export function BoxProfile({ icon, title, value }: BoxProfileProps) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <MaterialCommunityIcons name={icon as any} size={20} color="#6CB4EE" />
        <Text variant="titleMedium" style={styles.infoLabel}>
          {title}
        </Text>
      </View>
      <Text variant="bodyLarge" style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

interface BoxProfileStatusProps {
  isActive: boolean;
}

export function BoxProfileStatus({ isActive }: BoxProfileStatusProps) {
  const iconName = isActive ? 'check-circle' : 'close-circle';
  const iconColor = isActive ? '#4CAF50' : '#D32F2F';
  const badgeBgColor = isActive ? '#E8F5E9' : '#FFEBEE';
  const badgeTextColor = isActive ? '#4CAF50' : '#D32F2F';
  const statusText = isActive ? 'Activo' : 'Inactivo';

  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <MaterialCommunityIcons name={iconName as any} size={20} color={iconColor} />
        <Text variant="titleMedium" style={styles.infoLabel}>
          Estado
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: badgeBgColor }]}>
          <Text variant="bodyMedium" style={[styles.statusText, { color: badgeTextColor }]}>
            {statusText}
          </Text>
        </View>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
    infoCard: {
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
    statusContainer: {
        marginLeft: 28,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontWeight: '600',
    },
});
