import { createAuthClient } from "better-auth/react"

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8888"

export const authClient = createAuthClient({
  baseURL,
})

export async function requestPasswordReset(email: string) {
  const redirectTo = new URL("/reset-password", window.location.origin).toString()
  const response = await fetch(`${baseURL}/api/auth/request-password-reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, redirectTo }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "Reset request failed")
  }

  return payload
}
