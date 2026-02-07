import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

export interface FormActionsProps {
  cancelLabel?: string;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
  submitButtonColor?: string;
}

const defaultContainerStyle = { flexDirection: 'row', gap: 12, marginTop: 20 };
const defaultButtonStyle = { flex: 1, borderRadius: 12 };
const cancelButtonStyle = { borderColor: '#E0E0E0' };
const buttonContentStyle = { paddingVertical: 8 };
const buttonLabelStyle = { fontSize: 16, fontWeight: '600' as const };

export function FormActions(p: FormActionsProps) {
  const {
    cancelLabel = 'Cancelar',
    submitLabel = 'Guardar',
    onCancel,
    onSubmit,
    disabled = false,
    loading = false,
    style,
    submitButtonColor = '#6CB4EE',
  } = p;
  return (
    <View style={[defaultContainerStyle, style]}>
      <Button
        mode="outlined"
        onPress={onCancel}
        disabled={disabled}
        style={[defaultButtonStyle, cancelButtonStyle]}
        contentStyle={buttonContentStyle}
        labelStyle={buttonLabelStyle}
      >
        {cancelLabel}
      </Button>
      <Button
        mode="contained"
        onPress={onSubmit}
        disabled={disabled}
        loading={loading}
        style={defaultButtonStyle}
        contentStyle={buttonContentStyle}
        labelStyle={buttonLabelStyle}
        buttonColor={submitButtonColor}
      >
        {submitLabel}
      </Button>
    </View>
  );
}
