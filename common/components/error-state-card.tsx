import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export interface ErrorStateCardProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: string;
  iconColor?: string;
  style?: object;
}

export function ErrorStateCard({
  message,
  onRetry,
  retryLabel = 'Reintentar',
  icon = 'alert-circle',
  iconColor = '#D32F2F',
  style,
}: ErrorStateCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        <View style={styles.content}>
          <MaterialCommunityIcons name={icon as any} size={48} color={iconColor} />
          <Text variant="bodyLarge" style={styles.message}>
            {message}
          </Text>
          {onRetry && (
            <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
              <Text variant="bodyMedium" style={styles.retryButtonText}>
                {retryLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  message: {
    marginTop: 16,
    marginBottom: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#6CB4EE',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
