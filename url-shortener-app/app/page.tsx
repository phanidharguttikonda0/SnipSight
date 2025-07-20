"use client"

import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LinkIcon, Shield, BarChart3, Globe, Smartphone, Clock, QrCode, Eye, Download, Lock } from "lucide-react"
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  // useEffect(() => {
  //   if (!isLoading) {
  //     const token = localStorage.getItem("authHeader")
  //     if (token) {
  //       router.push("/dashboard")
  //     }
  //   }
  // }, [isLoading])


  if (user) {
    return null // redirects to the dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Features */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Shorten URLs &{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Share Files
                  </span>{" "}
                  with Insight
                </h1>
                <p className="text-xl text-gray-600 mt-6">
                  Professional URL shortening with advanced analytics and secure file sharing platform
                </p>
              </div>

              {/* URL Shortener Features */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <LinkIcon className="w-6 h-6 mr-2 text-blue-600" />
                  URL Shortener Features
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Key Insights</h4>
                      <p className="text-sm text-gray-600">Detailed analytics and click tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Eye className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Hover Preview</h4>
                      <p className="text-sm text-gray-600">Preview links before clicking</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <QrCode className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium">QR Code Generation</h4>
                      <p className="text-sm text-gray-600">Instant QR codes for your links</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Geo Location</h4>
                      <p className="text-sm text-gray-600">Track visitor locations and sources</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Smartphone className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Device Tracking</h4>
                      <p className="text-sm text-gray-600">Monitor device types and browsers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Rate Limiting</h4>
                      <p className="text-sm text-gray-600">Advanced security controls</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Sharing Features */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-purple-600" />
                  Secure File Sharing{" "}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-2">Coming Soon</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Private Sharing</h4>
                      <p className="text-sm text-gray-600">One-time view with time expiration</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Download className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Multiple Formats</h4>
                      <p className="text-sm text-gray-600">Support for images, videos, documents</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Highest Security</h4>
                      <p className="text-sm text-gray-600">Screenshot protection & encryption</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Public Sharing</h4>
                      <p className="text-sm text-gray-600">Share files publicly with analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Auth */}
            <div className="lg:pl-12">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Get Started with SnipSight</h2>
                  <p className="text-gray-600 mt-2">
                    Join thousands of users who trust SnipSight for their link management
                  </p>
                </div>

                <div className="space-y-4">
                  <Link href="/sign-up" className="w-full">
                    <Button className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Sign Up Free
                    </Button>
                  </Link>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                    </div>
                  </div>

                  <Link href="/sign-in" className="w-full">
                    <Button variant="outline" className="w-full h-12 text-lg bg-transparent">
                      Sign In
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center text-sm text-gray-500">
                    <p>✓ Free forever plan</p>
                    <p>✓ No credit card required</p>
                    <p>✓ Advanced analytics included</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
