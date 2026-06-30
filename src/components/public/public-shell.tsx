import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, HelpCircle, History, Info, Shield } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: ReactNode;
  art?: ReactNode;
  children: ReactNode;
};

const NAV = [
  { to: "/docs", label: "Docs", icon: BookOpen },
  { to: "/help", label: "Ajuda", icon: HelpCircle },
  { to: "/changelog", label: "Changelog", icon: History },
  { to: "/about", label: "Sobre", icon: Info },
];

export function PublicShell({ title, subtitle, eyebrow, icon, art, children }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-80 w-80 rounded-full bg-warning/10 blur-3xl" />

      <header className="relative z-10 border-b border-border/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/welcome" className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-lg flex-shrink-0">
              <img src="/icon-192.png" alt="Carsai" className="h-full w-full object-cover" />
            </div>
            <span className="font-display font-bold">Carsai YT Studio</span>
          </Link>
          <nav className="hidden gap-1 text-sm sm:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                activeProps={{ className: "bg-accent/60 text-foreground" }}>
                <n.icon className="h-3.5 w-3.5" /> {n.label}
              </Link>
            ))}
          </nav>
          <nav className="flex gap-3 text-xs text-muted-foreground sm:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="hover:text-foreground">{n.label}</Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="relative z-10 border-b border-border/60">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 sm:py-14 lg:grid-cols-[1fr_auto]">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                {icon} {eyebrow}
              </span>
            )}
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {title}
            </h1>
            {subtitle && <p className="mt-3 max-w-2xl text-base text-muted-foreground">{subtitle}</p>}
          </motion.div>
          {art && (
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }} className="hidden lg:block">
              {art}
            </motion.div>
          )}
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10">{children}</main>

      <footer className="relative z-10 border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Carsai YT Studio · MIT</span>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacidade</Link>
            <Link to="/terms" className="hover:text-foreground">Termos</Link>
            <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
            <Link to="/security" className="hover:text-foreground">Segurança</Link>
            <Link to="/about" className="hover:text-foreground">Sobre</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { PublicShell as PublicLayout };

// Re-usable section card
export function SectionCard({
  number, title, icon, children, accent = false,
}: {
  number?: string | number; title: string; icon?: ReactNode; accent?: boolean; children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4 }}
      className={`group relative overflow-hidden rounded-2xl border bg-card/60 p-5 backdrop-blur sm:p-6 ${
        accent ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30"
      }`}
    >
      <header className="mb-3 flex items-center gap-3">
        {number !== undefined && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-brand font-display text-sm font-bold text-primary-foreground">
            {number}
          </span>
        )}
        {icon && !number && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-brand text-primary-foreground">
            {icon}
          </span>
        )}
        <h2 className="font-display text-lg font-bold sm:text-xl">{title}</h2>
      </header>
      <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
    </motion.section>
  );
}

// Decorative animated SVG art
export function FloatingArt({ variant = "rocket" }: { variant?: "rocket" | "shield" | "doc" | "spark" | "cookie" }) {
  return (
    <div className="relative h-52 w-52">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`g-${variant}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <motion.circle cx="100" cy="100" r="80" fill={`url(#g-${variant})`}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.circle cx="100" cy="100" r="55" fill="hsl(var(--background))" opacity="0.4"
          animate={{ scale: [1, 0.9, 1] }} transition={{ duration: 3, repeat: Infinity }} />
        {variant === "rocket" && (
          <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
            <path d="M100 50 L120 110 L100 100 L80 110 Z" fill="hsl(var(--primary-foreground))" />
            <circle cx="100" cy="80" r="6" fill="hsl(var(--primary))" />
          </motion.g>
        )}
        {variant === "shield" && (
          <motion.path d="M100 60 L130 75 L130 110 Q100 140 70 110 L70 75 Z"
            fill="hsl(var(--primary-foreground))"
            animate={{ rotate: [0, 3, -3, 0] }} transform-origin="100 100"
            transition={{ duration: 4, repeat: Infinity }} />
        )}
        {variant === "doc" && (
          <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 5, repeat: Infinity }}>
            <rect x="70" y="60" width="60" height="80" rx="6" fill="hsl(var(--primary-foreground))" />
            <rect x="80" y="75" width="40" height="3" fill="hsl(var(--primary))" />
            <rect x="80" y="85" width="32" height="3" fill="hsl(var(--primary))" opacity="0.6" />
            <rect x="80" y="95" width="40" height="3" fill="hsl(var(--primary))" opacity="0.6" />
            <rect x="80" y="105" width="28" height="3" fill="hsl(var(--primary))" opacity="0.4" />
          </motion.g>
        )}
        {variant === "spark" && (
          <motion.g animate={{ rotate: [0, 360] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "100px 100px" }}>
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <rect key={i} x="98" y="40" width="4" height="18" rx="2"
                fill="hsl(var(--primary-foreground))"
                transform={`rotate(${deg} 100 100)`} />
            ))}
            <circle cx="100" cy="100" r="10" fill="hsl(var(--primary-foreground))" />
          </motion.g>
        )}
        {variant === "cookie" && (
          <motion.g animate={{ rotate: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity }}
            style={{ transformOrigin: "100px 100px" }}>
            <circle cx="100" cy="100" r="40" fill="hsl(var(--primary-foreground))" />
            <circle cx="86" cy="90" r="4" fill="hsl(var(--primary))" />
            <circle cx="110" cy="100" r="5" fill="hsl(var(--primary))" />
            <circle cx="95" cy="115" r="3" fill="hsl(var(--primary))" />
            <circle cx="115" cy="82" r="3" fill="hsl(var(--primary))" />
          </motion.g>
        )}
      </svg>
    </div>
  );
}
