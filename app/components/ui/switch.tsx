"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** On/off toggle with a label, used in settings pages. */
export function Switch({ checked, onChange, disabled, label, description }: SwitchProps) {
  return (
    <label className={cn("flex items-start justify-between gap-4 cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
      <span className="flex flex-col">
        {label && <span className="font-medium">{label}</span>}
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer",
          checked ? "bg-[var(--color-main,var(--color-main-1))]" : "bg-input"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
    </label>
  );
}
