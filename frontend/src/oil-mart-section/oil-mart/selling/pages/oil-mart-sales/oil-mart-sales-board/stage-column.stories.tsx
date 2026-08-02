import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Group } from "@mantine/core";
import { oilMartSales } from "@oilmart/mocks";
import { OIL_MART_BOARD_STATUSES } from "../../../components/oil-mart-sale-meta";
import { StageColumn } from "./stage-column";

const meta: Meta<typeof StageColumn> = {
  title: "Oil Mart/Selling/StageColumn",
  component: StageColumn,
  args: {
    status: "QUOTATION",
    sales: oilMartSales.filter((sale) => sale.status === "QUOTATION"),
    onSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: "70vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StageColumn>;

export const Quotation: Story = {};

export const EmptyColumn: Story = { args: { status: "APPROVED", sales: [] } };

export const DispatchedWithInvoiceAction: Story = {
  args: {
    status: "DISPATCHED",
    sales: oilMartSales.filter((sale) => sale.status === "DISPATCHED"),
    onInvoice: fn(),
  },
};

export const EmptyQuotationColumnWithStart: Story = {
  args: { status: "QUOTATION", sales: [], onStartSale: fn() },
};

export const EmptyQuotationColumnReadOnly: Story = {
  args: { status: "QUOTATION", sales: [], onStartSale: undefined },
};

export const EveryColumn: Story = {
  render: () => (
    <Group align="stretch" gap="md" wrap="nowrap" h="100%">
      {OIL_MART_BOARD_STATUSES.map((status) => (
        <StageColumn
          key={status}
          status={status}
          sales={oilMartSales.filter((sale) => sale.status === status)}
          onSelect={() => {}}
        />
      ))}
    </Group>
  ),
};
