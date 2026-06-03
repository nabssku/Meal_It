import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  color?: "primary" | "budget" | "success" | "warning";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  color = "primary",
  className,
}) => {
  const colors = {
    primary: "bg-primary/10 text-primary",
    budget: "bg-budget/10 text-budget",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className={cn("card-premium p-4 flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
        <div className={cn("p-2 rounded-lg", colors[color])}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-text-primary">{value}</span>
        {subValue && <span className="text-[10px] text-text-muted">{subValue}</span>}
      </div>
    </div>
  );
};

export default StatCard;
