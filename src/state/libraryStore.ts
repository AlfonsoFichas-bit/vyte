import { create } from "zustand"

import {
  checkExistingAccess,
  requestDirectoryAccess,
  scanLibrary
} from "../library/scanner"
import type { TrackRecord } from "../storage/db"
import { getTracks } from "../storage/db"

interface LibraryState {
  tracks: TrackRecord[]
  isLoading: boolean
  isScanning: boolean
  scannedCount: number
  hasAccess: boolean
  needsPermission: boolean

  initialize: () => Promise<void>
  requestAccess: () => Promise<void>
  reScan: () => Promise<void>
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  tracks: [],
  isLoading: true,
  isScanning: false,
  scannedCount: 0,
  hasAccess: false,
  needsPermission: false,

  initialize: async () => {
    set({ isLoading: true })
    const handle = await checkExistingAccess()

    if (handle) {
      const tracks = await getTracks()
      set({ tracks, hasAccess: true, needsPermission: false, isLoading: false })
    } else {
      // Check if we need permission by seeing if we have a handle in db but no permission
      const { getDirectoryHandle } = await import("../storage/db")
      const existingHandle = await getDirectoryHandle()

      if (existingHandle) {
        set({ hasAccess: false, needsPermission: true, isLoading: false })
      } else {
        set({ hasAccess: false, needsPermission: false, isLoading: false })
      }
    }
  },

  requestAccess: async () => {
    const handle = await requestDirectoryAccess()
    if (handle) {
      set({ hasAccess: true, needsPermission: false })
      await get().reScan()
    }
  },

  reScan: async () => {
    const { getDirectoryHandle } = await import("../storage/db")
    const handle = await getDirectoryHandle()

    if (!handle) return

    set({ isScanning: true, scannedCount: 0 })

    try {
      const tracks = await scanLibrary(handle, (count) => {
        set({ scannedCount: count })
      })
      set({ tracks, isScanning: false })
    } catch (e) {
      console.error("Scan failed", e)
      set({ isScanning: false })
    }
  }
}))
