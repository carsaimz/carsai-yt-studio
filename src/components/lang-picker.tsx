// Shared Language Picker for both authenticated layout and public area (Item 3).
// Uses Tailwind utility classes so it adapts to the theme automatically.
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useI18n, LOCALES } from "@/lib/i18n";

export function LangPicker({ align = "right" }: { align?: "right" | "left" }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const cur = LOCALES.find((l) => l.code === lang);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-border bg-card/60 text-foreground hover:bg-accent/40 text-sm"
      >
        <span className="text-base leading-none">{cur?.flag ?? "🌐"}</span>
        <span className="text-[11px] opacity-70">{cur?.code.split("-")[0].toUpperCase()}</span>
        <FontAwesomeIcon icon={["fas", "chevron-down"]} className="text-[9px] opacity-50" />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-[100]" />
          <div
            className={`absolute top-[calc(100%+6px)] z-[101] min-w-[170px] rounded-lg border border-border bg-popover p-1 shadow-2xl ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm ${
                  lang === l.code
                    ? "bg-primary/15 text-primary"
                    : "text-foreground hover:bg-accent/40"
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {lang === l.code && (
                  <FontAwesomeIcon icon={["fas", "check"]} className="text-[11px]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
