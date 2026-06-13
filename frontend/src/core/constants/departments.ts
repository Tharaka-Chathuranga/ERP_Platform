
export const DEPARTMENTS = [
  "Stores",
  "Maintenance",
  "Production",
  "Logistics",
  "Quality",
  "Engineering",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
