import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import { withMantine, withPermissions, withQueryClient, withRouter } from "./decorators";
import { oilMartHandlers } from "../src/oil-mart-section/oil-mart/mocks";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "../src/index.css";

initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    msw: { handlers: oilMartHandlers },
    options: {
      storySort: {
        order: ["Oil Mart", ["Components", "Master Data", "Receiving", "Stock", "Selling", "Overview"]],
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Colour scheme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    role: {
      description: "Signed-in role",
      defaultValue: "ADMIN",
      toolbar: {
        title: "Role",
        icon: "user",
        items: [
          { value: "ADMIN", title: "Admin" },
          { value: "OIL_MART_SALES_ASSISTANT", title: "Sales assistant" },
          { value: "OIL_MART_SALES_MANAGER", title: "Sales manager" },
          { value: "STORE_KEEPER", title: "Store keeper (no access)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  loaders: [mswLoader],
  decorators: [withRouter, withPermissions, withQueryClient, withMantine],
};

export default preview;
