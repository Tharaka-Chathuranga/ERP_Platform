import { Tabs } from "@mantine/core";
import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconBox,
  IconClipboardCheck,
  IconListDetails,
  IconReportMoney,
} from "@tabler/icons-react";
import { PageHeader } from "@ui/layout/PageHeader";
import { CountRequestsTab } from "./CountRequestsTab";
import { DefectItemsTab } from "./DefectItemsTab";
import { DefectRequestsTab } from "./DefectRequestsTab";
import { ItemsAdminTab } from "./ItemsAdminTab";
import { MovementsTab } from "./MovementsTab";
import { WarningsTab } from "./WarningsTab";

/** Store administration hub: item master data, warnings, count requests,
 *  defect views and the movement ledger, grouped under one tabbed page. */
export function AdminStorePage() {
  return (
    <div>
      <PageHeader title="Store administration" />

      <Tabs defaultValue="items" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="items" leftSection={<IconBox size={16} />}>
            Items
          </Tabs.Tab>
          <Tabs.Tab value="warnings" leftSection={<IconAlertTriangle size={16} />}>
            Warnings
          </Tabs.Tab>
          <Tabs.Tab value="count" leftSection={<IconClipboardCheck size={16} />}>
            Count requests
          </Tabs.Tab>
          <Tabs.Tab value="defect-requests" leftSection={<IconReportMoney size={16} />}>
            Defect requests
          </Tabs.Tab>
          <Tabs.Tab value="defect-items" leftSection={<IconListDetails size={16} />}>
            Defect items
          </Tabs.Tab>
          <Tabs.Tab value="movements" leftSection={<IconArrowsExchange size={16} />}>
            Movements
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="items">
          <ItemsAdminTab />
        </Tabs.Panel>
        <Tabs.Panel value="warnings">
          <WarningsTab />
        </Tabs.Panel>
        <Tabs.Panel value="count">
          <CountRequestsTab />
        </Tabs.Panel>
        <Tabs.Panel value="defect-requests">
          <DefectRequestsTab />
        </Tabs.Panel>
        <Tabs.Panel value="defect-items">
          <DefectItemsTab />
        </Tabs.Panel>
        <Tabs.Panel value="movements">
          <MovementsTab />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
