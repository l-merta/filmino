"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { EllipsisVertical, FolderPlus, LogIn } from "lucide-react";

import { cn } from "@/lib/utils";
import { useItemStatus } from "@/hooks/useItemStatus";
import type { MediaRef } from "@/lib/collections";

import AddToCollectionDialog from "./AddToCollectionDialog";
import { SYSTEM_BUTTONS } from "./MediaActions";

export type ExtraAction = { label: string; icon?: React.ReactNode; onClick: () => void; destructive?: boolean };

interface Props {
  item: MediaRef;
  className?: string;
  extraActions?: ExtraAction[];
}

/**
 * The "⋮" button shown on media cards. Opens a small menu with the same quick
 * actions as a media page (Favorites / Watched / Watchlist / add to collection).
 * The menu is rendered in a portal so carousels with overflow:hidden don't cut it off.
 */
export default function ActionMenu({ item, className, extraActions }: Props) {
  const { data: session } = useSession() ?? {};
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Only fetch the status once someone actually opens the menu
  const state = useItemStatus(item, open || dialogOpen);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const place = () => {
      const r = buttonRef.current!.getBoundingClientRect();
      const width = 224;
      const left = Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8);
      setPos({ top: r.bottom + 4, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass = "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left cursor-pointer disabled:opacity-50";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Akce"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm cursor-pointer",
          "opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity",
          open && "md:opacity-100",
          className
        )}
      >
        <EllipsisVertical size={18} />
      </button>

      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-50 w-56 rounded-lg border bg-[var(--background)] p-1 shadow-xl"
          >
            <div className="px-3 py-1.5 text-xs opacity-60 line-clamp-1">{item.title}</div>
            {!session?.user ? (
              <Link href="/prihlaseni" className={itemClass}>
                <LogIn size={16} /> Přihlaste se
              </Link>
            ) : (
              <>
                {SYSTEM_BUTTONS.map(({ kind, label, activeLabel, icon: Icon }) => {
                  const active = !!state.status?.system[kind]?.contains;
                  return (
                    <button key={kind} role="menuitemcheckbox" aria-checked={active} className={itemClass} disabled={!state.status} onClick={() => state.toggleSystem(kind)}>
                      <Icon size={16} className={cn(active && "fill-current text-[var(--color-main,inherit)]")} />
                      {active ? activeLabel : label}
                    </button>
                  );
                })}
                <button
                  role="menuitem"
                  className={itemClass}
                  onClick={() => {
                    setOpen(false);
                    setDialogOpen(true);
                  }}
                >
                  <FolderPlus size={16} /> Přidat do kolekce…
                </button>
              </>
            )}
            {extraActions && extraActions.length > 0 && <div className="my-1 border-t" />}
            {extraActions?.map((a) => (
              <button
                key={a.label}
                role="menuitem"
                className={cn(itemClass, a.destructive && "text-destructive")}
                onClick={() => {
                  setOpen(false);
                  a.onClick();
                }}
              >
                {a.icon} {a.label}
              </button>
            ))}
            {state.error && <p className="px-3 py-1 text-xs text-destructive">{state.error}</p>}
          </div>,
          document.body
        )}

      {session?.user && (
        <AddToCollectionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={item.title} state={state} />
      )}
    </>
  );
}
