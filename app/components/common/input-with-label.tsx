import { HTMLProps, forwardRef } from "react";

type Props = {
  label: string;
} & HTMLProps<HTMLInputElement>;

const InputWithLabel = forwardRef<HTMLInputElement, Props>(
  ({ label, ...inputProps }, ref) => {
    return (
      <div>
        <label className="flex flex-col py-1 font-semibold">
          {label}
          <input
            className="input-bordered input rounded-lg bg-base-300 p-2 text-lg font-normal"
            {...inputProps}
            ref={ref}
          />
        </label>
      </div>
    );
  }
);

export default InputWithLabel;
