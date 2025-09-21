"use client";

import * as React from "react";
import {
  IconBuildingCommunity,
  IconCalendar,
  IconCalendarOff,
  IconCoinYen,
  IconCreditCardRefund,
  IconDashboard,
  IconDatabase,
  IconReplaceUser,
  IconReport,
  IconUserPlus,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavDocuments } from "./nav-documents";

const data = {
  user: {
    name: "LIFTING",
    email: "lifting005@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "ダッシュボード",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "スタッフ管理",
      url: "/dashboard/staff",
      icon: IconUserPlus,
    },
    {
      title: "取引先管理",
      url: "/dashboard/client",
      icon: IconBuildingCommunity,
    },
    {
      title: "売上管理",
      url: "/dashboard/sale",
      icon: IconCoinYen,
    },
    {
      title: "現場管理",
      url: "/dashboard/site",
      icon: IconCalendar,
    },
    {
      title: "勤怠管理",
      url: "/dashboard/availability",
      icon: IconCalendarOff,
    },
    {
      title: "振り分け管理",
      url: "/dashboard/assignment",
      icon: IconReplaceUser,
    },
  ],
  documents: [
    {
      name: "請求書作成",
      url: "/dashboard/invoice",
      icon: IconCreditCardRefund,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <span className="text-base font-semibold">
                  LIFTING業務システム
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
