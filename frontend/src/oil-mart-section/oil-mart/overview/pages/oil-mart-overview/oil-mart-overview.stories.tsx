import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { oilMartOverview } from "@oilmart/mocks";
import { OilMartOverviewPage } from "./oil-mart-overview";

const meta: Meta<typeof OilMartOverviewPage> = {
  title: "Oil Mart/Overview/OilMartOverviewPage",
  component: OilMartOverviewPage,
  parameters: { layout: "fullscreen", route: "/oil-mart" },
};

export default meta;
type Story = StoryObj<typeof OilMartOverviewPage>;

export const AsSalesManager: Story = { parameters: { role: "OIL_MART_SALES_MANAGER" } };

export const AsSalesAssistant: Story = { parameters: { role: "OIL_MART_SALES_ASSISTANT" } };

export const QuietDay: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/overview", () =>
          HttpResponse.json({
            ...oilMartOverview,
            awaitingApproval: 0,
            lowStockCount: 0,
            lowStock: [],
            pendingApprovals: [],
          }),
        ),
      ],
    },
  },
};

export const LoadFailed: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/overview", () =>
          HttpResponse.json({ detail: "Overview unavailable" }, { status: 503 }),
        ),
      ],
    },
  },
};
