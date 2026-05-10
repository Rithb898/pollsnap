import React from "react"
import { Navigate, useLocation } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore()
  const location = useLocation()
  const [checking, setChecking] = React.useState(!isAuthenticated)

  React.useEffect(() => {
    let mounted = true
    if (!isAuthenticated) {
      checkSession().then(() => {
        if (mounted) setChecking(false)
      })
    }
    return () => { mounted = false }
  }, [checkSession, isAuthenticated])

  if (checking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
