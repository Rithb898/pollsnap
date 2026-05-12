import { WifiOff, Loader2 } from "lucide-react"
import { useSocketStore } from "@/store/socket-store"

export function ConnectionStatus() {
  const { isConnected, connectionError, namespace } = useSocketStore()

  if (isConnected || !namespace) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <WifiOff className="h-4 w-4" />
      <span>
        {connectionError || "Disconnected"}
      </span>
      {!isConnected && namespace && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
    </div>
  )
}