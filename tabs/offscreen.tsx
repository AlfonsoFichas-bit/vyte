import { useEffect, useRef } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { getCover } from "../src/storage/db"

export default function OffscreenDocument() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Media Session API initialization
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current?.play()
      })
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause()
      })
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (audioRef.current && details.seekTime !== undefined) {
          audioRef.current.currentTime = details.seekTime
        }
      })
      // Next/Previous to be handled by sending message to store/background
    }

    // Listen for messages from background/ui
    const handleMessage = async (msg: any) => {
      if (msg.action === "play") {
        audioRef.current?.play()
      } else if (msg.action === "pause") {
        audioRef.current?.pause()
      } else if (msg.action === "seek") {
        if (audioRef.current && msg.time !== undefined) {
          audioRef.current.currentTime = msg.time
        }
      } else if (msg.action === "load") {
        // We expect the file path/handle to be passed. Since offscreen is same origin, we can read from IDB.
        // For simplicity, assuming the background sends the file handle. Or we can read it from DB here.
        // However, Blob URLs must be created here.
        const { fileHandle, track } = msg
        if (fileHandle) {
          const file = await fileHandle.getFile()
          const url = URL.createObjectURL(file)
          if (audioRef.current) {
            audioRef.current.src = url
            audioRef.current.play()
          }

          // Update Media Session Metadata
          if ("mediaSession" in navigator && track) {
            let artwork = []
            if (track.hasCover) {
              const coverId = `cover-${track.album}-${track.artist}`.replace(
                /[^a-z0-9]/gi,
                "_"
              )
              const cover = await getCover(coverId)
              if (cover) {
                const blob = new Blob([cover.data], { type: cover.mimeType })
                artwork = [
                  {
                    src: URL.createObjectURL(blob),
                    sizes: "512x512",
                    type: cover.mimeType
                  }
                ]
              }
            }

            navigator.mediaSession.metadata = new MediaMetadata({
              title: track.title,
              artist: track.artist,
              album: track.album,
              artwork
            })
          }
        }
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  const handleTimeUpdate = () => {
    // Send time update to store/background if needed, but usually we just query it or update via state.
    // For now, let's keep it simple. We can use a broadcast channel or chrome.runtime.sendMessage.
    if (audioRef.current) {
      sendToBackground({
        name: "playback-update",
        body: {
          currentTime: audioRef.current.currentTime,
          duration: audioRef.current.duration
        }
      } as any)
    }
  }

  return (
    <div>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => sendToBackground({ name: "playback-ended" } as any)}
      />
    </div>
  )
}
