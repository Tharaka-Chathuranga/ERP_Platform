import type { ReactNode } from "react";
import { Paper } from "@mantine/core";

const WELCOME_BANNER_STYLE = {
  background: "linear-gradient(135deg, light-dark(var(--mantine-color-brand-0), var(--mantine-color-dark-6)) 0%, light-dark(white, var(--mantine-color-dark-8)) 70%)",
  borderColor: "var(--mantine-color-default-border)",
} as const;

export function WelcomeBanner({ children }: { children: ReactNode }) {
  return (
    <Paper p="xl" radius="md" withBorder style={WELCOME_BANNER_STYLE}>
      {children}
    </Paper>
  );
}
