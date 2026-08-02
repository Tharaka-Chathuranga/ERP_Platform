import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartSales } from "@oilmart/mocks";
import { OilMartSalesBoard } from "./oil-mart-sales-board";

const meta: Meta<typeof OilMartSalesBoard> = {
  title: "Oil Mart/Selling/OilMartSalesBoard",
  component: OilMartSalesBoard,
  args: { sales: oilMartSales, onSelect: fn() },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", flexDirection: "column", height: "80vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OilMartSalesBoard>;

export const FullPipeline: Story = {};

export const WithTerminalColumns: Story = { args: { showTerminal: true } };

export const AsAssistant: Story = {
  args: { onStartSale: fn(), onSubmitForApproval: fn(), onDispatch: fn(), onInvoice: fn() },
};

export const AsStoresManager: Story = {
  args: { onApproveQuotation: fn(), onRejectQuotation: fn(), onApprove: fn(), onReject: fn() },
};

export const ReadOnly: Story = {};

export const Busy: Story = {
  args: { busy: true, onStartSale: fn(), onSubmitForApproval: fn(), onDispatch: fn(), onInvoice: fn() },
};

export const EmptyWithStartAction: Story = { args: { sales: [], onStartSale: fn() } };

export const OnlyAwaitingApproval: Story = {
  args: { sales: oilMartSales.filter((sale) => sale.status === "ORDERED") },
};

export const Loading: Story = { args: { sales: [], loading: true } };

export const Empty: Story = { args: { sales: [] } };

export const LoadFailed: Story = {
  args: { sales: [], error: new globalThis.Error("Sales unavailable") },
};
