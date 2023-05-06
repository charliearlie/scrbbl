import type { ComponentProps } from "react";

import appleLogo from "~/assets/Apple_logo_black.svg";

export default function AppleMusicButton(props: ComponentProps<"button">) {
  return (
    <button {...props}>
      <img
        src={appleLogo}
        aria-hidden="true"
        alt="Apple logo"
        height="20px"
        width="20px"
        className="-mt-1"
      />
      Apple search
    </button>
  );
}
