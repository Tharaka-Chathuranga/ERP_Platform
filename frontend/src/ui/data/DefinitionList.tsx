import { SimpleGrid, Text } from "@mantine/core";
import type { ReactNode } from "react";

export interface Definition {
  label: string;
  value: ReactNode;
}

interface DefinitionListProps {
  items: Definition[];
  cols?: number | { base?: number; sm?: number; md?: number; lg?: number };
}

const isBlank = (v: ReactNode) => v === null || v === undefined || v === "";


export function DefinitionList({ items, cols = { base: 2, sm: 4 } }: DefinitionListProps) {
  return (
    <SimpleGrid cols={cols}>
      {items.map((d, i) => (
        <div key={i}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {d.label}
          </Text>
          <Text component="div">{isBlank(d.value) ? "—" : d.value}</Text>
        </div>
      ))}
    </SimpleGrid>
  );
}
