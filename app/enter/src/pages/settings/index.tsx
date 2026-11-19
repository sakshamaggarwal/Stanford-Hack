import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FlaskConical, Inbox, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSettings, useUpdateSettings } from "@/hooks/use-crm";

function InboxForm({ initial }: { initial: string }) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initial);
  const update = useUpdateSettings();
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(value.trim(), {
      onSuccess: () => toast.success(t("settings.saved")),
      onError: (err) => toast.error(err.message),
    });
  };
  return (
    <form onSubmit={save} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="inbox">{t("settings.inboxLabel")}</Label>
        <Input id="inbox" type="email" multiple required value={value} onChange={(e) => setValue(e.target.value)} />
        <p className="text-xs text-muted-foreground">{t("settings.inboxHint")}</p>
      </div>
      <Button type="submit" disabled={update.isPending}>
        {update.isPending ? <Loader2 className="animate-spin" /> : <Save />}
        {t("settings.save")}
      </Button>
    </form>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useSettings();

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-primary"><Inbox className="h-5 w-5 text-gold" />{t("settings.inboxTitle")}</CardTitle>
          <CardDescription>{t("settings.inboxBody")}</CardDescription>
        </CardHeader>
        <CardContent>{isLoading || !data ? <Skeleton className="h-10" /> : <InboxForm initial={data.test_inbox} />}</CardContent>
      </Card>
      <Card className="border-dashed border-gold bg-gold-soft/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-primary"><FlaskConical className="h-5 w-5 text-gold" />{t("settings.demoTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>{t("settings.demo1")}</li>
            <li>{t("settings.demo2")}</li>
            <li>{t("settings.demo3")}</li>
            <li>{t("settings.demo4")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
