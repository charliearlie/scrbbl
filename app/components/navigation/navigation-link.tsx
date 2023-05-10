import { Link } from "@remix-run/react";
import type { LucideIcon } from "lucide-react";
type Props = {
  Icon: LucideIcon;
  bannerText?: string;
  text: string;
  to: string;
};

export default function NavigationLink({ bannerText, Icon, text, to }: Props) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-lg p-2">
      <Icon className="link-accent link" size={28} strokeWidth={3} />
      <span className="link-hover link flex-1 whitespace-nowrap text-lg no-underline">
        {text}
      </span>
      {bannerText && (
        <span className="ml-3 inline-flex items-center justify-center rounded-full bg-base-content px-2 text-sm font-medium text-base-100">
          Pro
        </span>
      )}
    </Link>
  );
}
