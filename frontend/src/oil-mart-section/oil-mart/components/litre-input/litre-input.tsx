import { NumberInput, type NumberInputProps } from "@mantine/core";

const SCALE = 4;

interface LitreInputProps extends Omit<NumberInputProps, "value" | "onChange"> {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function LitreInput({ value, onChange, ...rest }: LitreInputProps) {
  return (
    <NumberInput
      value={value ?? ""}
      onChange={(next) => {
        if (next === "" || next === null || next === undefined) return onChange(undefined);
        const parsed = typeof next === "number" ? next : Number(next);
        if (Number.isNaN(parsed)) return onChange(undefined);
        onChange(Number(parsed.toFixed(SCALE)));
      }}
      min={0}
      step={0.5}
      decimalScale={SCALE}
      allowNegative={false}
      allowDecimal
      thousandSeparator=","
      suffix=" L"
      hideControls={false}
      {...rest}
    />
  );
}
