import { Stack } from "@mantine/core";
import type { IssueLine } from "@core/types";
import { IssueItemRow } from "./IssueItemRow";

interface IssueItemCardsProps {
  lines: IssueLine[];
  itemLabel: (itemId: string) => string;
}

export function IssueItemCards({ lines, itemLabel }: IssueItemCardsProps) {
  return (
    <Stack gap="sm">
      {lines.map((line) => (
        <IssueItemRow key={line.id} line={line} itemLabel={itemLabel} />
      ))}
    </Stack>
  );
}
