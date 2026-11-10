import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import React, { ReactNode, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { design } from "@/constants/design";

type IconName = React.ComponentProps<typeof Feather>["name"];
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Screen({
  children,
  contentStyle,
  scroll = true,
  keyboardTaps = "handled",
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  keyboardTaps?: "always" | "never" | "handled";
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === "web" ? 16 : insets.top + 4;
  const paddingBottom = !scroll
    ? Platform.OS === "web"
      ? 16
      : insets.bottom + 12
    : Platform.OS === "web"
      ? 112
      : insets.bottom + 86;
  const containerStyle = [
    styles.pageContent,
    { paddingTop, paddingBottom },
    contentStyle,
  ];

  if (!scroll) {
    return (
      <View style={[styles.page, { backgroundColor: colors.background }]}>
        <View style={containerStyle}>{children}</View>
      </View>
    );
  }
  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={containerStyle}
      keyboardShouldPersistTaps={keyboardTaps}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </KeyboardAwareScrollViewCompat>
  );
}

export function SurfaceCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: design.cardRadius,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({
  title,
  detail,
  right,
}: {
  title: string;
  detail?: string;
  right?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleCopy}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        {detail ? (
          <Text
            style={[styles.sectionDetail, { color: colors.mutedForeground }]}
          >
            {detail}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <Text style={[styles.eyebrow, { color: colors.secondaryForeground }]}>
      {children}
    </Text>
  );
}

export function PrimaryButton({
  title,
  onPress,
  icon,
  disabled = false,
  loading = false,
  style,
  testID,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const animateScale = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 32,
      bounciness: 7,
    }).start();
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => animateScale(0.975)}
      onPressOut={() => animateScale(1)}
      style={[
        styles.primaryButton,
        {
          backgroundColor: disabled ? colors.muted : colors.primary,
          borderWidth: 1.5,
          borderColor: disabled ? colors.border : colors.primary,
          borderRadius: design.controlRadius,
        },
        { transform: [{ scale }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryForeground} />
      ) : (
        <>
          {icon ? (
            <Feather
              name={icon}
              size={18}
              color={
                disabled ? colors.mutedForeground : colors.primaryForeground
              }
            />
          ) : null}
          <Text
            style={[
              styles.primaryButtonText,
              {
                color: disabled
                  ? colors.mutedForeground
                  : colors.primaryForeground,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

export function SecondaryButton({
  disabled = false,
  title,
  onPress,
  icon,
  style,
  testID,
}: {
  disabled?: boolean;
  title: string;
  onPress: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const animateScale = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 32,
      bounciness: 7,
    }).start();
  return (
    <AnimatedPressable
      accessibilityRole="button"
      testID={testID}
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      onPressIn={() => animateScale(0.975)}
      onPressOut={() => animateScale(1)}
      style={[
        styles.secondaryButton,
        {
          backgroundColor: colors.card,
          borderColor: colors.input,
          borderWidth: 1,
          borderRadius: design.controlRadius,
        },
        { transform: [{ scale }] },
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {icon ? (
        <Feather name={icon} size={17} color={colors.secondaryForeground} />
      ) : null}
      <Text
        style={[
          styles.secondaryButtonText,
          { color: colors.secondaryForeground },
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  color,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const animateScale = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 32,
      bounciness: 7,
    }).start();
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => animateScale(0.9)}
      onPressOut={() => animateScale(1)}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { opacity: pressed ? 0.75 : 1 },
        { transform: [{ scale }] },
      ]}
    >
      <Feather name={icon} size={21} color={color ?? colors.foreground} />
    </AnimatedPressable>
  );
}

export function Pill({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: "teal" | "blue" | "amber" | "neutral";
}) {
  const colors = useColors();
  const toneStyle = {
    teal: { backgroundColor: colors.accent, color: colors.accentForeground },
    blue: {
      backgroundColor: colors.secondary,
      color: colors.secondaryForeground,
    },
    amber: { backgroundColor: "#FFF4DE", color: "#8C5D00" },
    neutral: { backgroundColor: colors.muted, color: colors.mutedForeground },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.pillText, { color: toneStyle.color }]}>
        {children}
      </Text>
    </View>
  );
}

export function BodyText({
  children,
  style,
  emphasis = false,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  emphasis?: boolean;
}) {
  const colors = useColors();
  return (
    <Text
      style={[
        styles.bodyText,
        { color: emphasis ? colors.foreground : colors.mutedForeground },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pageContent: {
    paddingHorizontal: design.pagePadding,
    gap: design.sectionGap,
    flexGrow: 1,
    maxWidth: design.contentWidth,
    width: "100%",
    alignSelf: "center",
  },
  card: {
    borderWidth: 1,
    padding: design.cardPadding,
    gap: 12,
    shadowColor: "#0D2C54",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0,
    shadowRadius: 14,
    elevation: 0,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitleCopy: { flex: 1, gap: 3 },
  sectionTitle: design.heading,
  sectionDetail: { fontSize: 14, lineHeight: 23 },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  primaryButton: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  primaryButtonText: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  secondaryButton: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    alignSelf: "flex-start",
    minHeight: 25,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    justifyContent: "center",
  },
  pillText: { fontSize: 11, fontWeight: "700" },
  bodyText: design.body,
});

