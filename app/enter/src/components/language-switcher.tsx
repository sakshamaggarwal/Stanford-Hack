import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { fallbackLng, languageOptions, normalizeLanguage } from "@/i18n/config";

type LanguageSwitcherProps = { className?: string; tone?: "light" | "dark" };

/** Global EN / 中文 UI toggle. Languages come from i18n.config.json. */
export const LanguageSwitcher = ({ className, tone = "dark" }: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const current = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language) ?? fallbackLng;

  return (
    <ToggleGroup
      type="single"
      value={current}
      aria-label={t("common.language")}
      onValueChange={(v) => v && void i18n.changeLanguage(v)}
      className={cn("rounded-lg p-0.5", tone === "light" ? "bg-sidebar-accent" : "bg-muted", className)}
    >
      {languageOptions.map((l) => (
        <ToggleGroupItem
          key={l.value}
          value={l.value}
          className={cn(
            "h-7 rounded-md px-3 text-xs font-semibold",
            tone === "light"
              ? "text-sidebar-foreground data-[state=on]:bg-sidebar-primary data-[state=on]:text-sidebar-primary-foreground"
              : "text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:shadow-sm",
          )}
        >
          {l.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
