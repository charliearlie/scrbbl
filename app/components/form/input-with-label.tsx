import type { HTMLProps } from "react";

type Props = {
  label: string;
} & HTMLProps<HTMLInputElement>;

export default function InputWithLabel({ label, ...inputProps }: Props) {
  return (
    <div>
      <label className="flex flex-col py-1 font-semibold">
        {label}
        <input
          className="input-bordered input rounded-lg bg-base-300 p-2 text-lg font-normal"
          {...inputProps}
        />
      </label>
    </div>
  );
}
