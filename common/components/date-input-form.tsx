import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { DatePickerInput, registerTranslation } from 'react-native-paper-dates';

registerTranslation('es', {
  save: 'Guardar',
  selectSingle: 'Seleccionar fecha',
  selectMultiple: 'Seleccionar fechas',
  selectRange: 'Seleccionar rango',
  notAccordingToDateFormat: (inputFormat: string) => `El formato debe ser ${inputFormat}`,
  mustBeHigherThan: (date: string) => `Debe ser posterior a ${date}`,
  mustBeLowerThan: (date: string) => `Debe ser anterior a ${date}`,
  mustBeBetween: (startDate: string, endDate: string) => `Debe estar entre ${startDate} y ${endDate}`,
  dateIsDisabled: 'Fecha no permitida',
  previous: 'Anterior',
  next: 'Siguiente',
  typeInDate: 'Escriba la fecha',
  pickDateFromCalendar: 'Seleccione una fecha del calendario',
  close: 'Cerrar',
});

export type DateInputMode = 'date' | 'time' | 'datetime';

export interface DateInputFormProps {
  value: Date | string | undefined;
  onChange: (value: Date | string) => void;
  outputFormat?: 'date' | 'string';
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  mode?: DateInputMode;
  fechaMinima?: Date;
  fechaMaxima?: Date;
  style?: object;
  inputStyle?: object;
  contentStyle?: object;
}

export function DateInputForm(props: DateInputFormProps) {
  const {
    value,
    onChange,
    outputFormat = 'string',
    label = 'Fecha',
    error,
    disabled = false,
    fechaMinima,
    fechaMaxima,
    style,
    inputStyle,
    contentStyle,
  } = props;

  const dateValue =
    value === undefined || value === null || value === ''
      ? undefined
      : typeof value === 'string'
        ? new Date(value.trim() + 'T12:00:00')
        : value;

  const handleChange = (d: Date | undefined) => {
    if (!d) {
      onChange(outputFormat === 'string' ? '' : (undefined as unknown as Date));
      return;
    }
    if (outputFormat === 'string') {
      onChange(d.toISOString().split('T')[0]);
    } else {
      onChange(d);
    }
  };

  return (
    <View style={[style, { marginBottom: error ? 4 : 0 }]}>
      <DatePickerInput
        locale="es"
        label={label}
        value={dateValue}
        onChange={handleChange}
        inputMode="start"
        mode="outlined"
        inputEnabled={!disabled}
        hasError={!!error}
        style={inputStyle}
        contentStyle={contentStyle}
        startYear={fechaMinima?.getFullYear() ?? 1900}
        endYear={fechaMaxima?.getFullYear() ?? 2200}
        validRange={
          fechaMinima != null || fechaMaxima != null
            ? { startDate: fechaMinima ?? undefined, endDate: fechaMaxima ?? undefined }
            : undefined
        }
      />
      {error ? (
        <Text variant="bodySmall" style={{ color: '#C62828', marginTop: 6, marginBottom: 4, marginLeft: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
