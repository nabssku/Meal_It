"use client";

import { SessionProvider } from "next-auth/react";
import { PwaProvider } from "./PwaProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PwaProvider>{children}</PwaProvider>
    </SessionProvider>
  );
}
