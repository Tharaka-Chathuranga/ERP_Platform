import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Decorator } from "@storybook/react";

export const withRouter: Decorator = (Story, context) => {
  const route = (context.parameters.route as string | undefined) ?? "/";
  const path = (context.parameters.routePath as string | undefined) ?? "*";

  return (
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={<Story />} />
      </Routes>
    </MemoryRouter>
  );
};
