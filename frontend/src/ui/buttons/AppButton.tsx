import { Button, type ButtonProps } from "@mantine/core";
import type { ReactNode } from "react";

/**
 * The project's single shared button.
 *
 * Configure it per use through three things:
 *   - `label`   — the text/content shown on the button
 *   - `onClick` — the function to execute when pressed
 *   - styling   — `variant`, `color`, `size`, `radius`, `fullWidth`, `loading`,
 *                 `disabled`, `icon` (left), `rightIcon` … all optional
 *
 * It forwards every Mantine <Button> prop, so anything not spelled out here
 * still works. Use this instead of importing <Button> directly so buttons stay
 * consistent and can be restyled in one place.
 */
export interface AppButtonProps extends ButtonProps {
  /** Button text/content. */
  label: ReactNode;
  /** Function executed on click. */
  onClick?: () => void;
  /** Icon rendered before the label. */
  icon?: ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: ReactNode;
  /** Native button type (defaults to "button"; use "submit" inside a form). */
  type?: "button" | "submit" | "reset";
  name?: string;
  form?: string;
}

export function AppButton({
  label,
  icon,
  rightIcon,
  leftSection,
  rightSection,
  type = "button",
  ...styling
}: AppButtonProps) {
  return (
    <Button
      type={type}
      leftSection={icon ?? leftSection}
      rightSection={rightIcon ?? rightSection}
      {...styling}
    >
      {label}
    </Button>
  );
}
