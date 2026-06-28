import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext,
  useRouter, HeadContent, Scripts,
  useRouterState, Navigate,
} from "@tanstack/react-router";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { isSetupCompleted, getSetup } from "@/lib/setup/store";
import { useFirebaseUser } from "@/lib/firebase/auth";
import { useI18n, LOCALES, setLang, type Locale } from "@/lib/i18n";

library.add(fas, fab);

const PUBLIC = [
  "/welcome", "/setup", "/auth", "/docs", "/help",
  "/privacy", "/terms", "/cookies", "/security",
  "/changelog", "/about", "/offline", "/oauth",
];
const isPublic = (p: string) => PUBLIC.some(r => p === r || p.startsWith(r + "/"));

// ── Route config ──────────────────────────────────────────────────────────────
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a1410" },
      { title: "Carsai YT Studio" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: ({ children }: { children: ReactNode }) => (
    <html lang="pt-BR" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  ),
  component: RootComponent,
  notFoundComponent: () => (
    <div style={C.center}>
      <h1 style={{ fontSize:"5rem", fontWeight:900, background:"linear-gradient(135deg,#ff6b35,#e63946)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:0 }}>404</h1>
      <p style={{ color:"#9ca3af" }}>Página não encontrada</p>
      <Link to="/" style={C.btn}>Voltar ao início</Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    useEffect(() => { reportLovableError(error as Error, { boundary: "root" }); }, [error]);
    return (
      <div style={C.center}>
        <FontAwesomeIcon icon={["fas","triangle-exclamation"]} size="3x" style={{ color:"#ef4444" }} />
        <h1 style={{ fontSize:"1.25rem", fontWeight:600 }}>Algo deu errado</h1>
        <button onClick={() => { router.invalidate(); reset(); }} style={C.btn}>Tentar novamente</button>
      </div>
    );
  },
});

// ── Shared style constants ────────────────────────────────────────────────────
const C = {
  center: { display:"flex", minHeight:"100vh", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem", textAlign:"center", padding:"1rem" } as React.CSSProperties,
  btn: { padding:"0.5rem 1.25rem", borderRadius:"0.5rem", background:"linear-gradient(135deg,#ff6b35,#e63946)", color:"white", textDecoration:"none", fontSize:"0.875rem", border:"none", cursor:"pointer", fontFamily:"inherit" } as React.CSSProperties,
};

const BRAND = "linear-gradient(135deg,#ff6b35,#e63946)";
const SIDEBAR_BG = "#111009";
const TOPBAR_BG = "rgba(17,16,9,0.9)";
const BORDER = "rgba(255,255,255,0.09)";
const TEXT = "#e8e3dc";
const MUTED = "rgba(255,255,255,0.38)";
const ACTIVE_BG = "rgba(255,107,53,0.14)";
const ACTIVE_COLOR = "#ff6b35";

// ── Nav groups ────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  { label:"Principal", items:[
    { url:"/",           icon:"gauge",                   i18n:"nav.dashboard", exact:true },
    { url:"/analytics",  icon:"chart-line",              i18n:"nav.analytics" },
  ]},
  { label:"Criação", items:[
    { url:"/content",   icon:"film",                    i18n:"nav.content" },
    { url:"/studio",    icon:"wand-magic-sparkles",     i18n:"nav.studio" },
    { url:"/seo",       icon:"magnifying-glass-chart",  i18n:"nav.seo" },
  ]},
  { label:"Engajamento", items:[
    { url:"/community", icon:"comments",    i18n:"nav.community" },
    { url:"/ai",        icon:"robot",       i18n:"nav.ai" },
  ]},
  { label:"Conta", items:[
    { url:"/profile",       icon:"circle-user",  i18n:"nav.profile" },
    { url:"/notifications", icon:"bell",         i18n:"nav.notifications" },
    { url:"/settings",      icon:"sliders",      i18n:"nav.settings" },
  ]},
  { label:"Ajuda", items:[
    { url:"/docs",  icon:"book-open",      i18n:"nav.docs" },
    { url:"/help",  icon:"circle-question",i18n:"nav.help" },
    { url:"/about", icon:"circle-info",    i18n:"nav.about" },
  ]},
] as const;

