import { Box, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

const INPUT_HEIGHT = 36;
const BLANK_HINT = " ";

type CellAlign = "left" | "center" | "right";

const JUSTIFY_BY_ALIGN: Record<CellAlign, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export const NUMERIC_INPUT_STYLES = { input: { textAlign: "right" as const } };

interface LineFieldCellProps {
  align?: CellAlign;
  hint?: ReactNode;
  children: ReactNode;
}

export function LineFieldCell({ align = "left", hint, children }: LineFieldCellProps) {
  return (
    <Stack gap={4}>
      {children}
      <Text component="div" size="xs" c="dimmed" ta={align}>
        {hint ?? BLANK_HINT}
      </Text>
    </Stack>
  );
}

interface LineValueCellProps {
  align?: CellAlign;
  children: ReactNode;
}

export function LineValueCell({ align = "left", children }: LineValueCellProps) {
  return (
    <Box
      mih={INPUT_HEIGHT}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: JUSTIFY_BY_ALIGN[align],
      }}
    >
      {children}
    </Box>
  );
}
