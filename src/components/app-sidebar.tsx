import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
import { useEffect, useState } from "react";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { getQuotaUsed, getQuotaPercent, DAILY_LIMIT, getRemainingQuota } from "@/lib/youtube/quota";
import { useI18n } from "@/lib/i18n";

const NAV_GROUPS: {
  label: string;
  items: { title: string; url: string; icon: IconName; exact?: boolean; i18nKey: string }[];
}[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard",  url: "/",          icon: "gauge",     exact: true, i18nKey: "nav.dashboard" },
      { title: "Análise",    url: "/analytics", icon: "chart-line", i18nKey: "nav.analytics" },
    ],
  },
  {
    label: "Criação",
    items: [
      { title: "Conteúdo",   url: "/content", icon: "film", i18nKey: "nav.content" },
      { title: "Estúdio",    url: "/studio",  icon: "wand-magic-sparkles", i18nKey: "nav.studio" },
      { title: "SEO",        url: "/seo",     icon: "magnifying-glass-chart", i18nKey: "nav.seo" },
    ],
  },
  {
    label: "Engajamento",
    items: [
      { title: "Comunidade",   url: "/community", icon: "comments", i18nKey: "nav.community" },
      { title: "IA & Agentes", url: "/ai",        icon: "robot", i18nKey: "nav.ai" },
    ],
  },
  {
    label: "Conta",
    items: [
      { title: "Perfil",        url: "/profile",       icon: "circle-user", i18nKey: "nav.profile" },
      { title: "Notificações",  url: "/notifications", icon: "bell", i18nKey: "nav.notifications" },
      { title: "Configurações", url: "/settings",      icon: "sliders", i18nKey: "nav.settings" },
    ],
  },
  {
    label: "Ajuda",
    items: [
      { title: "Documentação", url: "/docs",  icon: "book-open", i18nKey: "nav.docs" },
      { title: "Ajuda / FAQ",  url: "/help",  icon: "circle-question", i18nKey: "nav.help" },
      { title: "Sobre",        url: "/about", icon: "circle-info", i18nKey: "nav.about" },
    ],
  },
];

export function AppSidebar() {
  const { state, setOpen, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const { t } = useI18n();
  const [quotaUsed,  setQuotaUsed]  = useState(getQuotaUsed);
  const [quotaPct,   setQuotaPct]   = useState(getQuotaPercent);
  const [remaining,  setRemaining]  = useState(getRemainingQuota);

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

  // Auto-close on mobile when route changes
  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [pathname, isMobile]);

  function handleNavClick() {
    if (isMobile) setOpen(false);
  }

  const quotaColor =
    quotaPct >= 90 ? "bg-destructive" :
    quotaPct >= 70 ? "bg-warning" : "gradient-brand";

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 px-2 py-3">
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
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                      <Link to={item.url} onClick={handleNavClick} className="flex items-center gap-2">
                        <FontAwesomeIcon icon={["fas", item.icon]} className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{t(item.i18nKey as any) || item.title}</span>}
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
                <p className="font-medium text-sidebar-foreground">{t("quota.label")}</p>
              </div>
              <span className={`text-[10px] font-medium ${quotaPct >= 90 ? "text-destructive" : quotaPct >= 70 ? "text-warning" : "text-muted-foreground"}`}>
                {quotaPct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/50">
              <div className={`h-full transition-all duration-500 ${quotaColor}`}
                style={{ width: `${Math.max(2, quotaPct)}%` }} />
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{quotaUsed.toLocaleString()} {t("quota.used")}</span>
              <span>{remaining.toLocaleString()} {t("quota.remaining")}</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="px-2 py-2" title={`Cota API: ${quotaUsed}/${DAILY_LIMIT}`}>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/50">
              <div className={`h-full transition-all ${quotaColor}`} style={{ width: `${Math.max(2, quotaPct)}%` }} />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
