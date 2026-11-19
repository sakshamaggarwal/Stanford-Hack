import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaff } from "@/hooks/use-crm";

/** Route guard for admin-only pages; consultants land on their calendar. */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useStaff();
  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (data?.role !== "admin") return <Navigate to="/calendar" replace />;
  return <>{children}</>;
}
