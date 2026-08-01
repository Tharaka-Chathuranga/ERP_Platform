import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { Decorator } from "@storybook/react";
import { theme } from "../../src/theme";

export const withMantine: Decorator = (Story, context) => (
  <MantineProvider theme={theme} forceColorScheme={context.globals.theme === "dark" ? "dark" : "light"}>
    <Notifications position="top-right" />
    <div style={{ padding: 24 }}>
      <Story />
    </div>
  </MantineProvider>
);
