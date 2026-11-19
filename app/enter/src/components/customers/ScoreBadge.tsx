import { Badge } from "@/components/ui/badge";
import { scoreTone } from "@/lib/crm";

/** Buying capability score (0–10, one decimal). */
export const ScoreBadge = ({ score }: { score: number | null | undefined }) => (
  <Badge variant={scoreTone(score)} className="tabular-nums">
    {score == null ? "—" : Number(score).toFixed(1)}
  </Badge>
);
