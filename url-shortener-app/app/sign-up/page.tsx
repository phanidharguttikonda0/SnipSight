"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Eye, EyeOff } from "lucide-react"

const countries = [
  { id: 1, name: "United States" },
  { id: 2, name: "United Kingdom" },
  { id: 3, name: "Canada" },
  { id: 4, name: "Australia" },
  { id: 5, name: "Germany" },
  { id: 6, name: "France" },
  { id: 7, name: "India" },
  { id: 8, name: "Japan" },
]

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    mail_id: "",
    mobile: "",
    country_id: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authAPI.signUp({
        ...formData,
        country_id: Number.parseInt(formData.country_id),
      })

      // Extract Authorization header ONLY from response headers (lowercase)
      const authHeader = response.headers.authorization;
      toast({
        title: "Debug: Auth Header",
        description: `response.headers.authorization: ${response.headers.authorization}\nExtracted authHeader: ${authHeader}`,
        variant: "default",
      });
      if (!authHeader) {
        throw new Error("No Authorization header received from server");
      }
      localStorage.setItem("authHeader", authHeader);
      // Extract user data from response body or create default
      let userData: any = undefined;
      if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        userData = (response.data as any).user;
      }
      if (!userData) {
        userData = {
          username: formData.username,
          email: formData.mail_id,
        };
      }
      login(authHeader, userData);

      toast({
        title: "Account created!",
        description: "Welcome to SnipSight. Your account has been created successfully.",
      })
    } catch (error: any) {
      console.error("Sign up error:", error)
      toast({
        title: "Sign up failed",
        description: error.response?.data?.message || error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">Create your account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.mail_id}
                  onChange={(e) => setFormData({ ...formData, mail_id: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country_id}
                  onValueChange={(value) => setFormData({ ...formData, country_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
