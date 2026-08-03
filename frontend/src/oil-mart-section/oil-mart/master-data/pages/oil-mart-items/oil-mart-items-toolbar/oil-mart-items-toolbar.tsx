import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";
import { OIL_TYPE_OPTIONS } from "../../../../components/oil-type-badge";

interface OilMartItemsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  oilType: string;
  onOilTypeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  canManage: boolean;
  onAdd: () => void;
}

export function OilMartItemsToolbar({
  search,
  onSearchChange,
  oilType,
  onOilTypeChange,
  status,
  onStatusChange,
  canManage,
  onAdd,
}: OilMartItemsToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search code, name or brand" }}
      filters={[
        {
          label: "Oil type",
          value: oilType,
          onChange: onOilTypeChange,
          options: [{ value: "ALL", label: "All types" }, ...OIL_TYPE_OPTIONS],
        },
        {
          label: "Status",
          value: status,
          onChange: onStatusChange,
          options: [
            { value: "ALL", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ],
        },
      ]}
      actions={
        canManage ? (
          <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
            Add oil
          </Button>
        ) : undefined
      }
    />
  );
}
