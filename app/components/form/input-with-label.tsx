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
          className="rounded-lg bg-slate-200 p-2 text-lg font-normal dark:bg-slate-700 dark:autofill:bg-slate-700"
          {...inputProps}
        />
      </label>
    </div>
  );
}
