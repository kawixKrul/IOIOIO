import type { ThesisTopic, ApplyTopicRequest } from '../api/types'
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { studentApi } from "@/api/requests"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"


export default function UserPage() {
    const queryClient = useQueryClient()
    const [selectedTopic, setSelectedTopic] = useState<ThesisTopic | null>(null)
    const [applicationMessage, setApplicationMessage] = useState("")
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("available-topics")
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDegree, setSelectedDegree] = useState<'bsc' | 'msc' | ''>("")
    const [isSearching, setIsSearching] = useState(false)

    const topicsQuery = useQuery({
        queryKey: ["thesisTopics"],
        queryFn: () => studentApi.getTopics(),
        enabled: !isSearching, // Only fetch all topics when not searching
    })

    // Search query
    const searchQuery_data = useQuery({
        queryKey: ["searchTopics", searchQuery, selectedDegree],
        queryFn: () => studentApi.searchTopics(searchQuery, selectedDegree || undefined),
        enabled: isSearching && searchQuery.trim().length > 0,
    })    
    const applicationsQuery = useQuery({
        queryKey: ["studentApplications"],
        queryFn: () => studentApi.getApplications(), // Mock empty array until backend is implemented
        enabled: true, 
    })

    // Apply for a topic mutation
    const applyMutation = useMutation({
        mutationFn: (payload: ApplyTopicRequest) =>
            studentApi.applyForTopic(payload.topicId, payload.description),
        onSuccess: () => {
            alert("Application submitted successfully! The supervisor has been notified.")
            setIsApplyDialogOpen(false)
            setSelectedTopic(null)
            queryClient.invalidateQueries({ queryKey: ["thesisTopics"] })
            queryClient.invalidateQueries({ queryKey: ["studentApplications"] })
        },
        onError: (error: Error) => {
            alert(`Error: ${error.message}`)
        },
    })

    const handleApplyClick = (topic: ThesisTopic) => {
        setSelectedTopic(topic)
        setApplicationMessage("")
        setIsApplyDialogOpen(true)
    }

    const handleApplicationSubmit = () => {
        if (!selectedTopic) return

        const payload: ApplyTopicRequest = {
            topicId: selectedTopic.id,
            description: applicationMessage,
        }

        applyMutation.mutate(payload)
    }

    // Search handlers
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim().length > 0) {
            setIsSearching(true)
        }
    }

    const handleClearSearch = () => {
        setSearchQuery("")
        setSelectedDegree("")
        setIsSearching(false)
    }

    const currentTopicsData = isSearching ? searchQuery_data : topicsQuery
    const displayTopics = currentTopicsData.data || []

    // Helper function to render application status
    const renderApplicationStatus = (status: number) => {
        switch (status) {
            case 0:
                return <Badge variant="outline" className="bg-yellow-100">Pending</Badge>
            case 1:
                return <Badge variant="outline" className="bg-green-100">Accepted</Badge>
            case 2:
                return <Badge variant="outline" className="bg-red-100">Rejected</Badge>
            case 3:
                return <Badge variant="outline" className="bg-grey-100">Withdrawn</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Student Panel
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {activeTab === "available-topics" ? "Available Thesis Topics" : "My Applications"}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Tabs defaultValue="available-topics" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="available-topics">Available Topics</TabsTrigger>
                            <TabsTrigger value="my-applications">My Applications</TabsTrigger>
                        </TabsList>                        <TabsContent value="available-topics">
                            {/* Search Bar */}
                            <div className="mb-6 space-y-4">
                                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Search topics (e.g., machine learning, AI, web development)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1"
                                    />
                                    <select
                                        value={selectedDegree}
                                        onChange={(e) => setSelectedDegree(e.target.value as 'bsc' | 'msc' | '')}
                                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                                    >
                                        <option value="">All Degrees</option>
                                        <option value="bsc">BSc</option>
                                        <option value="msc">MSc</option>
                                    </select>
                                    <Button type="submit" disabled={!searchQuery.trim()}>
                                        Search
                                    </Button>
                                    {isSearching && (
                                        <Button type="button" variant="outline" onClick={handleClearSearch}>
                                            Clear
                                        </Button>
                                    )}
                                </form>
                                {isSearching && (
                                    <div className="text-sm text-muted-foreground">
                                        Searching for: "{searchQuery}" {selectedDegree && `(${selectedDegree.toUpperCase()})`}
                                    </div>
                                )}
                            </div>

                            {/* Results */}
                            {currentTopicsData.isPending && <p>Loading topics...</p>}
                            {currentTopicsData.isError && (
                                <p className="text-red-500">Error: {currentTopicsData.error.message}</p>
                            )}
                            {currentTopicsData.isSuccess && displayTopics.length === 0 && (
                                <p>{isSearching ? "No topics found matching your search." : "No topics available at the moment."}</p>
                            )}
                            {currentTopicsData.isSuccess && displayTopics.length > 0 && (
                                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {displayTopics.map((topic) => (
                                        <Card key={topic.id}>
                                            <CardHeader>
                                                <CardTitle>{topic.title}</CardTitle>
                                                <CardDescription>
                                                    Degree: {topic.degreeLevel} - Slots:{" "}
                                                    {topic.availableSlots}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">
                                                    {topic.description.substring(0, 150)}
                                                    {topic.description.length > 150
                                                        ? "..."
                                                        : ""}
                                                </p>
                                                <div className="mt-2">
                                                    <h4 className="text-xs font-semibold">
                                                        Promoter:
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {topic.promoter.name}{" "}
                                                        {topic.promoter.surname} (
                                                        {topic.promoter.expertiseField})
                                                    </p>
                                                </div>
                                                {topic.tags && topic.tags.length > 0 && (
                                                    <div className="mt-2">
                                                        <h4 className="text-xs font-semibold">
                                                            Tags:
                                                        </h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {topic.tags.map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter>
                                                <Button
                                                    onClick={() => handleApplyClick(topic)}
                                                    disabled={
                                                        topic.availableSlots <= 0 ||
                                                        applyMutation.isPending
                                                    }
                                                >
                                                    {topic.availableSlots > 0
                                                        ? "Apply"
                                                        : "No Slots"}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="my-applications">
                            {applicationsQuery.isPending && <p>Loading your applications...</p>}
                            {applicationsQuery.isError && (
                                <p className="text-red-500">Error: {applicationsQuery.error.message}</p>
                            )}
                            {applicationsQuery.isSuccess && applicationsQuery.data.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-8">
                                    <p className="text-lg text-muted-foreground mb-4">You haven't applied to any topics yet.</p>
                                    <Button onClick={() => setActiveTab("available-topics")}>
                                        Browse Available Topics
                                    </Button>
                                </div>
                            )}
                            {applicationsQuery.isSuccess && applicationsQuery.data.length > 0 && (
                                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                                    {applicationsQuery.data.map((application) => (
                                        <Card key={application.id}>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <CardTitle>{application.topicTitle}</CardTitle>
                                                    {renderApplicationStatus(application.status)}
                                                </div>
                                                <CardDescription>
                                                    Promoter: {application.promoter.name} {application.promoter.surname}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <h4 className="text-xs font-semibold mb-1">Your application message:</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {application.description || "No message provided"}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="flex justify-between">
                                                <p className="text-xs text-muted-foreground">
                                                    Application ID: {application.id}
                                                </p>
                                                {application.status === 1 && (
                                                    <Badge className="bg-green-100">Congratulations!</Badge>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </SidebarInset>

            {selectedTopic && (
                <Dialog
                    open={isApplyDialogOpen}
                    onOpenChange={setIsApplyDialogOpen}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                Apply for: {selectedTopic.title}
                            </DialogTitle>
                            <DialogDescription>
                                Promoter: {selectedTopic.promoter.name}{" "}
                                {selectedTopic.promoter.surname}
                                <br />
                                Slots: {selectedTopic.availableSlots} | Degree:{" "}
                                {selectedTopic.degreeLevel}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="message" className="text-right">
                                    Message
                                </Label>
                                <Textarea
                                    id="message"
                                    value={applicationMessage}
                                    onChange={(e) =>
                                        setApplicationMessage(e.target.value)
                                    }
                                    className="col-span-3"
                                    placeholder="Write a brief message to the promoter (optional)"
                                    disabled={applyMutation.isPending}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsApplyDialogOpen(false)}
                                disabled={applyMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleApplicationSubmit}
                                disabled={applyMutation.isPending}
                            >
                                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </SidebarProvider>
    )
}