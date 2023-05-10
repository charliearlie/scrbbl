import type { PropsWithChildren } from "react";

type CardContentProps = {
  noPadding?: boolean;
};

type Props = PropsWithChildren<CardContentProps>;

export default function CardAction({ children, noPadding = false }: Props) {
  return (
    <div
      className={`card-actions mt-auto border-t border-accent py-2 ${
        noPadding ? "" : "px-2"
      } hover:bg-base-200`}
    >
      {children}
    </div>
  );
}
