"use client"

import type React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  // Chakra UI v3 não precisa de provider na maioria dos casos
  return <>{children}</>
}
