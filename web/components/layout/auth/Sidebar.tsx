/* eslint-disable @next/next/no-img-element */
import {
  ArchiveIcon,
  DatabaseIcon,
  Home,
  ListTreeIcon,
  ScrollTextIcon,
  SheetIcon,
  ShieldCheckIcon,
  TagIcon,
  TestTube2,
  TriangleAlertIcon,
  UsersIcon,
  Code2Icon,
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import DesktopSidebar from "./DesktopSidebar";
import { ChangelogItem, NavigationItem } from "./types";

interface SidebarProps {
  setOpen: (open: boolean) => void;
  changelog: ChangelogItem[];
  sidebarRef: React.RefObject<HTMLDivElement>;
}

const Sidebar = ({ changelog, setOpen, sidebarRef }: SidebarProps) => {
  const router = useRouter();
  const { pathname } = router;

  const NAVIGATION: NavigationItem[] = useMemo(
    () => [
      {
        name: "仪表盘",
        href: "/dashboard",
        icon: Home,
        current: pathname.includes("/dashboard"),
      },
      {
        name: "请求日志",
        href: "/requests",
        icon: SheetIcon,
        current: pathname.includes("/requests"),
      },
      {
        name: "数据细分",
        href: "/segments",
        icon: null,
        current: false,
        subItems: [
          {
            name: "会话",
            href: "/sessions",
            icon: ListTreeIcon,
            current: pathname.includes("/sessions"),
          },
          {
            name: "属性",
            href: "/properties",
            icon: TagIcon,
            current: pathname.includes("/properties"),
          },
          {
            name: "用户",
            href: "/users",
            icon: UsersIcon,
            current: pathname.includes("/users"),
          },
          {
            name: "缓存",
            href: "/cache",
            icon: ArchiveIcon,
            current: pathname.includes("/cache"),
          },
          {
            name: "HQL查询",
            href: "/hql",
            icon: Code2Icon,
            current: pathname.includes("/hql"),
          },
        ],
      },
      {
        name: "优化",
        href: "/improve",
        icon: null,
        current: false,
        subItems: [
          {
            name: "提示词",
            href: "/prompts",
            icon: ScrollTextIcon,
            current: pathname.includes("/prompts"),
          },
          {
            name: "数据集",
            href: "/datasets",
            icon: DatabaseIcon,
            current: pathname.includes("/datasets"),
          },
          {
            name: "调试台",
            href: "/playground",
            icon: TestTube2,
            current: pathname.includes("/playground"),
          },
        ],
      },
      {
        name: "监控",
        href: "/monitor",
        icon: null,
        current: false,
        subItems: [
          {
            name: "速率限制",
            href: "/rate-limit",
            icon: ShieldCheckIcon,
            current: pathname === "/rate-limit",
          },
          {
            name: "告警",
            href: "/alerts",
            icon: TriangleAlertIcon,
            current: pathname.includes("/alerts"),
          },
        ],
      },
    ],
    [pathname],
  );

  return (
    <DesktopSidebar
      sidebarRef={sidebarRef}
      changelog={changelog}
      NAVIGATION={NAVIGATION}
      setOpen={setOpen}
    />
  );
};

export default Sidebar;
