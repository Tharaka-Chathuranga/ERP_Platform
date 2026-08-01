import { Badge, type BadgeProps } from "@mantine/core";
import type { OilType } from "@core/types";

const OIL_TYPE_COLORS: Record<OilType, string> = {
  ENGINE: "orange",
  HYDRAULIC: "cyan",
  GEAR: "indigo",
  BRAKE: "red",
  COOLANT: "teal",
  GREASE: "dark",
  TRANSMISSION: "grape",
};

const OIL_TYPE_LABELS: Record<OilType, string> = {
  ENGINE: "Engine",
  HYDRAULIC: "Hydraulic",
  GEAR: "Gear",
  BRAKE: "Brake",
  COOLANT: "Coolant",
  GREASE: "Grease",
  TRANSMISSION: "Transmission",
};

interface OilTypeBadgeProps extends Omit<BadgeProps, "color" | "children"> {
  oilType: OilType;
}

export function OilTypeBadge({ oilType, ...rest }: OilTypeBadgeProps) {
  return (
    <Badge color={OIL_TYPE_COLORS[oilType] ?? "gray"} variant="dot" radius="sm" {...rest}>
      {OIL_TYPE_LABELS[oilType] ?? oilType}
    </Badge>
  );
}

export const OIL_TYPES: OilType[] = [
  "ENGINE",
  "HYDRAULIC",
  "GEAR",
  "BRAKE",
  "COOLANT",
  "GREASE",
  "TRANSMISSION",
];

export const OIL_TYPE_OPTIONS = OIL_TYPES.map((value) => ({
  value,
  label: OIL_TYPE_LABELS[value],
}));

export { OIL_TYPE_LABELS };
