import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface p-6 text-center">
      <Logo />
      <div>
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">{t("notFound.body")}</p>
      </div>
      <Button asChild>
        <Link to="/">{t("notFound.home")}</Link>
      </Button>
    </div>
  );
};

export default NotFound;
