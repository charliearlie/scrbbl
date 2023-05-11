import { Link, useLocation } from "@remix-run/react";
import type { LucideIcon } from "lucide-react";
type Props = {
  Icon: LucideIcon;
  bannerText?: string;
  text: string;
  to: string;
};

export default function NavigationLink({ bannerText, Icon, text, to }: Props) {
  const location = useLocation();

  const isActiveLink = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 rounded-lg p-2 ${
        isActiveLink ? "bg-primary text-primary-content" : ""
      }`}
    >
      <Icon
        className={`${isActiveLink ? "text-primary-content" : "text-primary"}`}
        size={28}
        strokeWidth={3}
      />
      <span className="link-hover link flex-1 whitespace-nowrap text-lg no-underline">
        {text}
      </span>
      {bannerText && <span className="badge-primary badge">Pro</span>}
    </Link>
  );
}
