import { createContext, useContext, useState, type ReactNode } from "react";

interface PageTitleState {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleState | null>(null);

/** Holds the current page title so it can be rendered in the shared top header
 *  while each page still declares its own title (via PageHeader). */
export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle(): PageTitleState {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error("usePageTitle must be used within PageTitleProvider");
  return ctx;
}
