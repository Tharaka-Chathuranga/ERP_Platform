import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import { getEfficiencyReport, getVehicle } from "../../../../api";

export function useVehicleEfficiency(vehicleId: string | undefined) {
  const [range, setRange] = useState<[Date | null, Date | null]>([
    dayjs().subtract(29, "day").toDate(),
    dayjs().toDate(),
  ]);
  const [from, to] = range;
  const fromStr = from ? dayjs(from).format("YYYY-MM-DD") : null;
  const toStr = to ? dayjs(to).format("YYYY-MM-DD") : null;
  const ready = !!fromStr && !!toStr && !!vehicleId;

  const vehicle = useQuery({
    queryKey: qk.vehicle(vehicleId!),
    queryFn: () => getVehicle(vehicleId!),
    enabled: !!vehicleId,
  });

  const report = useQuery({
    queryKey: qk.fuelEfficiency(fromStr ?? "", toStr ?? "", vehicleId),
    queryFn: () => getEfficiencyReport(fromStr!, toStr!, vehicleId),
    enabled: ready,
  });

  const vehicleReport = report.data?.[0];

  const dateLookup = useMemo(() => {
    const map = new Map<string, number>();
    for (const pt of vehicleReport?.points ?? []) {
      map.set(pt.date, Number(pt.kmPerLitre.toFixed(2)));
    }
    return map;
  }, [vehicleReport]);

  const chartData = useMemo(() => {
    if (!fromStr || !toStr) return [];
    const rows: { date: string; "km/L": number }[] = [];
    let cursor = dayjs(fromStr);
    const end = dayjs(toStr);
    while (!cursor.isAfter(end)) {
      const iso = cursor.format("YYYY-MM-DD");
      rows.push({ date: cursor.format("MMM D"), "km/L": dateLookup.get(iso) ?? 0 });
      cursor = cursor.add(1, "day");
    }
    return rows;
  }, [fromStr, toStr, dateLookup]);

  const totalKm = vehicleReport?.points.reduce((s, p) => s + p.kmDriven, 0) ?? 0;
  const totalL = vehicleReport?.points.reduce((s, p) => s + p.litresConsumed, 0) ?? 0;
  const avgKmL = totalL > 0 ? totalKm / totalL : 0;
  const fills = vehicleReport?.points.length ?? 0;
  const hasData = fills > 0;

  return {
    range,
    setRange,
    vehicle,
    reportLoading: report.isLoading,
    ready,
    hasData,
    chartData,
    stats: { avgKmL, totalKm, totalL, fills },
  };
}
