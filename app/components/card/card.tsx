import type { PropsWithChildren } from "react";

export default function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`card flex flex-col bg-base-100 focus:outline-4 focus:outline-blue-400 ${className}`}
    >
      {children}
    </div>
  );
}
