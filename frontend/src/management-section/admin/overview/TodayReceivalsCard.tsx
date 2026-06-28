import { Text } from "@mantine/core";
import { IconPackageImport } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { DataTable } from "@ui/data/DataTable";
import { StackedCell } from "@ui/data/cells";
import type { TodayReceivalRow } from "@core/types";
import { getTodayReceivals } from "../admin.api";
import { OverviewCard } from "./OverviewCard";
import { money } from "./format";

/** Lists every receival document recorded today. */
export function TodayReceivalsCard() {
  const navigate = useNavigate();
  const receivals = useQuery({ queryKey: qk.todayReceivals(), queryFn: getTodayReceivals });

  return (
    <OverviewCard
      title="Today's receiving"
      description="Goods received so far today"
      icon={<IconPackageImport size={22} />}
      accent="teal"
      count={receivals.data?.length}
    >
      <DataTable<TodayReceivalRow>
        data={receivals.data}
        loading={receivals.isLoading}
        error={receivals.error}
        withCard={false}
        rowKey={(r) => r.receivalId}
        onRowClick={(r) => navigate(`/receiving/${r.receivalId}`)}
        empty={<Text c="dimmed" p="md">Nothing received yet today.</Text>}
        columns={[
          {
            header: "Receival",
            render: (r) => <StackedCell primary={r.receivalNumber} secondary={r.supplierName ?? "—"} />,
            emphasis: true,
          },
          { header: "Lines", render: (r) => r.lineCount, align: "right" },
          { header: "Qty", render: (r) => r.totalQuantity, align: "right" },
          { header: "Value", render: (r) => money(r.totalValue), align: "right" },
          { header: "Time", render: (r) => dayjs(r.receivedAt).format("HH:mm"), align: "right" },
        ]}
      />
    </OverviewCard>
  );
}
