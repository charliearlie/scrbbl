import type { LucideIcon } from "lucide-react";
import { Database, Disc3, Home, Music2, RadioTower } from "lucide-react";

export type NavItem = {
  label: string;
  /** Where it goes. Undefined means it does not go anywhere yet. */
  to?: string;
  Icon: LucideIcon;
};

/**
 * One list, rendered by both the desktop rail and the mobile sheet. These
 * used to be two hand-maintained copies of the same markup in root.tsx.
 *
 * Radio and bulk import have never been built. They used to link to "#",
 * which reads as a working link and goes nowhere; now they read as what
 * they are.
 */
export const navItems: NavItem[] = [
  { label: "Home", to: "/", Icon: Home },
  { label: "Scrobble song", to: "/manual-scrobble", Icon: Music2 },
  { label: "Scrobble album", to: "/album-scrobble", Icon: Disc3 },
  { label: "Scrobble radio", Icon: RadioTower },
  { label: "Bulk import", Icon: Database },
];

export function isCurrent(pathname: string, to?: string): boolean {
  if (!to) return false;
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
