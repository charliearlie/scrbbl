import type { ButtonProps } from "./common/button";
import { Button } from "./common/button";
export default function AppleMusicButton(props: ButtonProps) {
  return (
    <Button variant="outline" {...props}>
      Autofill
    </Button>
  );
}
