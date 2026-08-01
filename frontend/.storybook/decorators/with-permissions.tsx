import type { Decorator } from "@storybook/react";
import { AuthMockProvider } from "../../src/oil-mart-section/oil-mart/mocks/auth-mock-provider";
import type { Role } from "../../src/auth/permissions";

export const withPermissions: Decorator = (Story, context) => {
  const role = (context.parameters.role ?? context.globals.role ?? "ADMIN") as Role;

  return (
    <AuthMockProvider role={role}>
      <Story />
    </AuthMockProvider>
  );
};
