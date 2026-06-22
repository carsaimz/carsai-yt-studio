import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
  Navigate,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { isSetupCompleted } from "@/lib/setup/store";
import { useFirebaseUser } from "@/lib/firebase/auth";

// Register Font Awesome icons globally
library.add(fas, fab);

// Public routes — anyone can reach without setup + auth.
const PUBLIC = [
  "/welcome",
  "/setup",
  "/auth",
  "/docs",
  "/help",
  "/privacy",
  "/terms",
  "/cookies",
  "/security",
  "/changelog",
  "/about",
  "/offline",
];

function isPublic(pathname: string) {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O conteúdo que você procura não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-md gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <FontAwesomeIcon icon={["fas", "house"]} />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <FontAwesomeIcon icon={["fas", "triangle-exclamation"]} size="2x" />
          </span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente ou volte para o painel.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center gap-2 rounded-md gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <FontAwesomeIcon icon={["fas", "rotate-right"]} />
            Tentar novamente
          </button>
          <a href="/" className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            <FontAwesomeIcon icon={["fas", "house"]} />
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a1410" },
      { title: "Carsai YT Studio — gerenciador de canais YouTube com IA" },
      {
        name: "description",
        content:
          "Plataforma híbrida para criadores: análise, SEO, comunidade, automações e agentes de IA para o seu canal no YouTube.",
      },
      { property: "og:title", content: "Carsai YT Studio — gerenciador de canais YouTube com IA" },
      {
        property: "og:description",
        content:
          "Gerencie, analise e automatize seu canal do YouTube com inteligência artificial multi-provedor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function TopBar() {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-4">
      <SidebarTrigger />
      <div className="relative hidden flex-1 max-w-md md:block">
        <FontAwesomeIcon
          icon={["fas", "magnifying-glass"]}
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar vídeos, comentários, tags…"
          className="h-9 w-full rounded-lg border border-border bg-card/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {/* YouTube brand icon */}
        <a
          href="https://studio.youtube.com"
          target="_blank"
          rel="noreferrer"
          title="YouTube Studio"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 text-red-500 hover:bg-accent hover:text-red-400 transition"
        >
          <FontAwesomeIcon icon={["fab", "youtube"]} className="h-4 w-4" />
        </a>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 hover:bg-accent transition"
          title="Notificações"
        >
          <FontAwesomeIcon icon={["fas", "bell"]} className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card/60 px-2.5 text-sm hover:bg-accent transition"
        >
          <img
            src="https://api.dicebear.com/9.x/shapes/svg?seed=carsai&backgroundColor=ff5a3c"
            alt=""
            className="h-6 w-6 rounded-md"
          />
          <span className="hidden sm:inline">Conta</span>
        </Link>
      </div>
    </header>
  );
}

function AppGate({ children }: { children: ReactNode }) {
  const { user, loading } = useFirebaseUser();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={["fas", "spinner"]} spin size="2x" className="text-primary" />
          <span>Carregando…</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  if (typeof window !== "undefined" && pathname !== "/" && !isSetupCompleted() && !isPublic(pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <Navigate to="/welcome" />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </QueryClientProvider>
    );
  }

  if (isPublic(pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppGate>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex min-h-screen flex-1 flex-col">
              <TopBar />
              <main className="flex-1">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </AppGate>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastStyle={{
          background: "oklch(0.225 0.014 60)",
          border: "1px solid oklch(1 0 0 / 8%)",
          color: "oklch(0.97 0.005 80)",
        }}
      />
    </QueryClientProvider>
  );
}
