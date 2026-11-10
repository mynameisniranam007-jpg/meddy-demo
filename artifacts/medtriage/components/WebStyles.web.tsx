import React from "react";

/** Web-only browser defaults; native input appearance stays in StyleSheet. */
export default function WebStyles() {
  return React.createElement(
    "style",
    null,
    `
    input, textarea, input:focus, textarea:focus, input:focus-visible, textarea:focus-visible {
      outline: none !important;
      box-shadow: none !important;
    }
    input, textarea, button, a { -webkit-tap-highlight-color: transparent; }
    [data-testid="auth-field-frame"] { transition: border-color 160ms ease, background-color 160ms ease; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; }
    }
  `,
  );
}