// ── Language Picker ───────────────────────────────────────────────────────────
function LangPicker() {
  const { lang, setLang: applyLang } = useI18n();
  const [open, setOpen] = useState(false);
  const cur = LOCALES.find(l => l.code === lang);
  return (
    <div style={{ position:"relative" }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ display:"flex", alignItems:"center", gap:4, height:34, padding:"0 8px", borderRadius:8, border:`1px solid ${BORDER}`, background:"rgba(255,255,255,0.04)", color:TEXT, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
        <span>{cur?.flag ?? "🌐"}</span>
        <span style={{ fontSize:11, opacity:0.7 }}>{cur?.code.split("-")[0].toUpperCase()}</span>
        <FontAwesomeIcon icon={["fas","chevron-down"]} style={{ fontSize:9, opacity:0.5 }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:100 }} />
          <div style={{ position:"absolute", right:0, top:"calc(100% + 6px)", zIndex:101, borderRadius:10, border:`1px solid ${BORDER}`, background:"#1a1710", padding:4, minWidth:170, boxShadow:"0 12px 40px rgba(0,0,0,0.5)" }}>
            {LOCALES.map(l => (
              <button key={l.code} onClick={() => { applyLang(l.code); setOpen(false); }}
                style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 10px", borderRadius:7, border:"none", background: lang===l.code ? ACTIVE_BG : "transparent", color: lang===l.code ? ACTIVE_COLOR : TEXT, cursor:"pointer", fontSize:13, fontFamily:"inherit", textAlign:"left" }}>
                <span style={{ fontSize:18 }}>{l.flag}</span>
                <span style={{ flex:1 }}>{l.label}</span>
                {lang===l.code && <FontAwesomeIcon icon={["fas","check"]} style={{ fontSize:11 }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ open, collapsed, onClose }: { open: boolean; collapsed: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: r => r.location.pathname });

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  // Close sidebar and navigate — handle both mobile (close drawer) and desktop
  const handleNavClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const W = collapsed ? 54 : 230;

  return (
    <aside style={{
      width: W, minWidth: W,
      height: "100%",
      background: SIDEBAR_BG,
      borderRight: `1px solid ${BORDER}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <Link to="/" onClick={handleNavClick}
        style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 10px 8px", textDecoration:"none", flexShrink:0 }}>
        <img src="/icon-192.png" alt="Carsai"
          style={{ width:34, height:34, borderRadius:9, objectFit:"cover", flexShrink:0 }} />
        {!collapsed && (
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:TEXT, whiteSpace:"nowrap" }}>Carsai</div>
            <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:MUTED, whiteSpace:"nowrap" }}>YT Studio</div>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"4px 6px" }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom:4 }}>
            {!collapsed && (
              <div style={{ padding:"6px 8px 2px", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.09em", color:MUTED }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const active = isActive(item.url, (item as any).exact);
              return (
                <Link key={item.url} to={item.url}
                  onClick={handleNavClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: collapsed ? "9px 0" : "7px 10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: active ? ACTIVE_COLOR : "rgba(232,227,220,0.72)",
                    background: active ? ACTIVE_BG : "transparent",
                    marginBottom: 1,
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 400,
                    transition: "background 0.12s, color 0.12s",
                    whiteSpace: "nowrap",
                  }}>
                  <FontAwesomeIcon
                    icon={["fas", item.icon as any]}
                    style={{ width:15, height:15, flexShrink:0 }}
                  />
                  {!collapsed && <span>{t(item.i18n)}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Quota footer */}
      {!collapsed && (
        <div style={{ padding:"10px 10px 12px", borderTop:`1px solid ${BORDER}`, fontSize:11 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
            <FontAwesomeIcon icon={["fab","youtube"]} style={{ color:"#ef4444", fontSize:11 }} />
            <span style={{ fontWeight:500, color:TEXT }}>{t("quota.label")}</span>
          </div>
          <div style={{ height:3, borderRadius:3, background:"rgba(255,255,255,0.08)" }}>
            <div style={{ height:"100%", width:"2%", borderRadius:3, background:BRAND }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, color:MUTED }}>
            <span>0 {t("quota.used")}</span>
            <span>10,000 {t("quota.remaining")}</span>
          </div>
        </div>
      )}
    </aside>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({ onToggle }: { onToggle: () => void }) {
  const { user } = useFirebaseUser();
  const { t } = useI18n();
  const avatar = user?.photoURL
    ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.email ?? "U")}&backgroundColor=ff5a3c`;

  return (
    <header style={{
      position:"sticky", top:0, zIndex:30,
      display:"flex", alignItems:"center", gap:6,
      height:52, padding:"0 10px",
      background:TOPBAR_BG, backdropFilter:"blur(14px)",
      borderBottom:`1px solid ${BORDER}`,
      flexShrink:0,
    }}>
      <button onClick={onToggle}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", width:34, height:34, borderRadius:8, border:`1px solid ${BORDER}`, background:"rgba(255,255,255,0.04)", color:TEXT, cursor:"pointer", flexShrink:0 }}>
        <FontAwesomeIcon icon={["fas","bars"]} style={{ fontSize:14 }} />
      </button>

      {/* Search bar - hidden on small screens via style */}
      <div style={{ flex:1, maxWidth:380, position:"relative" }}>
        <FontAwesomeIcon icon={["fas","magnifying-glass"]}
          style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:MUTED, fontSize:12 }} />
        <input type="search" placeholder={`${t("common.search")}…`}
          style={{ width:"100%", height:34, paddingLeft:30, paddingRight:10, borderRadius:8, border:`1px solid ${BORDER}`, background:"rgba(255,255,255,0.04)", color:TEXT, fontSize:13, outline:"none", fontFamily:"inherit" }} />
      </div>

      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5 }}>
        <LangPicker />

        <Link to="/notifications"
          style={{ display:"flex", alignItems:"center", justifyContent:"center", width:34, height:34, borderRadius:8, border:`1px solid ${BORDER}`, background:"rgba(255,255,255,0.04)", color:TEXT, textDecoration:"none", position:"relative" }}>
          <FontAwesomeIcon icon={["fas","bell"]} style={{ fontSize:14 }} />
          <span style={{ position:"absolute", top:6, right:6, width:6, height:6, borderRadius:"50%", background:"#ff6b35", border:"2px solid #111009" }} />
        </Link>

        <Link to="/profile" aria-label={user?.displayName ?? user?.email ?? "Conta"}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", width:34, height:34, borderRadius:"50%", border:`1px solid ${BORDER}`, background:"rgba(255,255,255,0.04)", textDecoration:"none", overflow:"hidden", flexShrink:0 }}>
          <img src={avatar} alt=""
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        </Link>
      </div>
    </header>
  );
}

// ── App layout with custom responsive sidebar ─────────────────────────────────
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = useRouterState({ select: r => r.location.pathname });

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop: reset open state (drawer not used)
      if (!mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname]); // eslint-disable-line

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  function handleToggle() {
    if (isMobile) {
      setSidebarOpen(v => !v);
    } else {
      setSidebarCollapsed(v => !v);
    }
  }

  // Desktop: always visible, collapsible icon mode
  // Mobile: drawer (slide in/out)
  const collapsed = isMobile ? false : sidebarCollapsed;

  return (
    <div style={{ display:"flex", height:"100vh", width:"100vw", overflow:"hidden", position:"relative" }}>

      {/* Mobile overlay — close when clicking outside */}
      {isMobile && sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:25, touchAction:"none" }}
        />
      )}

      {/* Sidebar container */}
      <div style={{
        position: isMobile ? "fixed" : "relative",
        left: 0,
        top: 0,
        height: "100%",
        zIndex: isMobile ? 26 : 1,
        transform: isMobile
          ? sidebarOpen ? "translateX(0)" : "translateX(-100%)"
          : "translateX(0)",
        transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
        willChange: "transform",
      }}>
        <Sidebar
          open={sidebarOpen}
          collapsed={collapsed}
          onClose={closeSidebar}
        />
      </div>

      {/* Main area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, height:"100%", overflow:"hidden" }}>
        <TopBar onToggle={handleToggle} />
        <main style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AppGate({ children }: { children: ReactNode }) {
  const { user, loading } = useFirebaseUser();
  // Show minimal spinner only while Firebase resolves auth state
  // Avoid covering the whole screen - just a small top bar indicator
  if (loading) {
    return (
      <div style={{ display:"flex", minHeight:"100vh", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"0.75rem" }}>
        <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(255,107,53,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <FontAwesomeIcon icon={["fas","spinner"]} spin style={{ color:"#ff6b35", fontSize:18 }} />
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
}

const Toast = () => (
  <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false}
    newestOnTop closeOnClick pauseOnHover draggable theme="dark"
    toastStyle={{ background:"#1c1714", border:`1px solid ${BORDER}`, color:TEXT }} />
);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: r => r.location.pathname });

  // Restore saved language on boot
  useEffect(() => {
    const saved = getSetup().general?.lang;
    if (saved) setLang(saved as Locale);
  }, []); // eslint-disable-line

  if (typeof window !== "undefined" && pathname !== "/" && !isSetupCompleted() && !isPublic(pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <Navigate to="/welcome" /><Toast />
      </QueryClientProvider>
    );
  }

  if (isPublic(pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet /><Toast />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppGate>
        <AppLayout />
      </AppGate>
      <Toast />
    </QueryClientProvider>
  );
}
