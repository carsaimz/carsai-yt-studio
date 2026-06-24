import { Link, useRouterState } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
import { useEffect, useState } from "react";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { getQuotaUsed, getQuotaPercent, DAILY_LIMIT, getRemainingQuota } from "@/lib/youtube/quota";

const groups: {
  label: string;
  items: { title: string; url: string; icon: IconName; exact?: boolean }[];
}[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard",  url: "/",          icon: "gauge",     exact: true },
      { title: "Análise",    url: "/analytics", icon: "chart-line" },
    ],
  },
  {
    label: "Criação",
    items: [
      { title: "Conteúdo",     url: "/content", icon: "film" },
      { title: "Estúdio",      url: "/studio",  icon: "wand-magic-sparkles" },
      { title: "SEO",          url: "/seo",     icon: "magnifying-glass-chart" },
    ],
  },
  {
    label: "Engajamento",
    items: [
      { title: "Comunidade", url: "/community", icon: "comments" },
      { title: "IA & Agentes", url: "/ai",      icon: "robot" },
    ],
  },
  {
    label: "Conta",
    items: [
      { title: "Perfil",         url: "/profile",       icon: "circle-user" },
      { title: "Notificações",   url: "/notifications", icon: "bell" },
      { title: "Configurações",  url: "/settings",      icon: "sliders" },
    ],
  },
  {
    label: "Ajuda",
    items: [
      { title: "Documentação", url: "/docs",  icon: "book-open" },
      { title: "Ajuda / FAQ",  url: "/help",  icon: "circle-question" },
      { title: "Sobre",        url: "/about", icon: "circle-info" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  // Real quota — refresh every 30s
  const [quotaUsed, setQuotaUsed]    = useState(getQuotaUsed);
  const [quotaPct,  setQuotaPct]     = useState(getQuotaPercent);
  const [remaining, setRemaining]    = useState(getRemainingQuota);

  useEffect(() => {
    const tick = () => {
      setQuotaUsed(getQuotaUsed());
      setQuotaPct(getQuotaPercent());
      setRemaining(getRemainingQuota());
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const quotaColor =
    quotaPct >= 90 ? "bg-destructive" :
    quotaPct >= 70 ? "bg-warning" :
    "gradient-brand";

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden flex-shrink-0">
            <img src="/icon-192.png" alt="Carsai" className="h-full w-full object-cover" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold tracking-tight">Carsai</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">YT Studio</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <FontAwesomeIcon icon={["fas", item.icon]} className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={["fab", "youtube"]} className="text-red-500" />
                <p className="font-medium text-sidebar-foreground">Cota YouTube API</p>
              </div>
              <span className={`text-[10px] font-medium ${quotaPct >= 90 ? "text-destructive" : quotaPct >= 70 ? "text-warning" : "text-muted-foreground"}`}>
                {quotaPct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/50">
              <div
                className={`h-full transition-all duration-500 ${quotaColor}`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{quotaUsed.toLocaleString("pt-BR")} usadas</span>
              <span>{remaining.toLocaleString("pt-BR")} restantes</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="px-2 py-2">
            <div className={`h-1.5 w-full overflow-hidden rounded-full bg-background/50`} title={`Cota: ${quotaUsed}/${DAILY_LIMIT}`}>
              <div className={`h-full transition-all ${quotaColor}`} style={{ width: `${quotaPct}%` }} />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
