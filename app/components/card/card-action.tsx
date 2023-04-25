import type { PropsWithChildren } from "react";

type CardContentProps = {
  noPadding?: boolean;
};

type Props = PropsWithChildren<CardContentProps>;

export default function CardAction({ children, noPadding = false }: Props) {
  return (
    <div
      className={`py-2 border-t border-gray-300 dark:border-gray-900 mt-auto ${
        noPadding ? "" : "px-2"
      } hover:bg-gray-100 hover:dark:bg-gray-900`}
    >
      {children}
    </div>
  );
}
