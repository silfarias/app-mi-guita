import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export interface EmptyStateCardProps {
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  title: string;
  description?: string;
  style?: object;
}

export function EmptyStateCard({
  icon = 'inbox-outline',
  iconColor = '#999999',
  iconSize = 64,
  title,
  description,
  style,
}: EmptyStateCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        <View style={styles.content}>
          <MaterialCommunityIcons name={icon as any} size={iconSize} color={iconColor} />
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          {description ? (
            <Text variant="bodyMedium" style={styles.description}>
              {description}
            </Text>
          ) : null}
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
    paddingVertical: 40,
  },
  title: {
    marginTop: 16,
    fontWeight: '600',
    color: '#333333',
  },
  description: {
    marginTop: 8,
    color: '#666666',
    textAlign: 'center',
  },
});
