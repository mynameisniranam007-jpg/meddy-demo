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
    [data-testid="video-call-overlay"] {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      min-height: 100vh !important;
      max-height: none !important;
      z-index: 2147483000 !important;
      overflow: hidden !important;
    }
    body:has([data-testid="video-call-overlay"]) { overflow: hidden !important; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; }
    }
  `,
  );
}

