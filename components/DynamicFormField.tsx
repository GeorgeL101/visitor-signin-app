import React from 'react';
import { TextInput, StyleSheet, Platform, View } from 'react-native';
import { FormField } from '../utils/configLoader';

interface DynamicFormFieldProps {
  field: FormField;
  value: string;
  onChangeText: (text: string) => void;
  style?: any;
}

// Web-compatible Select component
const WebSelect: React.FC<{ value: string; onChange: (value: string) => void; options: string[]; placeholder?: string; style?: any }> = 
  ({ value, onChange, options, placeholder, style }) => {
    if (Platform.OS === 'web') {
      return (
        <select
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: '#fff',
            ...style,
          }}
        >
          <option value="">{placeholder || 'Select an option...'}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      );
    }
    // For native, we'll use a basic picker-like TextInput for now
    // You can enhance this with a modal picker later
    return (
      <TextInput
        style={style}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
      />
    );
  };

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChangeText,
  style,
}) => {
  // Render dropdown/select
  if (field.type === 'dropdown' && field.options && field.options.length > 0) {
    return (
      <WebSelect
        value={value}
        onChange={onChangeText}
        options={field.options}
        placeholder={field.placeholder}
        style={style}
      />
    );
  }

  // Render text area
  if (field.type === 'textarea') {
    return (
      <TextInput
        style={[style, styles.textarea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={field.placeholder}
        autoCapitalize={field.autoCapitalize as any}
        multiline
        numberOfLines={4}
      />
    );
  }

  // Render regular text input
  return (
    <TextInput
      style={style}
      value={value}
      onChangeText={onChangeText}
      placeholder={field.placeholder}
      autoCapitalize={field.autoCapitalize as any}
      keyboardType={field.keyboardType as any}
      returnKeyType="done"
      blurOnSubmit={true}
    />
  );
};

const styles = StyleSheet.create({
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    ...(Platform.OS === 'web' ? {
      padding: 12,
      fontSize: 16,
    } : {}),
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});
