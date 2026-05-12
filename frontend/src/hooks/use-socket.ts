import { useEffect, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { useSocketStore } from "@/store/socket-store"
import { authClient } from "@/lib/auth-client"

const getBaseURL = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:8888"
}

type EventCallback<T> = (data: T) => void

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  on: <T>(event: string, callback: EventCallback<T>) => () => void
  emit: (event: string, data?: unknown) => void
}

export function useSocket(namespace: "/creator" | "/respondent", pollId: string): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const listenersRef = useRef<Map<string, Set<EventCallback<unknown>>>>(new Map())
  const {
    setConnected,
    setNamespace,
    addJoinedPoll,
    setConnectionError,
    isConnected,
    connectionError,
  } = useSocketStore()

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) {
      return socketRef.current
    }

    const baseURL = getBaseURL()
    const query: Record<string, string> = { pollId }

    if (namespace === "/creator") {
      try {
        const session = await authClient.getSession()
        if (session.data?.session) {
          query.token = session.data.session.token
        }
      } catch {
        console.warn("No session found for creator namespace")
      }
    }

    const socket = io(`${baseURL}${namespace}`, {
      query,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on("connect", () => {
      setConnected(true)
      setNamespace(namespace)
      setConnectionError(null)
      socket.emit("join_poll", { pollId })
      addJoinedPoll(pollId)

      listenersRef.current.forEach((callbacks, event) => {
        callbacks.forEach((cb) => {
          socket.on(event, cb as never)
        })
      })
    })

    socket.on("disconnect", (reason) => {
      setConnected(false)
      if (reason === "io server disconnect") {
        socket.connect()
      }
    })

    socket.on("connect_error", (error) => {
      setConnectionError(error.message)
      setConnected(false)
    })

    socketRef.current = socket
    return socket
  }, [namespace, pollId, setConnected, setNamespace, addJoinedPoll, setConnectionError])

  const on = useCallback(<T,>(event: string, callback: EventCallback<T>) => {
    if (listenersRef.current.has(event)) {
      listenersRef.current.get(event)!.add(callback as EventCallback<unknown>)
    } else {
      listenersRef.current.set(event, new Set([callback as EventCallback<unknown>]))
    }

    if (socketRef.current?.connected) {
      socketRef.current.on(event, callback as never)
    }

    return () => {
      const callbacks = listenersRef.current.get(event)
      if (callbacks) {
        callbacks.delete(callback as EventCallback<unknown>)
      }
      if (socketRef.current?.connected) {
        socketRef.current.off(event, callback as never)
      }
    }
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setConnected(false)
        setNamespace(null)
        listenersRef.current.clear()
      }
    }
  }, [namespace, pollId, connect, setConnected, setNamespace])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    on,
    emit,
  }
}