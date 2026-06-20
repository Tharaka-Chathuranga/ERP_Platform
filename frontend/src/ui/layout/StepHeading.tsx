import { Box, Group, Text } from "@mantine/core";


export function StepHeading({ number, title }: { number: number; title: string }) {
  return (
    <Group gap="sm" mb="md">
      <Box
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid var(--mantine-color-brand-5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Text size="sm" fw={700} c="brand">
          {number}
        </Text>
      </Box>
      <Text size="md" fw={600}>
        {title}
      </Text>
    </Group>
  );
}
