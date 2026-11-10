/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: "#214640",
    tint: "#0D4744",

    // Core surfaces
    background: "#F5F8F8",
    foreground: "#163D3A",

    // Cards / elevated surfaces
    card: "#FFFFFF",
    cardForeground: "#214640",

    // Primary action color (buttons, links, active states)
    primary: "#0D4744",
    primaryForeground: "#FFFFFF",

    // Secondary / less-emphasis interactive surfaces
    secondary: "#E7F4F2",
    secondaryForeground: "#176B68",

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: "#EDF2F6",
    mutedForeground: "#627582",

    // Accent highlights (badges, selected items, focus rings)
    accent: "#DDF3EF",
    accentForeground: "#176B68",

    // Destructive actions (delete, error states)
    destructive: "#B42318",
    destructiveForeground: "#FFFFFF",

    // Borders and input outlines
    border: "#E1EAF0",
    input: "#D7E2EA",
  },

  dark: {
    text: "#ECF5FA",
    tint: "#76D4C4",
    background: "#0D2422",
    foreground: "#ECF5FA",
    card: "#16332F",
    cardForeground: "#ECF5FA",
    primary: "#69C7BA",
    primaryForeground: "#0D2422",
    secondary: "#20433C",
    secondaryForeground: "#B4EAE2",
    muted: "#1C3833",
    mutedForeground: "#A3B4C2",
    accent: "#20483E",
    accentForeground: "#B4EAE2",
    destructive: "#F97066",
    destructiveForeground: "#FFFFFF",
    border: "#34554A",
    input: "#426659",
  },
  radius: 24,
};

export default colors;

