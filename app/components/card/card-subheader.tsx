import { PropsWithChildren } from "react";

export default function CardSubHeader({ children }: PropsWithChildren<{}>) {
  return (
    <h3 className="flex bg-black py-1 px-2 text-center text-lg font-semibold">
      {children}
    </h3>
  );
}
