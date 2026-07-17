import dayjs from "dayjs";
import type { LineDraft } from "./types";

export const EMPTY_LINE: LineDraft = { litresDelivered: "", dipBeforeLitres: "", dipAfterLitres: "" };

export function toInstant(date: Date | null, time: string): string | undefined {
  if (!date || !time) return undefined;
  return dayjs(`${dayjs(date).format("YYYY-MM-DD")}T${time}`).toISOString();
}

export function num(value: number | ""): number | undefined {
  return value === "" ? undefined : Number(value);
}
