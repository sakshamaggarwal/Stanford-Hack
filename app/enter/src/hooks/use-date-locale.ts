import { useTranslation } from "react-i18next";
import { enUS, zhCN } from "date-fns/locale";

/** date-fns locale matching the active UI language. */
export function useDateLocale() {
  const { i18n } = useTranslation();
  return (i18n.resolvedLanguage ?? i18n.language).startsWith("zh") ? zhCN : enUS;
}
