import { Divider, Text } from "@mantine/core";

export function SectionDivider({ label }: { label: string }) {
  return (
    <Divider
      label={
        <Text fw={600} fz="xs" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
          {label}
        </Text>
      }
      labelPosition="left"
      mb="md"
    />
  );
}
