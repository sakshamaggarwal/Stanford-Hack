import { useTranslation } from "react-i18next";

/** Translated labels for stored codes (need type, timeline, marital status, email type). */
export function useCrmLabels() {
  const { t } = useTranslation();
  const need: Record<string, string> = {
    buy: t("need.buy"),
    sell: t("need.sell"),
    purchase_loan: t("need.purchaseLoan"),
    refinance: t("need.refinance"),
    learning: t("need.learning"),
  };
  const timeline: Record<string, string> = {
    lt3: t("timeline.under3"),
    "3to6": t("timeline.months3to6"),
    "6to12": t("timeline.months6to12"),
    "12plus": t("timeline.over12"),
  };
  const marital: Record<string, string> = {
    single: t("marital.single"),
    married: t("marital.married"),
    other: t("marital.other"),
  };
  const emailType: Record<string, string> = {
    booking_invite: t("emailType.bookingInvite"),
    reminder: t("emailType.reminder"),
    consultant_invite: t("emailType.consultantInvite"),
  };
  return { need, timeline, marital, emailType };
}
