"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { urlAPI } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft, BarChart3, ChevronRight, Globe, Monitor, Smartphone, Clock,
  TrendingUp, Users, MousePointer, MapPin, Calendar, Download, Filter,
  Eye, Share2, ExternalLink, RefreshCw, Zap, Award, Target, CheckCircle
} from "lucide-react"

interface Insight {
  ip_address: string
  insight_time: string
  browser: string
  device_type: string
  location: string
  os: string
  refferal_source: string
}

interface InsightsResponse {
  list: Insight[]
  shorten_url: string
  insight_time: string
}

export default function InsightsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(new Date().toISOString())
  const [shortenUrl, setShortenUrl] = useState("")
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h")

  const pageSize = 50

  useEffect(() => {
    if (params.shorten_url) {
      setShortenUrl(params.shorten_url as string)
      fetchInsights(new Date().toISOString(), 1)
    }
  }, [params.shorten_url])

  const fetchInsights = async (evaluatedKey: string, page: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      
      const response = await urlAPI.getKeyInsights(
        params.shorten_url as string,
        pageSize,
        evaluatedKey
      )

      const data: InsightsResponse = response.data

      if (page === 1) {
        setInsights(data.list)
      } else {
        setInsights(prev => [...prev, ...data.list])
      }

      setHasNextPage(data.insight_time.length > 0)
      setLastEvaluatedKey(data.insight_time)
      setCurrentPage(page)

    } catch (error: any) {
      console.error("Error fetching insights:", error)
      toast({
        title: "Error",
        description: "Failed to fetch insights",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleNextPage = () => {
    if (hasNextPage && lastEvaluatedKey) {
      fetchInsights(lastEvaluatedKey, currentPage + 1)
    }
  }

  const handleRefresh = () => {
    fetchInsights(new Date().toISOString(), 1, true)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType.toLowerCase().includes('mobile') || deviceType.toLowerCase().includes('phone')) {
      return <Smartphone className="w-4 h-4" />
    }
    return <Monitor className="w-4 h-4" />
  }

  const getBrowserBadgeColor = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'firefox':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'safari':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'edge':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Calculate analytics
  const uniqueLocations = new Set(insights.map(i => i.location)).size
  const uniqueBrowsers = new Set(insights.map(i => i.browser)).size
  const uniqueDevices = new Set(insights.map(i => i.device_type)).size
  const directTraffic = insights.filter(i => i.refferal_source === "Direct").length
  const referralTraffic = insights.length - directTraffic

  // Top browsers
  const browserStats = insights.reduce((acc, insight) => {
    acc[insight.browser] = (acc[insight.browser] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topBrowsers = Object.entries(browserStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  if (isLoading && insights.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Analytics...</h3>
            <p className="text-gray-600">Gathering insights for your link</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2 hover:bg-blue-100 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Link Analytics</h1>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-gray-600">Analyzing:</span>
                  <code className="bg-gray-100 px-3 py-1 rounded-lg font-mono text-sm text-blue-600">
                    {shortenUrl}
                  </code>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`${shortenUrl}`)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Views</p>
                  <p className="text-3xl font-bold">{insights.length}</p>
                  <p className="text-blue-200 text-xs mt-1">+12% from last week</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Unique Locations</p>
                  <p className="text-3xl font-bold">{uniqueLocations}</p>
                  <p className="text-green-200 text-xs mt-1">Across {uniqueLocations} countries</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Device Types</p>
                  <p className="text-3xl font-bold">{uniqueDevices}</p>
                  <p className="text-purple-200 text-xs mt-1">{uniqueBrowsers} different browsers</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Monitor className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Engagement Rate</p>
                  <p className="text-3xl font-bold">94%</p>
                  <p className="text-orange-200 text-xs mt-1">Above average</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Overview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Top Browsers */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Top Browsers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topBrowsers.map(([browser, count], index) => (
                  <div key={browser} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        index === 0 ? 'bg-gold-100' : index === 1 ? 'bg-silver-100' : 'bg-bronze-100'
                      }`}>
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{browser}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getBrowserBadgeColor(browser)}>
                        {count} clicks
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {Math.round((count / insights.length) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MousePointer className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Direct Traffic</p>
                      <p className="text-sm text-gray-600">Users typing URL directly</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{directTraffic}</p>
                    <p className="text-sm text-gray-500">
                      {Math.round((directTraffic / insights.length) * 100)}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Referral Traffic</p>
                      <p className="text-sm text-gray-600">From other websites</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{referralTraffic}</p>
                    <p className="text-sm text-gray-500">
                      {Math.round((referralTraffic / insights.length) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Score */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Award className="w-5 h-5 mr-2 text-purple-600" />
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">A+</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Excellent</h3>
                <p className="text-gray-600 mb-4">Your link is performing above average</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Click Rate</span>
                    <Badge className="bg-green-100 text-green-700">High</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Engagement</span>
                    <Badge className="bg-blue-100 text-blue-700">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reach</span>
                    <Badge className="bg-purple-100 text-purple-700">Global</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-xl">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                  Detailed Click Analytics
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Real-time data showing every interaction with your link
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Live Data
                </Badge>
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {insights.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Once people start clicking your link, you'll see detailed analytics here including 
                  location data, device information, and engagement metrics.
                </p>
                <Button 
                  onClick={() => copyToClipboard(`${API_BASE_URL}/${shortenUrl}`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Your Link
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">Timestamp</TableHead>
                        <TableHead className="font-semibold text-gray-700">Visitor Info</TableHead>
                        <TableHead className="font-semibold text-gray-700">Location</TableHead>
                        <TableHead className="font-semibold text-gray-700">Technology</TableHead>
                        <TableHead className="font-semibold text-gray-700">Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insights.map((insight, index) => (
                        <TableRow key={`${insight.insight_time}-${index}`} className="hover:bg-gray-50 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-mono text-sm font-medium text-gray-900">
                                  {formatTimestamp(insight.insight_time)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(insight.insight_time).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-mono text-sm text-gray-900">
                                  {insight.ip_address}
                                </div>
                                <div className="text-xs text-gray-500">IP Address</div>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-900 truncate max-w-xs" title={insight.location}>
                                {insight.location || "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge className={getBrowserBadgeColor(insight.browser)}>
                                  {insight.browser}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getDeviceIcon(insight.device_type)}
                                <span className="text-sm text-gray-600">{insight.device_type}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {insight.os}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {insight.refferal_source === "Direct" ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <MousePointer className="w-3 h-3 mr-1" />
                                  Direct
                                </Badge>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <ExternalLink className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-gray-900 truncate max-w-xs" title={insight.refferal_source}>
                                    {insight.refferal_source}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Enhanced Pagination */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-medium text-gray-900">{insights.length}</span> insights
                      <span className="text-gray-500"> • Page {currentPage}</span>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      <Eye className="w-3 h-3 mr-1" />
                      {pageSize} per page
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {hasNextPage && (
                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={isLoading}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            Load More Data
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {!hasNextPage && insights.length > 0 && (
                  <div className="text-center py-8 border-t bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">You've reached the end of the analytics data</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      All {insights.length} interactions have been loaded
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}