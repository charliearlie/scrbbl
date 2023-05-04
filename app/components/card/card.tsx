import type { PropsWithChildren } from "react";

export default function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`flex flex-col rounded-lg bg-white shadow shadow-gray-400 focus:outline-4 focus:outline-blue-400 dark:bg-gray-800 dark:shadow-gray-900 ${className}`}
    >
      {children}
    </div>
  );
}
