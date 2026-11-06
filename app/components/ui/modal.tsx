"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** A simple centered dialog rendered on top of the page (closes on Escape or backdrop click). */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "w-full sm:max-w-md max-h-[85vh] overflow-y-auto bg-[var(--background)] border rounded-t-xl sm:rounded-xl p-5 shadow-xl",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="opacity-70 hover:opacity-100 cursor-pointer" aria-label="Zavřít">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
