"use client";

import { type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = () => {
    // スマホの場合、メニュー選択時にサイドバーを閉じる
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // アクティブ状態を判定する関数
  const isActive = (url: string) => {
    return pathname.startsWith(url);
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>外部出力</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              isActive={isActive(item.url)}
              className={
                isActive(item.url)
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : ""
              }
            >
              <Link href={item.url} onClick={handleLinkClick}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
