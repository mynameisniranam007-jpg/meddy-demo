import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/useColors";
export function AuthField({
  label,
  value,
  onChangeText,
  password = false,
  numeric = false,
  maxLength = 254,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  password?: boolean;
  numeric?: boolean;
  maxLength?: number;
}) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{ color: colors.foreground, fontSize: 15, fontWeight: "700" }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: colors.input,
          backgroundColor: colors.background,
          borderRadius: 14,
        }}
      >
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={password && !visible}
          keyboardType={numeric ? "number-pad" : "default"}
          maxLength={maxLength}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 54,
            paddingHorizontal: 14,
            fontSize: 17,
            color: colors.foreground,
          }}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            onPress={() => setVisible(!visible)}
            style={{ padding: 14 }}
          >
            <Text style={{ color: colors.primary }}>
              {visible ? "ซ่อน" : "แสดง"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
