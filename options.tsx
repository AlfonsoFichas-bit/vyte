import {
  Button,
  Field,
  FluentProvider,
  Select,
  Title1,
  webDarkTheme,
  webLightTheme
} from "@fluentui/react-components"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { requestDirectoryAccess } from "./src/library/scanner"

export default function OptionsPage() {
  const [themePref, setThemePref] = useStorage("theme", "system")
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (themePref === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      setIsDark(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    } else {
      setIsDark(themePref === "dark")
    }
  }, [themePref])

  return (
    <FluentProvider
      theme={isDark ? webDarkTheme : webLightTheme}
      style={{ minHeight: "100vh", padding: "40px" }}>
      <Title1>Ajustes de Vyte</Title1>

      <div
        style={{
          marginTop: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "400px"
        }}>
        <Field label="Tema de la aplicación">
          <Select
            value={themePref}
            onChange={(_e, data) => setThemePref(data.value)}>
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </Select>
        </Field>

        <Field label="Carpeta de música">
          <Button
            type="button"
            onClick={async () => {
              const handle = await requestDirectoryAccess()
              if (handle) {
                alert(
                  "Carpeta actualizada correctamente. Vuelve al reproductor para escanear."
                )
              }
            }}>
            Cambiar carpeta de música
          </Button>
        </Field>
      </div>
    </FluentProvider>
  )
}
