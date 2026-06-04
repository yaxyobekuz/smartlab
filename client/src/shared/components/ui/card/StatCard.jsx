// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Components
import Card from "@/shared/components/ui/card/Card";
import AnimatedCounter from "@/shared/components/ui/counter/AnimatedCounter";

const StatCard = ({
  hint,
  label,
  value,
  icon: Icon,
  suffix = "",
  isMoney = false,
  tone = "default",
}) => {
  const toneClass = {
    default: "bg-white",
    positive: "bg-emerald-50 border-emerald-200",
    negative: "bg-rose-50 border-rose-200",
    info: "bg-blue-50 border-blue-200",
    warn: "bg-amber-50 border-amber-200",
  }[tone];

  const iconTone = {
    default: "text-zinc-500",
    positive: "text-emerald-600",
    negative: "text-rose-600",
    info: "text-blue-600",
    warn: "text-amber-600",
  }[tone];

  const safeValue =
    typeof value === "number" && Number.isFinite(value) ? value : 0;

  return (
    <Card className={cn(toneClass)}>
      {/* Top */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-zinc-600">{label}</p>
        {Icon && <Icon className={cn("size-4", iconTone)} />}
      </div>

      <p className="text-2xl font-semibold tracking-tight">
        {value === null || value === undefined ? (
          <span className="text-zinc-400">—</span>
        ) : (
          <AnimatedCounter
            value={safeValue}
            formatter={isMoney ? formatMoney : undefined}
            suffix={suffix}
          />
        )}
      </p>

      {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
    </Card>
  );
};

export default StatCard;
