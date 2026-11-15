"use client";

import React, { createContext, useContext } from "react";
import type { StudioStateView, StudioView } from "@/lib/studio/types";

interface RouteCtx {
  route: StudioStateView;
  navigate: (view: StudioView, extra?: Partial<StudioStateView>) => void;
}

const Ctx = createContext<RouteCtx>({
  route: { view: "dashboard" },
  navigate: () => {},
});

export function RouteProvider({ value, children }: { value: RouteCtx; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudioRoute() {
  return useContext(Ctx);
}
