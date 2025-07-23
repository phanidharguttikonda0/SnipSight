"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { urlAPI } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  LinkIcon, Copy, Edit, Trash2, BarChart3, Plus, ChevronLeft, ChevronRight,
  QrCode, ExternalLink, Search, Filter, Download, Eye, Globe, Calendar,
  TrendingUp, Users, MousePointer, Zap, Star, Award
} from "lucide-react"
import { API_BASE_URL } from "@/lib/api"
import { useRouter } from "next/navigation"

interface UrlItem {
  id: number
  original_url: string
  shorten_url: string
  view_count: number
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [urls, setUrls] = useState<UrlItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUrls, setSelectedUrls] = useState<number[]>([])
  const [createForm, setCreateForm] = useState({
    original_url: "",
    custom_url: "",
  })
  const { toast } = useToast()

  const pageSize = 10

  useEffect(() => {
    fetchUrls()
  }, [currentPage])

  const fetchUrls = async () => {
    try {
      setIsLoading(true)
      const response = await urlAPI.getUrls(pageSize, currentPage)
      setUrls(response.data.list || [])
      if (response.data.list?.length === pageSize) {
        setTotalPages(currentPage + 1)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch URLs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function isValidCustomName(input: string) {
    const allowedChars = /^[a-zA-Z0-9_-]{5,}$/
    return allowedChars.test(input) && !input.endsWith('-')
  }

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    
    if (createForm.custom_url.length !== 0 && !isValidCustomName(createForm.custom_url)) {
      toast({
        title: "Error",
        description: "Invalid custom name. Use 5+ characters (letters, numbers, _, -) and don't end with -",
        variant: "destructive"
      })
    } else {
      try {
        const response = await urlAPI.createUrl(createForm.original_url, createForm.custom_url || undefined)

        toast({
          title: "🎉 URL created successfully!",
          description: "Your short URL is ready to use and track.",
        })

        setCreateForm({ original_url: "", custom_url: "" })
        fetchUrls()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to create URL",
          variant: "destructive",
        })
      } finally {
        setIsCreating(false)
      }
    }
  }

  const handleDeleteUrl = async (id: number) => {
    if (!confirm("Are you sure you want to delete this URL? This action cannot be undone.")) return

    try {
      const response = await urlAPI.deleteUrl(id)
      if (response.status === 204) {
        setUrls((prevUrls) => prevUrls.filter((url) => url.id !== id))
        toast({
          title: "✅ URL deleted successfully!",
          description: "The URL and all its analytics data have been removed.",
        })
      } else {
        throw new Error("Delete failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete URL",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "📋 Copied to clipboard!",
      description: "URL is ready to share",
    })
  }

  const handleKeyInsights = async (shorten_url: string) => {
    try {
      const response = await urlAPI.getKeyInsights(shorten_url, 50, new Date().toISOString())
      if (response.status !== 200) {
        throw new Error("Could not load key insights")
      }

      if (response.data.list?.length === 0) {
        toast({
          title: "📊 No insights yet",
          description: "Share your link to start collecting analytics data!",
        })
      } else {
        router.push(`/dashboard/insights/${shorten_url}`)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch insights",
        variant: "destructive",
      })
    }
  }

  const generateQRCode = (url: string) => {
    // This would typically integrate with a QR code service
    toast({
      title: "🔲 QR Code Generated!",
      description: "QR code feature coming soon!",
    })
  }

  const filteredUrls = urls.filter(url => 
    url.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shorten_url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalClicks = urls.reduce((sum, url) => sum + url.view_count, 0)
  const averageClicks = urls.length > 0 ? Math.round(totalClicks / urls.length) : 0

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}! 👋</h1>
              <p className="text-gray-600 mt-1">Manage your links and track their performance</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total URLs</p>
                    <p className="text-3xl font-bold">{urls.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <LinkIcon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Clicks</p>
                    <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <MousePointer className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Avg. Clicks</p>
                    <p className="text-3xl font-bold">{averageClicks}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">This Month</p>
                    <p className="text-3xl font-bold">+{Math.floor(totalClicks * 0.3)}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create URL Form */}
        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex flex-wrap items-center text-lg sm:text-xl">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Create Your Next Powerful Link
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm sm:text-base">
              Transform any URL into a trackable, brandable short link with detailed analytics
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleCreateUrl} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="original_url" className="text-sm sm:text-base font-semibold text-gray-700">
                    Original URL *
                  </Label>
                  <Input
                      id="original_url"
                      type="url"
                      placeholder="https://example.com/your-amazing-content"
                      value={createForm.original_url}
                      onChange={(e) => setCreateForm({ ...createForm, original_url: e.target.value })}
                      required
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-blue-500 transition-colors w-full"
                  />
                  <p className="text-xs sm:text-sm text-gray-500">Enter the URL you want to shorten and track</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="custom_url" className="text-sm sm:text-base font-semibold text-gray-700">
                    Custom Name
                    <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </Label>
                  <Input
                      id="custom_url"
                      type="text"
                      placeholder="my-awesome-link"
                      value={createForm.custom_url}
                      onChange={(e) => setCreateForm({ ...createForm, custom_url: e.target.value })}
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-purple-500 transition-colors w-full"
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    Create a memorable, branded link (5+ characters, letters, numbers, _, -)
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 space-y-4 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span>Real-time Analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <QrCode className="w-4 h-4 text-purple-600" />
                    <span>QR Code Generation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    <span>Global CDN</span>
                  </div>
                </div>

                <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                  ) : (
                      <>
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Create Short URL
                      </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>


        {/* URLs Management */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-white border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="flex items-center text-2xl text-gray-900">
                  <LinkIcon className="w-6 h-6 mr-3 text-blue-600" />
                  Your Smart Links
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Manage and track all your shortened URLs in one place
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search URLs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredUrls.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LinkIcon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? "No URLs found" : "Create your first smart link!"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? "Try adjusting your search terms or create a new URL above."
                    : "Start by creating a short URL above and unlock powerful analytics for your links."
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => document.getElementById('original_url')?.focus()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First URL
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">Original URL</TableHead>
                        <TableHead className="font-semibold text-gray-700">Short URL</TableHead>
                        <TableHead className="font-semibold text-gray-700">Performance</TableHead>
                        <TableHead className="font-semibold text-gray-700">Created</TableHead>
                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUrls.map((url) => (
                        <TableRow key={url.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="max-w-xs">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 truncate max-w-xs" title={url.original_url}>
                                  {url.original_url}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new URL(url.original_url).hostname}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg">
                                {url.shorten_url || "error occurred"}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(`${API_BASE_URL}/${url.shorten_url}` || "error occurred")}
                                className="hover:bg-blue-100 hover:text-blue-600"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Badge 
                                variant="secondary" 
                                className={`${
                                  url.view_count > 100 ? 'bg-green-100 text-green-700' :
                                  url.view_count > 10 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                {url.view_count || 0} clicks
                              </Badge>
                              {url.view_count > 50 && (
                                <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Hot
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {url.created_at ? new Date(url.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : "N/A"}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleKeyInsights(url.shorten_url)}
                                title="View Analytics"
                                className="hover:bg-blue-100 hover:text-blue-600"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => generateQRCode(url.shorten_url)}
                                title="Generate QR Code"
                                className="hover:bg-purple-100 hover:text-purple-600"
                              >
                                <QrCode className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(`${API_BASE_URL}/${url.shorten_url}`, '_blank')}
                                title="Open Link"
                                className="hover:bg-green-100 hover:text-green-600"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUrl(url.id)}
                                title="Delete URL"
                                className="hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Enhanced Pagination */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-medium">{filteredUrls.length}</span> of{" "}
                      <span className="font-medium">{urls.length}</span> URLs
                    </div>
                    {selectedUrls.length > 0 && (
                      <Badge variant="secondary">
                        {selectedUrls.length} selected
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">Page</span>
                      <Badge variant="outline" className="px-3 py-1">
                        {currentPage}
                      </Badge>
                      <span className="text-sm text-gray-600">of {totalPages}</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}