import React from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface SelectTriggerFieldProps {
  label: string;
  selectedContent?: React.ReactNode;
  placeholder?: string;
  onPress: () => void;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  labelStyle?: object;
  placeholderStyle?: object;
}

const defaultTriggerStyle: ViewStyle = {
  marginTop: 5,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  borderWidth: 1.5,
  borderColor: '#E0E0E0',
  minHeight: 56,
  justifyContent: 'center',
};
const errorTriggerStyle: ViewStyle = { borderColor: '#C62828' };
const labelStyleDefault = { fontWeight: '600' as const, color: '#333333', marginLeft: 3 };
const containerStyleDefault: ViewStyle = { marginTop: 15 };
const contentRowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 12,
};
const placeholderStyleDefault = { color: '#999999' };
const fieldErrorStyle = { color: '#C62828', marginTop: 5, marginLeft: 3 };

export function SelectTriggerField(p: SelectTriggerFieldProps) {
  const b = p;
  return (
    <View style={b.containerStyle || containerStyleDefault}>
      <Text variant="bodyMedium" style={b.labelStyle || labelStyleDefault}>{b.label}</Text>
      <TouchableOpacity
        onPress={b.onPress}
        disabled={b.disabled || false}
        activeOpacity={0.7}
        style={[defaultTriggerStyle, b.error ? errorTriggerStyle : null, b.triggerStyle]}
      >
        <View style={contentRowStyle}>
          {b.selectedContent ?? (
            <Text variant="bodyMedium" style={b.placeholderStyle || placeholderStyleDefault}>
              {b.placeholder || 'Selecciona una opción'}
            </Text>
          )}
          <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
        </View>
      </TouchableOpacity>
      {b.error ? <Text variant="bodySmall" style={fieldErrorStyle}>{b.error}</Text> : null}
    </View>
  );
}
