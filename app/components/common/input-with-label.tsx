import type { HTMLProps } from "react";
import { forwardRef } from "react";
import { Input } from "./input";
import { Label } from "./label";

type Props = {
  label: string;
} & HTMLProps<HTMLInputElement>;

const InputWithLabel = forwardRef<HTMLInputElement, Props>(
  ({ label, ...inputProps }, ref) => {
    return (
      <div>
        <Label className="flex flex-col gap-2 py-1 font-semibold">
          {label}
          <Input {...inputProps} ref={ref} />
        </Label>
      </div>
    );
  }
);

export default InputWithLabel;
