import { KeyboardAwareForm } from "@/components/KeyboardAwareScrollViewCompat";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
export function AuthField({
  label,
  value,
  onChangeText,
  password = false,
  numeric = false,
  maxLength = 254,
  placeholder,
  icon,
  disabled = false,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  password?: boolean;
  numeric?: boolean;
  maxLength?: number;
  placeholder?: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  disabled?: boolean;
  autoComplete?: React.ComponentProps<typeof TextInput>["autoComplete"];
}) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <KeyboardAwareForm style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          {
            borderColor: focused ? colors.secondaryForeground : colors.input,
            backgroundColor: focused ? colors.card : colors.background,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Feather
          name={icon ?? (password ? "lock" : numeric ? "credit-card" : "user")}
          size={20}
          color={focused ? colors.secondaryForeground : colors.mutedForeground}
          style={styles.leadingIcon}
        />
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          editable={!disabled}
          placeholder={placeholder ?? (password ? "กรอกรหัสผ่าน" : label)}
          placeholderTextColor={colors.mutedForeground}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={password && !visible}
          keyboardType={numeric ? "number-pad" : "default"}
          maxLength={maxLength}
          style={[styles.input, { color: colors.foreground }]}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => setVisible(!visible)}
            style={styles.eyeButton}
          >
            <Feather
              name={visible ? "eye-off" : "eye"}
              size={20}
              color={colors.secondaryForeground}
            />
          </Pressable>
        ) : null}
      </View>
    </KeyboardAwareForm>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8, minWidth: 0, width: "100%" },
  label: { fontSize: 14, fontWeight: "600", lineHeight: 22 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
  },
  leadingIcon: { marginLeft: 16 },
  input: {
    outlineWidth: 0,
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    minWidth: 48,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
});

