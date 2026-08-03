import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartSuppliers } from "@oilmart/mocks";
import { SupplierFormModal } from "./supplier-form-modal";

const meta: Meta<typeof SupplierFormModal> = {
  title: "Oil Mart/Master Data/SupplierFormModal",
  component: SupplierFormModal,
  args: { opened: true, onClose: fn(), onSubmit: fn() },
};

export default meta;
type Story = StoryObj<typeof SupplierFormModal>;

export const Create: Story = {};

export const Edit: Story = { args: { supplier: oilMartSuppliers[0] } };

export const Submitting: Story = { args: { supplier: oilMartSuppliers[1], submitting: true } };
