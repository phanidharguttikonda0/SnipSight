"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { urlAPI } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, Globe, Monitor, Smartphone, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(new Date().toISOString())
  const [shortenUrl, setShortenUrl] = useState("")

  const pageSize = 50

  useEffect(() => {
    if (params.shorten_url) {
      setShortenUrl(params.shorten_url as string)
      fetchInsights(new Date().toISOString(), 1)
    }
  }, [params.shorten_url])

  const fetchInsights = async (evaluatedKey: string, page: number) => {
    try {
      setIsLoading(true)
      const response = await urlAPI.getKeyInsights(
        params.shorten_url as string,
        pageSize,
        evaluatedKey
      )

      // @ts-ignore
      const data: InsightsResponse = response.data

      if (page === 1) {
        setInsights(data.list)
      } else {
        setInsights(prev => [...prev, ...data.list])
      }

      // Check if there's a next page
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
    }
  }

  const handleNextPage = () => {
    if (hasNextPage && lastEvaluatedKey) {
      fetchInsights(lastEvaluatedKey, currentPage + 1)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
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
        return 'bg-green-100 text-green-800'
      case 'firefox':
        return 'bg-orange-100 text-orange-800'
      case 'safari':
        return 'bg-blue-100 text-blue-800'
      case 'edge':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading && insights.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-800">Loading insights...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Key Insights</h1>
              <p className="text-gray-600 mt-1">
                Analytics for <span className="font-mono bg-gray-100 px-2 py-1 rounded">{shortenUrl}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{insights.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Locations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(insights.map(i => i.location)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Monitor className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Browsers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(insights.map(i => i.browser)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Page {currentPage}</p>
                  <p className="text-2xl font-bold text-gray-900">{pageSize} per page</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Detailed Analytics
            </CardTitle>
            <CardDescription>
              Click-by-click analytics showing visitor information and behavior patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Yet</h3>
                <p className="text-gray-600">
                  Once people start clicking your link, you'll see detailed analytics here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Browser</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>OS</TableHead>
                        <TableHead>Referral Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insights.map((insight, index) => (
                        <TableRow key={`${insight.insight_time}-${index}`}>
                          <TableCell className="font-mono text-sm">
                            {formatTimestamp(insight.insight_time)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {insight.ip_address}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              <span className="truncate max-w-xs" title={insight.location}>
                                {insight.location || "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getBrowserBadgeColor(insight.browser)}>
                              {insight.browser}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getDeviceIcon(insight.device_type)}
                              <span>{insight.device_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{insight.os}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {insight.refferal_source === "Direct" ? (
                                <Badge variant="secondary">Direct</Badge>
                              ) : (
                                <span className="truncate max-w-xs" title={insight.refferal_source}>
                                  {insight.refferal_source}
                                </span>
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {insights.length} insights (Page {currentPage})
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!hasNextPage || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {!hasNextPage && insights.length > 0 && (
                  <div className="text-center mt-4 py-4 border-t">
                    <p className="text-sm text-gray-500">
                      You've reached the end of the insights data
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