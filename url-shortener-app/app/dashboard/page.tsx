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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { LinkIcon, Copy, Edit, Trash2, BarChart3, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import {API_BASE_URL} from "@/lib/api";
interface UrlItem {
  id: number
  original_url: string
  short_url: string
  custom_name?: string
  created_at: string
  clicks: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [urls, setUrls] = useState<UrlItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [createForm, setCreateForm] = useState({
    original_url: "",
    custom_url: "",
  })
  const [editingUrl, setEditingUrl] = useState<UrlItem | null>(null)
  const [newName, setNewName] = useState("")
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
      // Calculate total pages based on response (assuming API doesn't return total count)
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

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await urlAPI.createUrl(createForm.original_url, createForm.custom_url || undefined)

      toast({
        title: "URL created!",
        description: "Your short URL has been created successfully.",
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

  const handleUpdateUrl = async () => {
    if (!editingUrl || !newName.trim()) return

    try {
      const response = await urlAPI.updateUrl(editingUrl.id, newName)
      const updatedShortUrl = response.data?.new_name || newName;
      setUrls((prevUrls) =>
        prevUrls.map((url) =>
          url.id === editingUrl.id ? { ...url, shorten_url: updatedShortUrl } : url
        )
      );
      toast({
        title: "URL updated!",
        description: "Your URL has been updated successfully.",
      })
      setEditingUrl(null)
      setNewName("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update URL",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUrl = async (id: number) => {
    if (!confirm("Are you sure you want to delete this URL?")) return

    try {
      const response = await urlAPI.deleteUrl(id)
      // Only remove from state if delete was successful (status 200)
      if (response.status === 204) {
        setUrls((prevUrls) => prevUrls.filter((url) => url.id !== id))
        toast({
          title: "URL deleted!",
          description: "Your URL has been deleted successfully.",
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
      title: "Copied!",
      description: "URL copied to clipboard",
    })
  }

  const handleKeyInsights = async (id: number) => {
    try {
      const response = await urlAPI.getKeyInsights(id)
      // For now, just show a toast. In a real app, you'd open a modal with insights
      toast({
        title: "Key Insights",
        description: "Insights data retrieved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch insights",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  // @ts-ignore
  // @ts-ignore
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SnipSight Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your shortened URLs and view detailed analytics</p>
        </div>

        {/* Create URL Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create Short URL
            </CardTitle>
            <CardDescription>Enter a URL to shorten it. Optionally, provide a custom name.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUrl} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="original_url">Original URL *</Label>
                  <Input
                    id="original_url"
                    type="url"
                    placeholder="https://example.com"
                    value={createForm.original_url}
                    onChange={(e) => setCreateForm({ ...createForm, original_url: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom_url">
                    Custom Name <Badge variant="secondary">Premium</Badge>
                  </Label>
                  <Input
                    id="custom_url"
                    type="text"
                    placeholder="my-custom-link"
                    value={createForm.custom_url}
                    onChange={(e) => setCreateForm({ ...createForm, custom_url: e.target.value })}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isCreating ? "Creating..." : "Create Short URL"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* URLs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="w-5 h-5 mr-2" />
              Your URLs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : urls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No URLs found. Create your first short URL above!</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Original URL</TableHead>
                        <TableHead>Short URL</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {urls.map((url) => (
                        <TableRow key={url.id}>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={url.original_url}>
                              {url.original_url}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm">{url.shorten_url || `error occured`}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(`${API_BASE_URL}/${url.shorten_url}` || `error occured`)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{url.view_count || 0}</Badge>
                          </TableCell>
                          <TableCell>
                            {url.created_at ? new Date(url.created_at).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleKeyInsights(url.id)}
                                title="View Insights"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </Button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingUrl(url)
                                      setNewName(url.custom_name || "")
                                    }}
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit URL</DialogTitle>
                                    <DialogDescription>Update the custom name for this URL</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="new_name">Custom Name</Label>
                                      <Input
                                        id="new_name"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Enter new custom name"
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" onClick={() => setEditingUrl(null)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleUpdateUrl}>Update</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUrl(url.id)}
                                title="Delete"
                                className="text-red-600 hover:text-red-700"
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

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
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
