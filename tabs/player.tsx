import {
  FluentProvider,
  Title1,
  webDarkTheme,
  webLightTheme
} from "@fluentui/react-components"
import { useEffect, useState } from "react"
import "./player.css"

export default function PlayerPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setIsDark(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return (
    <FluentProvider
      theme={isDark ? webDarkTheme : webLightTheme}
      style={{ height: "100vh" }}>
      <div style={{ padding: "20px" }}>
        <Title1>Vyte Player</Title1>
        {/* TODO: Add library and playback bar */}
      </div>
    </FluentProvider>
  )
}
