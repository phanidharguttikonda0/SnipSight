"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Eye, EyeOff } from "lucide-react"
import {isValidUsernName} from "@/app/sign-up/validation";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!isValidUsernName(formData.username.trim())) {
      toast({
        title: "Error",
        description: "choose a valid username",
        variant: "destructive"
      });
    }else{
      try {
        const response = await authAPI.signIn(formData.username.trim(), formData.password.trim())

        if (response.status === 200) {
          // Extract Authorization header ONLY from response headers (lowercase)
          const authHeader = response.headers.authorization;
          console.log("The response headers are ",response.headers) ;
          toast({
            title: "Debug: Auth Header",
            description: `response.headers.authorization: ${response.headers.authorization}\nExtracted authHeader: ${authHeader}`,
            variant: "default",
          });
          if (!authHeader) {
            throw new Error("No Authorization header received from server");
          }
          localStorage.setItem("authHeader", authHeader);
          // Create a minimal user object for login
          let userData = undefined;
          if (response.data && typeof response.data === 'object' && 'user' in response.data) {
            userData = (response.data as any).user;
          }
          if (!userData) {
            userData = {
              username: formData.username,
              email: "",
            };
          }
          login(authHeader, userData);

          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          })
        }else{
          // @ts-ignore
          toast({
            title: "Error",
            description: response.data?.message || "Invalid credentials",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error("Sign in error:", error)
        toast({
          title: "Sign in failed",
          description: error.response?.data?.message || error.message || "Invalid credentials",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {"Don't have an account? "}
              <Link href="/sign-up" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
