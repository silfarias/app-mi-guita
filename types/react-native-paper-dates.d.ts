declare module 'react-native-paper-dates' {
  import type { ComponentType } from 'react';
  import type { StyleProp, ViewStyle, TextStyle } from 'react-native';

  export interface RegisterTranslationOptions {
    save?: string;
    selectSingle?: string;
    selectMultiple?: string;
    selectRange?: string;
    notAccordingToDateFormat?: (inputFormat: string) => string;
    mustBeHigherThan?: (date: string) => string;
    mustBeLowerThan?: (date: string) => string;
    mustBeBetween?: (startDate: string, endDate: string) => string;
    dateIsDisabled?: string;
    previous?: string;
    next?: string;
    typeInDate?: string;
    pickDateFromCalendar?: string;
    close?: string;
  }

  export function registerTranslation(
    locale: string,
    options: RegisterTranslationOptions
  ): void;

  export interface DatePickerInputProps {
    locale: string;
    label: string;
    value?: Date | undefined;
    onChange: (date: Date | undefined) => void;
    inputMode: 'start' | 'end';
    mode?: 'flat' | 'outlined';
    inputEnabled?: boolean;
    hasError?: boolean;
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<TextStyle>;
    [key: string]: unknown;
  }

  export const DatePickerInput: ComponentType<DatePickerInputProps>;
}
