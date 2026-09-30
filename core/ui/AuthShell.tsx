import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Wordmark } from "./Wordmark";
import { brand } from "./brandColors";
import { fontFamily } from "./theme";

type Props = {
  children: ReactNode;
  heroTitle?: string;
  heroSubtitle?: string;
};

export function AuthShell({ children, heroTitle, heroSubtitle }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient colors={[brand.forest, "#243528", brand.inkFooter]} style={styles.hero}>
        <View style={[styles.heroInner, { paddingTop: insets.top + 28 }]}>
          <Animated.View entering={FadeInUp.duration(500)}>
            <Wordmark height={26} badge={false} inverse />
          </Animated.View>
          {heroTitle ? (
            <Animated.Text entering={FadeInDown.delay(60).duration(450)} style={styles.heroTitle}>
              {heroTitle}
            </Animated.Text>
          ) : null}
          {heroSubtitle ? (
            <Animated.Text entering={FadeInDown.delay(100).duration(450)} style={styles.heroSubtitle}>
              {heroSubtitle}
            </Animated.Text>
          ) : null}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.sheetScroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(120).duration(520)} style={styles.sheet}>
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.inkFooter,
  },
  hero: {
    minHeight: 200,
    paddingBottom: 36,
  },
  heroInner: {
    paddingHorizontal: 24,
    gap: 12,
  },
  heroTitle: {
    color: brand.linen,
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    letterSpacing: -0.4,
    marginTop: 20,
  },
  heroSubtitle: {
    color: brand.sage,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 300,
  },
  sheetWrap: {
    flex: 1,
    marginTop: -28,
  },
  sheetScroll: {
    flexGrow: 1,
  },
  sheet: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 12,
    minHeight: 420,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
    gap: 4,
  },
});
