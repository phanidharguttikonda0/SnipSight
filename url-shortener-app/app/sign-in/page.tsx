"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Eye, EyeOff, Shield, Zap, Users, CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { isValidUsernName } from "@/app/sign-up/validation"

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
        title: "Invalid Username",
        description: "Please enter a valid username (5+ characters, letters, numbers, underscore)",
        variant: "destructive"
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await authAPI.signIn(formData.username.trim(), formData.password.trim())

      if (response.status === 200) {
        const authHeader = response.headers.authorization
        
        if (!authHeader) {
          throw new Error("No Authorization header received from server")
        }
        
        localStorage.setItem("authHeader", authHeader)
        
        let userData = undefined
        if (response.data && typeof response.data === 'object' && 'user' in response.data) {
          userData = (response.data as any).user
        }
        if (!userData) {
          userData = {
            username: formData.username,
            email: "",
          }
        }
        
        login(authHeader, userData)

        toast({
          title: "🎉 Welcome back!",
          description: "You have been signed in successfully.",
        })
      } else {
        toast({
          title: "Sign in failed",
          description: "Invalid credentials. Please check your username and password.",
          variant: "destructive"
        })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full">
          {/* Left side - Benefits */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome Back to{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SnipSight
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Continue managing your smart links and tracking powerful insights
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lightning Fast Access</h3>
                  <p className="text-gray-600">
                    Jump right back into your dashboard and continue where you left off
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Secure & Protected</h3>
                  <p className="text-gray-600">
                    Your data is encrypted and protected with enterprise-grade security
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Join 50,000+ Users</h3>
                  <p className="text-gray-600">
                    Part of a growing community of marketers and businesses
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h4 className="font-semibold text-gray-900 mb-4">Why users love SnipSight:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Real-time Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Global CDN</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign In Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="space-y-1 text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Access your SnipSight dashboard and analytics
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-base font-medium text-gray-700">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      className="h-12 text-base border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="h-12 text-base border-2 focus:border-blue-500 transition-colors pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to SnipSight?</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/sign-up">
                    <Button variant="outline" className="w-full h-12 text-base border-2 hover:bg-gray-50 transition-all duration-300">
                      Create Free Account
                    </Button>
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Protected by enterprise-grade security</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}