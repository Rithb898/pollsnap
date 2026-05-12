import { create } from "zustand"
import type { SocketState } from "@/types/socket"

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  namespace: null,
  joinedPolls: [],
  connectionError: null,

  setConnected: (connected) => set({ isConnected: connected }),
  setNamespace: (namespace) => set({ namespace }),
  addJoinedPoll: (pollId) =>
    set((state) => ({
      joinedPolls: state.joinedPolls.includes(pollId)
        ? state.joinedPolls
        : [...state.joinedPolls, pollId],
    })),
  removeJoinedPoll: (pollId) =>
    set((state) => ({
      joinedPolls: state.joinedPolls.filter((id) => id !== pollId),
    })),
  setConnectionError: (error) => set({ connectionError: error }),
}))