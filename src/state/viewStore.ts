import { create } from "zustand"

import { saveTrack, type TrackRecord } from "../storage/db"
import { useLibraryStore } from "./libraryStore"

export type SortField = "title" | "artist" | "album"
export type SortOrder = "asc" | "desc"

interface ViewState {
  searchQuery: string
  sortField: SortField
  sortOrder: SortOrder
  showFavoritesOnly: boolean

  setSearchQuery: (query: string) => void
  setSort: (field: SortField, order: SortOrder) => void
  toggleFavoritesOnly: () => void
  toggleFavorite: (track: TrackRecord) => Promise<void>
}

export const useViewStore = create<ViewState>((set) => ({
  searchQuery: "",
  sortField: "title",
  sortOrder: "asc",
  showFavoritesOnly: false,

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setSort: (field: SortField, order: SortOrder) =>
    set({ sortField: field, sortOrder: order }),

  toggleFavoritesOnly: () =>
    set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly })),

  toggleFavorite: async (track: TrackRecord) => {
    const updatedTrack = { ...track, favorite: !track.favorite }
    await saveTrack(updatedTrack)

    // Update track in libraryStore
    useLibraryStore.setState((state) => ({
      tracks: state.tracks.map((t) => (t.id === track.id ? updatedTrack : t))
    }))
  }
}))

export function useFilteredTracks() {
  const tracks = useLibraryStore((state) => state.tracks)
  const { searchQuery, sortField, sortOrder, showFavoritesOnly } =
    useViewStore()

  let filtered = tracks

  if (showFavoritesOnly) {
    filtered = filtered.filter((t) => t.favorite)
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    )
  }

  filtered = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortField === "title") cmp = a.title.localeCompare(b.title)
    else if (sortField === "artist") cmp = a.artist.localeCompare(b.artist)
    else if (sortField === "album") cmp = a.album.localeCompare(b.album)

    return sortOrder === "asc" ? cmp : -cmp
  })

  return filtered
}
