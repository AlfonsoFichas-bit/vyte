import { type DBSchema, type IDBPDatabase, openDB } from "idb"

export interface TrackRecord {
  id: string // path or unique identifier
  fileHandle: FileSystemFileHandle
  title: string
  artist: string
  album: string
  duration: number
  hasCover: boolean
  createdAt: number
  favorite?: boolean
}

export interface CoverRecord {
  id: string
  data: ArrayBuffer
  mimeType: string
}

export interface PlaylistRecord {
  id: string
  name: string
  tracks: string[]
  createdAt: number
}

interface VyteDB extends DBSchema {
  handles: {
    key: string
    value: { id: string; handle: FileSystemDirectoryHandle }
  }
  tracks: {
    key: string
    value: TrackRecord
    indexes: {
      "by-title": string
      "by-artist": string
      "by-album": string
    }
  }
  covers: {
    key: string
    value: CoverRecord
  }
  playlists: {
    key: string
    value: PlaylistRecord
  }
}

let dbPromise: Promise<IDBPDatabase<VyteDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VyteDB>("vyte-music-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("handles")) {
          db.createObjectStore("handles", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("tracks")) {
          const trackStore = db.createObjectStore("tracks", { keyPath: "id" })
          trackStore.createIndex("by-title", "title")
          trackStore.createIndex("by-artist", "artist")
          trackStore.createIndex("by-album", "album")
        }
        if (!db.objectStoreNames.contains("covers")) {
          db.createObjectStore("covers", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("playlists")) {
          db.createObjectStore("playlists", { keyPath: "id" })
        }
      }
    })
  }
  return dbPromise
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle) {
  const db = await getDB()
  await db.put("handles", { id: "root", handle })
}

export async function getDirectoryHandle(): Promise<
  FileSystemDirectoryHandle | undefined
> {
  const db = await getDB()
  const record = await db.get("handles", "root")
  return record?.handle
}

export async function clearLibrary() {
  const db = await getDB()
  await db.clear("tracks")
  await db.clear("covers")
}

export async function saveTrack(track: TrackRecord) {
  const db = await getDB()
  await db.put("tracks", track)
}

export async function getTracks(): Promise<TrackRecord[]> {
  const db = await getDB()
  return db.getAll("tracks")
}

export async function saveCover(cover: CoverRecord) {
  const db = await getDB()
  await db.put("covers", cover)
}

export async function getCover(id: string): Promise<CoverRecord | undefined> {
  const db = await getDB()
  return db.get("covers", id)
}
