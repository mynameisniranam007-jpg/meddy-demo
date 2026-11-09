import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

const KeyboardAwareScope = createContext(false);
type Props = KeyboardAwareScrollViewProps & ScrollViewProps;
export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = "handled",
  bottomOffset = 24,
  ...props
}: Props) {
  const [keyboardInset, setKeyboardInset] = useState(0);
  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      typeof window === "undefined" ||
      !window.visualViewport
    )
      return;
    const viewport = window.visualViewport;
    const resize = () =>
      setKeyboardInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    resize();
    viewport.addEventListener("resize", resize);
    return () => viewport.removeEventListener("resize", resize);
  }, []);
  const basePadding = StyleSheet.flatten(
    props.contentContainerStyle,
  )?.paddingBottom;
  const webContentStyle = [
    props.contentContainerStyle,
    keyboardInset > 0
      ? {
          paddingBottom:
            (typeof basePadding === "number" ? basePadding : 0) +
            keyboardInset +
            bottomOffset,
        }
      : null,
  ];
  return (
    <KeyboardAwareScope.Provider value={true}>
      {Platform.OS === "web" ? (
        <ScrollView
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          {...props}
          contentContainerStyle={webContentStyle}
        >
          {children}
        </ScrollView>
      ) : (
        <KeyboardAwareScrollView
          bottomOffset={bottomOffset}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          {...props}
        >
          {children}
        </KeyboardAwareScrollView>
      )}
    </KeyboardAwareScope.Provider>
  );
}

/** Share the screen's keyboard-aware scroll; avoid one competing scroll view per input. */
export function KeyboardAwareForm({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const hasScrollParent = useContext(KeyboardAwareScope);
  return hasScrollParent ? (
    <View style={style}>{children}</View>
  ) : (
    <KeyboardAwareScrollViewCompat contentContainerStyle={style}>
      {children}
    </KeyboardAwareScrollViewCompat>
  );
}
