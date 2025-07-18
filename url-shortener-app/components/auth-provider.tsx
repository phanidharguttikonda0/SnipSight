"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: ((authHeader: string) => void) & ((authHeader: string, userData: User) => void)
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const authHeader = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (authHeader && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ["/", "/sign-in", "/sign-up"]
      const isPublicPath = publicPaths.includes(pathname)

      if (!user && !isPublicPath) {
        router.push("/")
      } else if (user && (pathname === "/sign-in" || pathname === "/sign-up")) {
        router.push("/dashboard")
      }
    }
  }, [user, pathname, router, isLoading])

  function login(authHeader: string): void;
  function login(authHeader: string, userData: User): void;
  function login(authHeader: string, userData?: User): void {
    if (userData) {
      localStorage.setItem("auth_token", authHeader) // Store the full Authorization header
      localStorage.setItem("user_data", JSON.stringify(userData))
      setUser(userData)
      router.push("/dashboard")
    } else {
      // fallback: just store the token, no user data
      localStorage.setItem("auth_token", authHeader)
      setUser(null)
      router.push("/dashboard")
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
