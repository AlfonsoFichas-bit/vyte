import { create } from "zustand"

import { getDB, type PlaylistRecord } from "../storage/db"

interface PlaylistState {
  playlists: PlaylistRecord[]

  loadPlaylists: () => Promise<void>
  createPlaylist: (name: string) => Promise<void>
  deletePlaylist: (id: string) => Promise<void>
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>
  removeTrackFromPlaylist: (
    playlistId: string,
    trackId: string
  ) => Promise<void>
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],

  loadPlaylists: async () => {
    const db = await getDB()
    const playlists = await db.getAll("playlists")
    set({ playlists })
  },

  createPlaylist: async (name: string) => {
    const db = await getDB()
    const id = `playlist-${Date.now()}`
    const newPlaylist: PlaylistRecord = {
      id,
      name,
      tracks: [],
      createdAt: Date.now()
    }
    await db.put("playlists", newPlaylist)
    await get().loadPlaylists()
  },

  deletePlaylist: async (id: string) => {
    const db = await getDB()
    await db.delete("playlists", id)
    await get().loadPlaylists()
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string) => {
    const db = await getDB()
    const playlist = await db.get("playlists", playlistId)
    if (playlist && !playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId)
      await db.put("playlists", playlist)
      await get().loadPlaylists()
    }
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    const db = await getDB()
    const playlist = await db.get("playlists", playlistId)
    if (playlist) {
      playlist.tracks = playlist.tracks.filter((t) => t !== trackId)
      await db.put("playlists", playlist)
      await get().loadPlaylists()
    }
  }
}))
