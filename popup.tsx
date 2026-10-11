import {
  Button,
  FluentProvider,
  webDarkTheme,
  webLightTheme
} from "@fluentui/react-components"
import { useEffect, useState } from "react"

function IndexPopup() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setIsDark(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return (
    <FluentProvider theme={isDark ? webDarkTheme : webLightTheme}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 16,
          width: 250,
          gap: 16
        }}>
        <h2>Vyte Music Player</h2>
        <Button
          appearance="primary"
          onClick={() => {
            chrome.runtime.sendMessage({ action: "open_player" })
          }}>
          Open Player
        </Button>
      </div>
    </FluentProvider>
  )
}

export default IndexPopup
