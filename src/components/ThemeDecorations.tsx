import React from "react";
import { DefaultBackground } from "./themes/DefaultBackground";
import { HalloweenBackground } from "./themes/HalloweenBackground";
import { FaschingBackground } from "./themes/FaschingBackground";

// Memoized: the form re-renders on every keystroke, the background must not.
export const ThemeDecorations = React.memo(function ThemeDecorations({
  activeTheme,
}: {
  activeTheme: string;
}) {
  if (activeTheme === "halloween") {
    return <HalloweenBackground />;
  }

  if (activeTheme === "fasching") {
    return <FaschingBackground />;
  }

  return <DefaultBackground />;
});
