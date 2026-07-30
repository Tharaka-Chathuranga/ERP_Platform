import { SimpleGrid } from "@mantine/core";
import { DETECTION_STAGES } from "../../../components";
import type { BoardFilters } from "../hooks/use-nonconformity-board";
import { StageColumn } from "./stage-column";

interface NonconformityBoardProps {
  filters: BoardFilters;
}

export function NonconformityBoard({ filters }: NonconformityBoardProps) {
  return (
    <SimpleGrid cols={{ base: 1, md: 3 }}>
      {DETECTION_STAGES.map((stage) => (
        <StageColumn key={stage} stage={stage} filters={filters} />
      ))}
    </SimpleGrid>
  );
}
