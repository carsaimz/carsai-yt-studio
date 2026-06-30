import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LOCALES, useI18n } from "@/lib/i18n";

type LangPickerProps = {
  compact?: boolean;
  className?: string;
};

export function LangPicker({ compact = false, className = "" }: LangPickerProps) {
  const { lang, setLang } = useI18n();
  const cur = LOCALES.find((l) => l.code === lang) ?? LOCALES[0];

  return (
    <label className={`inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-2.5 py-1.5 text-xs text-foreground shadow-sm ${className}`}>
      <span className="text-base" aria-hidden>{cur.flag}</span>
      {!compact && <span className="hidden sm:inline">{cur.label}</span>}
      <span className="sr-only">Language</span>
      <select
        value={lang}
        aria-label="Language"
        onChange={(event) => setLang(event.currentTarget.value as typeof lang)}
        className="h-7 cursor-pointer rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary/60"
      >
        {LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.flag} {locale.label}
          </option>
        ))}
      </select>
      <FontAwesomeIcon icon={["fas", "globe"]} className="hidden h-3 w-3 text-muted-foreground sm:block" />
    </label>
  );
}