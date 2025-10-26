"use client";

import { type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
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
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={
                  isActive(item.url)
                    ? "bg-green-100 hover:bg-green-200 data-[active=true]:bg-green-100 data-[active=true]:text-green-700"
                    : ""
                }
              >
                <Link href={item.url} onClick={handleLinkClick}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
