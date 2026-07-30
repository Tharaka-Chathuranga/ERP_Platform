import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data/TableToolbar";
import type { DateRange } from "../hooks/use-nonconformity-board";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "RAISED", label: "Raised" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "DISPOSITIONED", label: "Dispositioned" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CLOSED", label: "Closed" },
];

interface NonconformityBoardToolbarProps {
  status: string;
  onStatusChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (value: DateRange) => void;
  onCreate: () => void;
}

export function NonconformityBoardToolbar({
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onCreate,
}: NonconformityBoardToolbarProps) {
  return (
    <TableToolbar
      actions={
        <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
          Report nonconformity
        </Button>
      }
      filters={[
        {
          label: "Status",
          value: status,
          onChange: onStatusChange,
          options: STATUS_OPTIONS,
        },
        {
          type: "daterange",
          label: "Raised between",
          value: dateRange,
          onChange: onDateRangeChange,
        },
      ]}
    />
  );
}
