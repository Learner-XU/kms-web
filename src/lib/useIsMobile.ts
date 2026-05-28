"use client"

import { useState, useEffect } from "react"

export function useIsMobile(breakpoint = 768) {
  const [state, setState] = useState<{ ready: boolean; isMobile: boolean }>({ ready: false, isMobile: false })

  useEffect(() => {
    const check = () => setState({ ready: true, isMobile: window.innerWidth < breakpoint })
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [breakpoint])

  return state
}
