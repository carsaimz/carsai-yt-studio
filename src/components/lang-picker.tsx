import { LOCALES, useI18n } from "@/lib/i18n";

type LangPickerProps = {
  /** Compact = flag + sigla only (e.g. "🇵🇹 PT"); dropdown still shows full names. */
  compact?: boolean;
  className?: string;
};

export function LangPicker({ compact = false, className = "" }: LangPickerProps) {
  const { lang, setLang } = useI18n();
  const cur = LOCALES.find((l) => l.code === lang) ?? LOCALES[0];

  return (
    <label
      className={`relative inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/80 px-2 py-1 text-xs text-foreground shadow-sm hover:border-primary/40 ${className}`}
      title={cur.label}
    >
      <span className="text-sm leading-none" aria-hidden>{cur.flag}</span>
      <span className="font-semibold tracking-wide">{cur.short}</span>
      {!compact && <span className="hidden md:inline text-muted-foreground">{cur.label}</span>}
      <span className="sr-only">Language</span>
      <select
        value={lang}
        aria-label="Language"
        onChange={(event) => setLang(event.currentTarget.value as typeof lang)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.flag} {locale.label}
          </option>
        ))}
      </select>
    </label>
  );
}
