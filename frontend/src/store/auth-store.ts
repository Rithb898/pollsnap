import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authClient } from "@/lib/auth-client"

interface User {
  id: string
  email: string
  name?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const result = await authClient.signIn.email({
            email,
            password,
          })
          if (result.error) {
            throw new Error(result.error.message || "Login failed")
          }
          const session = await authClient.getSession()
          if (session.data?.user) {
            set({
              user: {
                id: session.data.user.id,
                email: session.data.user.email,
                name: session.data.user.name,
              },
              isAuthenticated: true,
            })
          }
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          const result = await authClient.signUp.email({
            email,
            password,
            name,
          })
          if (result.error) {
            throw new Error(result.error.message || "Registration failed")
          }
          const session = await authClient.getSession()
          if (session.data?.user) {
            set({
              user: {
                id: session.data.user.id,
                email: session.data.user.email,
                name: session.data.user.name,
              },
              isAuthenticated: true,
            })
          }
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authClient.signOut()
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      checkSession: async () => {
        try {
          const session = await authClient.getSession()
          if (session.data?.user) {
            set({
              user: {
                id: session.data.user.id,
                email: session.data.user.email,
                name: session.data.user.name,
              },
              isAuthenticated: true,
            })
          } else {
            set({ user: null, isAuthenticated: false })
          }
        } catch {
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
