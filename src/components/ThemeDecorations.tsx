import React from "react";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { DefaultBackground } from "./themes/DefaultBackground";
import { HalloweenBackground } from "./themes/HalloweenBackground";
import { FaschingBackground } from "./themes/FaschingBackground";

export const ThemeDecorations: React.FC = () => {
  const activeTheme = useActiveTheme();

  if (activeTheme === "halloween") {
    return <HalloweenBackground />;
  }

  if (activeTheme === "fasching") {
    return <FaschingBackground />;
  }

  return <DefaultBackground />;
};
