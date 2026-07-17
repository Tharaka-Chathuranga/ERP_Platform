import { useMemo } from "react";
import dayjs from "dayjs";
import type { VehicleEfficiencyReport } from "@core/types";
import type { FlagRow, SummaryRow } from "../types";

export interface EfficiencyReportData {
  chartData: Record<string, string | number | null>[];
  summaryRows: SummaryRow[];
  fleetAvgKmL: number;
  declineRows: FlagRow[];
  improveRows: FlagRow[];
  vehicleDriverMap: Map<string, string>;
}

export function useEfficiencyReport(
  vehicles: VehicleEfficiencyReport[],
  fromStr: string | null,
  toStr: string | null,
): EfficiencyReportData {
  const vehicleDriverMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of vehicles) map.set(v.vehicleNumber, v.driverUserId);
    return map;
  }, [vehicles]);

  const dateLookup = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const v of vehicles) {
      for (const pt of v.points) {
        if (!map.has(pt.date)) map.set(pt.date, {});
        map.get(pt.date)![v.vehicleNumber] = Number(pt.kmPerLitre.toFixed(2));
      }
    }
    return map;
  }, [vehicles]);

  const chartData = useMemo(() => {
    if (!fromStr || !toStr || vehicles.length === 0) return [];
    const rows: Record<string, string | number | null>[] = [];
    let cursor = dayjs(fromStr);
    const end = dayjs(toStr);
    while (!cursor.isAfter(end)) {
      const iso = cursor.format("YYYY-MM-DD");
      const fills = dateLookup.get(iso) ?? {};
      const entry: Record<string, string | number | null> = { date: cursor.format("MMM D") };
      for (const v of vehicles) entry[v.vehicleNumber] = fills[v.vehicleNumber] ?? null;
      rows.push(entry);
      cursor = cursor.add(1, "day");
    }
    return rows;
  }, [vehicles, fromStr, toStr, dateLookup]);

  const summaryRows = useMemo<SummaryRow[]>(() => {
    return vehicles.map((r) => {
      const totalKm = r.points.reduce((s, p) => s + p.kmDriven, 0);
      const totalLitres = r.points.reduce((s, p) => s + p.litresConsumed, 0);
      return {
        vehicleId: r.vehicleId,
        vehicleNumber: r.vehicleNumber,
        driverUserId: r.driverUserId,
        avgKmPerLitre: totalLitres > 0 ? totalKm / totalLitres : 0,
        totalKm,
        totalLitres,
        readings: r.points.length,
      };
    });
  }, [vehicles]);

  const fleetAvgKmL = useMemo(() => {
    const totalKm = summaryRows.reduce((s, r) => s + r.totalKm, 0);
    const totalL = summaryRows.reduce((s, r) => s + r.totalLitres, 0);
    return totalL > 0 ? totalKm / totalL : 0;
  }, [summaryRows]);

  const { declineRows, improveRows } = useMemo<{ declineRows: FlagRow[]; improveRows: FlagRow[] }>(() => {
    const declines: FlagRow[] = [];
    const improvements: FlagRow[] = [];

    for (const r of vehicles) {
      const pts = r.points;
      const summary = summaryRows.find((s) => s.vehicleId === r.vehicleId);

      if (pts.length >= 2) {
        const prev = pts[pts.length - 2].kmPerLitre;
        const curr = pts[pts.length - 1].kmPerLitre;
        const change = (curr - prev) / prev;
        if (change <= -0.2) {
          declines.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "sharp-drop", currentKmL: curr, referenceKmL: prev, changePct: change * 100 });
          continue;
        }
        if (change >= 0.2) {
          improvements.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "sharp-gain", currentKmL: curr, referenceKmL: prev, changePct: change * 100 });
          continue;
        }
      }

      if (fleetAvgKmL > 0 && summary) {
        const gap = (summary.avgKmPerLitre - fleetAvgKmL) / fleetAvgKmL;
        if (gap <= -0.2) {
          declines.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "below-average", currentKmL: summary.avgKmPerLitre, referenceKmL: fleetAvgKmL, changePct: gap * 100 });
        } else if (gap >= 0.2) {
          improvements.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "above-average", currentKmL: summary.avgKmPerLitre, referenceKmL: fleetAvgKmL, changePct: gap * 100 });
        }
      }
    }

    return { declineRows: declines, improveRows: improvements };
  }, [vehicles, summaryRows, fleetAvgKmL]);

  return { chartData, summaryRows, fleetAvgKmL, declineRows, improveRows, vehicleDriverMap };
}
