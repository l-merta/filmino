"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

import { LibraryProvider } from "./LibraryProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LibraryProvider>
        {children}
      </LibraryProvider>
    </SessionProvider>
  );
}
