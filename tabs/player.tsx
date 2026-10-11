import {
  Button,
  FluentProvider,
  Input,
  Select,
  Spinner,
  Text,
  Title1,
  Title3,
  webDarkTheme,
  webLightTheme
} from "@fluentui/react-components"
import {
  HeartFilled,
  HeartRegular,
  NextRegular,
  PauseRegular,
  PlayRegular,
  PreviousRegular
} from "@fluentui/react-icons"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { useAudioStore } from "../src/state/audioStore"
import { useLibraryStore } from "../src/state/libraryStore"
import { useFilteredTracks, useViewStore } from "../src/state/viewStore"
import "./player.css"

export default function PlayerPage() {
  const [themePref] = useStorage("theme", "system")
  const [isDark, setIsDark] = useState(false)

  const {
    hasAccess,
    needsPermission,
    isLoading,
    isScanning,
    scannedCount,
    initialize,
    requestAccess
  } = useLibraryStore()
  const {
    currentTrack,
    isPlaying,
    play,
    pause,
    next,
    previous,
    currentTime,
    duration
  } = useAudioStore()
  const {
    searchQuery,
    setSearchQuery,
    sortField,
    setSort,
    sortOrder,
    toggleFavorite
  } = useViewStore()
  const filteredTracks = useFilteredTracks()

  useEffect(() => {
    initialize()

    // Listen for state changes from background messages (e.g. playback updates)
    const handleMessage = (msg: any) => {
      if (msg.action === "playback-update") {
        useAudioStore
          .getState()
          .updatePlaybackState(msg.currentTime, msg.duration)
      } else if (msg.action === "playback-ended") {
        useAudioStore.getState().onEnded()
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [initialize])

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

  if (isLoading) {
    return (
      <FluentProvider
        theme={isDark ? webDarkTheme : webLightTheme}
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
        <Spinner label="Cargando librería..." />
      </FluentProvider>
    )
  }

  return (
    <FluentProvider
      theme={isDark ? webDarkTheme : webLightTheme}
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
          <Title1>Vyte</Title1>
          <Button
            type="button"
            onClick={() => chrome.runtime.openOptionsPage()}>
            Ajustes
          </Button>
        </div>

        {!hasAccess && !needsPermission && (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <Title3>Bienvenido a Vyte</Title3>
            <p>Selecciona una carpeta con música local para comenzar.</p>
            <Button type="button" appearance="primary" onClick={requestAccess}>
              Elegir carpeta
            </Button>
          </div>
        )}

        {needsPermission && (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <Title3>Se requiere permiso</Title3>
            <p>Por favor, vuelve a dar acceso a la carpeta de música.</p>
            <Button type="button" appearance="primary" onClick={requestAccess}>
              Dar acceso
            </Button>
          </div>
        )}

        {isScanning && (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <Spinner label={`Escaneando... (${scannedCount} archivos)`} />
          </div>
        )}

        {hasAccess && !isScanning && (
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <Input
                placeholder="Buscar por título, artista o álbum..."
                value={searchQuery}
                onChange={(_e, data) => setSearchQuery(data.value)}
                style={{ flex: 1 }}
              />
              <Select
                value={`${sortField}-${sortOrder}`}
                onChange={(_e, data) => {
                  const [field, order] = data.value.split("-")
                  setSort(field as any, order as any)
                }}>
                <option value="title-asc">Título (A-Z)</option>
                <option value="title-desc">Título (Z-A)</option>
                <option value="artist-asc">Artista (A-Z)</option>
                <option value="album-asc">Álbum (A-Z)</option>
              </Select>
            </div>

            {filteredTracks.length === 0 ? (
              <p>No se encontraron pistas.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {filteredTracks.map((track) => (
                  <li
                    key={track.id}
                    style={{
                      display: "flex",
                      padding: "10px",
                      borderBottom: "1px solid var(--colorNeutralStroke1)",
                      alignItems: "center"
                    }}>
                    <div
                      style={{ flex: 1, cursor: "pointer" }}
                      onClick={() => {
                        useAudioStore
                          .getState()
                          .setQueue(
                            filteredTracks,
                            filteredTracks.indexOf(track)
                          )
                      }}>
                      <Text weight="semibold" block>
                        {track.title}
                      </Text>
                      <Text size={200} block>
                        {track.artist} - {track.album}
                      </Text>
                    </div>
                    <Button
                      type="button"
                      appearance="transparent"
                      icon={track.favorite ? <HeartFilled /> : <HeartRegular />}
                      onClick={() => toggleFavorite(track)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {currentTrack && (
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid var(--colorNeutralStroke1)",
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}>
          <div style={{ flex: 1 }}>
            <Text weight="semibold" block>
              {currentTrack.title}
            </Text>
            <Text size={200} block>
              {currentTrack.artist}
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button
              type="button"
              icon={<PreviousRegular />}
              onClick={previous}
            />
            <Button
              type="button"
              icon={isPlaying ? <PauseRegular /> : <PlayRegular />}
              onClick={() => (isPlaying ? pause() : play())}
            />
            <Button type="button" icon={<NextRegular />} onClick={next} />
          </div>

          <div style={{ width: "150px" }}>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) =>
                useAudioStore.getState().seek(Number(e.target.value))
              }
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}
    </FluentProvider>
  )
}
