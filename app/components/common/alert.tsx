import type { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  type?: "error" | "info" | "success";
  visible: boolean;
};

export default function Alert({ children, type = "success", visible }: Props) {
  return (
    <div
      className={`${
        !visible ? "invisible" : ""
      } alert alert-${type} rounded-lg`}
      role="alert"
    >
      <div>
        <span className="font-xl">{children}</span>
      </div>
    </div>
  );
}
