import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

/**
 * Modern Custom Input component with focus state and multiline support.
 */
export const Input = ({ 
  icon, 
  error, 
  rightElement, 
  containerStyle, 
  wrapperStyle, 
  style,
  label,
  onFocus,
  onBlur,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const isMultiline = props.multiline;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View 
        style={[
          styles.wrapper, 
          isMultiline && styles.wrapperMultiline,
          isFocused && styles.focusedBorder,
          !!error && styles.errorBorder,
          wrapperStyle
        ]}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? colors.primary : colors.textHint} 
            style={[styles.icon, isMultiline && { marginTop: 15 }]} 
          />
        )}
        <TextInput
          style={[
            styles.input, 
            isMultiline && styles.inputMultiline,
            style
          ]}
          placeholderTextColor={colors.textHint}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightElement && (
          <View style={[styles.rightElement, isMultiline && { marginTop: 15 }]}>
            {rightElement}
          </View>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 8,
    marginLeft: 4,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.divider,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 0,
  },
  wrapperMultiline: {
    height: undefined,
    minHeight: 120,
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  focusedBorder: {
    borderColor: colors.primary,
    backgroundColor: '#fff',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  errorBorder: { borderColor: colors.lostColor },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
    height: '100%',
  },
  inputMultiline: {
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  rightElement: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  errorText: { color: colors.lostColor, fontSize: 12, marginTop: 6, marginLeft: 8, fontWeight: '500' },
});

