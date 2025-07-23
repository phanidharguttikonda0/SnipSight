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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { 
  Eye, EyeOff, Shield, Zap, Users, CheckCircle, ArrowRight, Sparkles,
  Globe, BarChart3, Award, Star, Gift, Crown
} from "lucide-react"
import { isValidUsernName, isValidEmail, isValidMobile } from "./validation"

const countries: { id: number; name: string; flag: string }[] = [
  { id: 1, name: "India", flag: "🇮🇳" },
  { id: 2, name: "United States", flag: "🇺🇸" },
  { id: 3, name: "United Kingdom", flag: "🇬🇧" },
  { id: 4, name: "Canada", flag: "🇨🇦" },
  { id: 5, name: "Australia", flag: "🇦🇺" },
  { id: 6, name: "Germany", flag: "🇩🇪" },
  { id: 7, name: "France", flag: "🇫🇷" },
  { id: 8, name: "Japan", flag: "🇯🇵" },
]

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    mail_id: "",
    mobile: "",
    country_id: "1",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (!isValidUsernName(formData.username.trim())) {
      toast({
        title: "Invalid Username",
        description: "Username must be 5+ characters with letters, numbers, and underscores only",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    } else if (!isValidEmail(formData.mail_id.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    } else if (!isValidMobile(formData.mobile.trim())) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await authAPI.signUp({
        username: formData.username.trim(),
        mail_id: formData.mail_id.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password.trim(),
        country_id: Number.parseInt(formData.country_id),
      })

      const authHeader = response.headers.authorization
      if (!authHeader) {
        throw new Error("No Authorization header received from server")
      }
      
      localStorage.setItem("authHeader", authHeader)
      
      let userData: any = undefined
      if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        userData = (response.data as any).user
      }
      if (!userData) {
        userData = {
          username: formData.username,
          email: formData.mail_id,
        }
      }
      
      login(authHeader, userData)

      toast({
        title: "🎉 Welcome to SnipSight!",
        description: "Your account has been created successfully. Let's start shortening URLs!",
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
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full">
          {/* Left side - Benefits & Features */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium mb-4">
                <Gift className="w-4 h-4 mr-2" />
                Free Forever Plan Available
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Join{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  50,000+ Users
                </span>{" "}
                Worldwide
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Start creating powerful short links with advanced analytics and insights
              </p>
            </div>

            {/* Feature Benefits */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics</h3>
                  <p className="text-gray-600">
                    Track every click with detailed insights including location, device, and referral data
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-green-100 text-green-700 text-xs">Real-time</Badge>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Detailed Reports</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Global Performance</h3>
                  <p className="text-gray-600">
                    Lightning-fast redirects with 99.9% uptime powered by our global CDN
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-green-100 text-green-700 text-xs">99.9% Uptime</Badge>
                    <Badge className="bg-orange-100 text-orange-700 text-xs">&lt;100ms Response</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Enterprise Security</h3>
                  <p className="text-gray-600">
                    Bank-level encryption and security with malware protection and rate limiting
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-red-100 text-red-700 text-xs">SSL/TLS</Badge>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">GDPR Compliant</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">4.9/5 from 2,500+ reviews</span>
              </div>
              <blockquote className="text-gray-700 italic mb-3">
                "SnipSight transformed our marketing campaigns. The analytics are incredible!"
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  S
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                  <div className="text-xs text-gray-600">Marketing Director, TechCorp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign Up Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="space-y-1 text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Start your journey with powerful link management
                </CardDescription>
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 mx-auto">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Free Forever Plan
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                      Username *
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      className="h-11 text-sm border-2 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500">5+ characters, letters, numbers, and underscores only</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.mail_id}
                      onChange={(e) => setFormData({ ...formData, mail_id: e.target.value })}
                      required
                      className="h-11 text-sm border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="h-11 text-sm border-2 focus:border-blue-500 transition-colors pr-11"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Minimum 8 characters required</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                      Mobile Number *
                    </Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="1234567890"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                      className="h-11 text-sm border-2 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500">10-digit mobile number</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country *
                    </Label>
                    <Select
                      value={formData.country_id}
                      onValueChange={(value) => setFormData({ ...formData, country_id: value })}
                      required
                    >
                      <SelectTrigger className="h-11 border-2 focus:border-blue-500">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Free Account
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
                    <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/sign-in">
                    <Button variant="outline" className="w-full h-12 text-base border-2 hover:bg-gray-50 transition-all duration-300">
                      Sign In Instead
                    </Button>
                  </Link>
                </div>

                {/* Benefits Summary */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 mb-3">
                    <div className="flex flex-col items-center space-y-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Free Forever</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>No Credit Card</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Instant Setup</span>
                    </div>
                  </div>
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