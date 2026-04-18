import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

/**
 * Custom Input component for consistent styling.
 * @param {object} props 
 */
export const Input = ({ icon, error, rightElement, ...props }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.wrapper, !!error && styles.errorBorder]}>
        {icon && (
          <Ionicons name={icon} size={20} color={colors.textHint} style={styles.icon} />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textHint}
          {...props}
        />
        {rightElement}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.divider,
    paddingHorizontal: 14,
    height: 52,
  },
  errorBorder: { borderColor: colors.lostColor },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.onSurface },
  errorText: { color: colors.lostColor, fontSize: 12, marginTop: 4, marginLeft: 4 },
});
