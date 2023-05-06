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
    <Link
      to={to}
      className="flex items-center gap-4 rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
    >
      <Icon
        className="text-slate-700 group-hover:text-gray-900 dark:text-gray-400"
        size={28}
        strokeWidth={3}
      />
      <span className="flex-1 whitespace-nowrap text-lg">{text}</span>
      {bannerText && (
        <span className="ml-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          Pro
        </span>
      )}
    </Link>
  );
}
