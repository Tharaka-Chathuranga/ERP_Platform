import { Group } from "@mantine/core";
import { useEffect, type ReactNode } from "react";
import { usePageTitle } from "./PageTitle";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

/** Publishes the page title to the shared top header. Renders any page-level
 *  action buttons (right-aligned) above the content; nothing else. */
export function PageHeader({ title, actions }: PageHeaderProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);

  if (!actions) return null;
  return (
    <Group justify="flex-end" mb="lg" wrap="wrap">
      {actions}
    </Group>
  );
}
