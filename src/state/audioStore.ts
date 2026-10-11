import { create } from "zustand"

import { sendToBackground } from "@plasmohq/messaging"

import type { TrackRecord } from "../storage/db"

interface AudioState {
  currentTrack: TrackRecord | null
  isPlaying: boolean
  currentTime: number
  duration: number
  queue: TrackRecord[]
  queueIndex: number

  play: () => Promise<void>
  pause: () => Promise<void>
  seek: (time: number) => Promise<void>
  loadTrack: (track: TrackRecord) => Promise<void>
  setQueue: (tracks: TrackRecord[], startIndex?: number) => void
  next: () => Promise<void>
  previous: () => Promise<void>

  // Handlers for state updates from offscreen
  updatePlaybackState: (currentTime: number, duration: number) => void
  onEnded: () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  queue: [],
  queueIndex: 0,

  play: async () => {
    await sendToBackground({ name: "play" } as any)
    set({ isPlaying: true })
  },

  pause: async () => {
    await sendToBackground({ name: "pause" } as any)
    set({ isPlaying: false })
  },

  seek: async (time: number) => {
    await sendToBackground({ name: "seek", body: { time } } as any)
    set({ currentTime: time })
  },

  loadTrack: async (track: TrackRecord) => {
    // Send track and its handle to offscreen
    await sendToBackground({
      name: "load",
      body: { track, fileHandle: track.fileHandle }
    } as any)
    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration
    })
  },

  setQueue: (tracks: TrackRecord[], startIndex = 0) => {
    set({ queue: tracks, queueIndex: startIndex })
    if (tracks.length > 0 && tracks[startIndex]) {
      get().loadTrack(tracks[startIndex])
    }
  },

  next: async () => {
    const { queue, queueIndex } = get()
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1
      set({ queueIndex: nextIndex })
      await get().loadTrack(queue[nextIndex])
    }
  },

  previous: async () => {
    const { queue, queueIndex, currentTime } = get()
    if (currentTime > 3) {
      await get().seek(0)
    } else if (queueIndex > 0) {
      const prevIndex = queueIndex - 1
      set({ queueIndex: prevIndex })
      await get().loadTrack(queue[prevIndex])
    }
  },

  updatePlaybackState: (currentTime: number, duration: number) => {
    set({ currentTime, duration })
  },

  onEnded: () => {
    get().next()
  }
}))
