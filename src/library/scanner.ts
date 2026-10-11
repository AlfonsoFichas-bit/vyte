import { parseBlob } from "music-metadata"

import {
  clearLibrary,
  getDirectoryHandle,
  saveCover,
  saveDirectoryHandle,
  saveTrack,
  type TrackRecord
} from "../storage/db"

const SUPPORTED_EXTENSIONS = [".mp3", ".flac", ".ogg", ".m4a", ".wav", ".aac"]

function isSupportedExt(filename: string): boolean {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase()
  return SUPPORTED_EXTENSIONS.includes(ext)
}

async function verifyPermission(
  fileHandle: FileSystemHandle,
  readWrite = false
): Promise<boolean> {
  const options: FileSystemHandlePermissionDescriptor = {
    mode: readWrite ? "readwrite" : "read"
  }
  // Check if we already have permission, if so, return true.
  if ((await fileHandle.queryPermission(options)) === "granted") {
    return true
  }
  // Request permission to the file, if the user grants permission, return true.
  if ((await fileHandle.requestPermission(options)) === "granted") {
    return true
  }
  return false
}

export async function requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await window.showDirectoryPicker({
      id: "vyte-music-library",
      mode: "read"
    })
    await saveDirectoryHandle(handle)
    return handle
  } catch (error) {
    console.error("User cancelled directory picker", error)
    return null
  }
}

export async function checkExistingAccess(): Promise<FileSystemDirectoryHandle | null> {
  const handle = await getDirectoryHandle()
  if (!handle) return null

  const hasPermission = await verifyPermission(handle)
  if (hasPermission) return handle

  return null
}

export async function scanLibrary(
  dirHandle: FileSystemDirectoryHandle,
  onProgress: (scanned: number) => void
): Promise<TrackRecord[]> {
  await clearLibrary()
  const tracks: TrackRecord[] = []
  let scannedCount = 0

  async function traverse(
    currentDir: FileSystemDirectoryHandle,
    pathPrefix: string = ""
  ) {
    for await (const entry of currentDir.values()) {
      if (entry.kind === "file") {
        if (isSupportedExt(entry.name)) {
          const fileHandle = entry as FileSystemFileHandle
          const path = pathPrefix + entry.name

          try {
            const file = await fileHandle.getFile()
            // We use music-metadata in browser build
            const metadata = await parseBlob(file)

            const title =
              metadata.common.title || entry.name.replace(/\.[^/.]+$/, "")
            const artist = metadata.common.artist || "Unknown Artist"
            const album = metadata.common.album || "Unknown Album"
            const duration = metadata.format.duration || 0

            let hasCover = false
            if (metadata.common.picture && metadata.common.picture.length > 0) {
              const pic = metadata.common.picture[0]
              const coverId = `cover-${album}-${artist}`.replace(
                /[^a-z0-9]/gi,
                "_"
              )
              await saveCover({
                id: coverId,
                data: pic.data.buffer,
                mimeType: pic.format
              })
              hasCover = true
            }

            const trackRecord: TrackRecord = {
              id: path,
              fileHandle,
              title,
              artist,
              album,
              duration,
              hasCover,
              createdAt: Date.now()
            }

            await saveTrack(trackRecord)
            tracks.push(trackRecord)

            scannedCount++
            onProgress(scannedCount)
          } catch (e) {
            console.error(`Error parsing metadata for ${path}`, e)
          }
        }
      } else if (entry.kind === "directory") {
        await traverse(
          entry as FileSystemDirectoryHandle,
          `${pathPrefix + entry.name}/`
        )
      }
    }
  }

  await traverse(dirHandle)
  return tracks
}
