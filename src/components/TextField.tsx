// src/components/TextField.tsx
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TextInputProps } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, space, radius, type, fonts } from '../theme';

// "extends TextInputProps" means our field also accepts every normal TextInput
// prop (keyboardType, secureTextEntry, autoFocus...) without us listing them.
type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;               // when set, the field turns red and shows this message
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  onTrailingPress?: () => void; // e.g. the map icon in "Where to?"
  disabled?: boolean;
};

export function TextField({
  label,
  error,
  leadingIcon,
  trailingIcon,
  onTrailingPress,
  disabled = false,
  value,
  onFocus,
  onBlur,
  ...inputProps // "rest": everything else gets passed straight to TextInput
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  // One place decides the border colour, in priority order.
  const borderColor = error
    ? colors.status.error
    : focused
    ? colors.border.focus
    : colors.border.default;
  const borderWidth = error || focused ? 1.5 : 1;

  return (
    <View style={[styles.wrapper, disabled && { opacity: 0.5 }]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.field, { borderColor, borderWidth }]}>
        {leadingIcon && (
          <Icon name={leadingIcon} color={focused ? colors.icon.accent : colors.icon.muted} />
        )}

        <TextInput
          {...inputProps}
          value={value}
          editable={!disabled}
          placeholderTextColor={colors.text.tertiary}
          selectionColor={colors.border.focus}
          style={styles.input}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e); // ?. only calls it if the parent actually passed one
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />

        {trailingIcon && (
          <Pressable onPress={onTrailingPress} hitSlop={12} disabled={!onTrailingPress}>
            <Icon name={trailingIcon} color={colors.icon.muted} />
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: space.sm, alignSelf: 'stretch' },
  label: { ...type.captionStrong, color: colors.text.secondary },
  field: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surfaceRaised,
  },
  input: {
    flex: 1,               // take all the space between the icons
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text.primary,
  },
  error: { ...type.caption, color: colors.status.error },
});