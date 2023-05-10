import type { PropsWithChildren } from "react";

type CardContentProps = {
  noPadding?: boolean;
} & React.HTMLProps<HTMLDivElement>;

type Props = PropsWithChildren<CardContentProps>;

export default function CardContent({
  children,
  className,
  noPadding = false,
  ...divProps
}: Props) {
  return (
    <div
      className={`card-body ${noPadding ? "" : "p-4"} ${className || ""}`}
      {...divProps}
    >
      {children}
    </div>
  );
}
