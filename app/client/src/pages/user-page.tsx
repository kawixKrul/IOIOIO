import type { ThesisTopic, ApplyTopicRequest, ApplicationsResponse } from '../api/types'
import * as React from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { studentApi } from "@/api/requests"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function UserPage() {
    const [activeTab, setActiveTab] = useState("available-topics")
    const [selectedTopic, setSelectedTopic] = useState<ThesisTopic | null>(null)
    const [applicationMessage, setApplicationMessage] = useState("")
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
    
    
    const queryClient = useQueryClient()

    const topicsQuery = useQuery({
        queryKey: ["thesisTopics"],
        queryFn: () => studentApi.getTopics(),
    })

    const applicationsQuery = useQuery({
        queryKey: ["studentApplications"],
        queryFn: () => studentApi.getApplications(),
    })

    const applyMutation = useMutation({
        mutationFn: (payload: ApplyTopicRequest) =>
            studentApi.applyForTopic(payload.topicId, payload.description),
        onSuccess: () => {
            alert("Application submitted successfully!")
            setIsApplyDialogOpen(false)
            setSelectedTopic(null)
            queryClient.invalidateQueries({ queryKey: ["thesisTopics"] })
            queryClient.invalidateQueries({ queryKey: ["studentApplications"] })
        },
        onError: (error: Error) => {
            alert(`Error: ${error.message}`)
        },
    })

    const handleApplicationSubmit = () => {
        if (!selectedTopic) return
        applyMutation.mutate({
            topicId: selectedTopic.id,
            description: applicationMessage,
        })
    }

    const renderApplicationStatus = (status: number) => {
        switch (status) {
            case 0: return <Badge variant="outline" className="bg-yellow-100">Pending</Badge>
            case 1: return <Badge variant="outline" className="bg-green-100">Accepted</Badge>
            case 2: return <Badge variant="outline" className="bg-red-100">Rejected</Badge>
            case 3: return <Badge variant="outline" className="bg-grey-100">Withdrawn</Badge>
            default: return <Badge variant="outline">Unknown</Badge>
        }
    }

    const StudentAvailableTopicsTab = () => {
        const [searchQuery, setSearchQuery] = useState("")
        const [selectedDegree, setSelectedDegree] = useState<'bsc' | 'msc' | ''>("")
        const filteredTopics = React.useMemo(() => {
            if (!topicsQuery.data) return []
            
            const appliedTopicIds = applicationsQuery.data?.map(app => app.topicId) || []
            
            return topicsQuery.data.filter(topic => {
                if (appliedTopicIds.includes(topic.id)) return false
                
                const matchesSearch = searchQuery.trim() === "" || 
                    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (topic.tags && topic.tags.some(tag => 
                        tag.toLowerCase().includes(searchQuery.toLowerCase())))
                
                const matchesDegree = !selectedDegree || 
                    topic.degreeLevel.toLowerCase() === selectedDegree
                
                return matchesSearch && matchesDegree
            })
        }, [topicsQuery.data, applicationsQuery.data, searchQuery, selectedDegree])

        return (
            <TabsContent value="available-topics">
                <div className="mb-6 space-y-4">
                    <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Search topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                        <select
                            value={selectedDegree}
                            onChange={(e) => setSelectedDegree(e.target.value as 'bsc' | 'msc' | '')}
                            className="px-3 py-2 border rounded-md text-sm"
                        >
                            <option value="">All Degrees</option>
                            <option value="bsc">BSc</option>
                            <option value="msc">MSc</option>
                        </select>
                        {(searchQuery || selectedDegree) && (
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    setSearchQuery("")
                                    setSelectedDegree("")
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </form>
                    {(searchQuery || selectedDegree) && (
                        <div className="text-sm text-muted-foreground">
                            {searchQuery && `Searching for: "${searchQuery}"`}
                            {selectedDegree && ` (${selectedDegree.toUpperCase()})`}
                        </div>
                    )}
                </div>

                {topicsQuery.isPending && <p>Loading topics...</p>}
                {topicsQuery.isError && (
                    <p className="text-red-500">Error: {topicsQuery.error.message}</p>
                )}
                {topicsQuery.isSuccess && filteredTopics.length === 0 && (
                    <p>{(searchQuery || selectedDegree) 
                        ? "No topics match your search" 
                        : "No topics available"}
                    </p>
                )}
                {topicsQuery.isSuccess && filteredTopics.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTopics.map((topic) => (
                            <Card key={topic.id}>
                                <CardHeader>
                                    <CardTitle>{topic.title}</CardTitle>
                                    <CardDescription>
                                        Degree: {topic.degreeLevel} - Slots: {topic.availableSlots}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {topic.description.substring(0, 150)}
                                        {topic.description.length > 150 ? "..." : ""}
                                    </p>
                                    <div className="mt-2">
                                        <h4 className="text-xs font-semibold">Promoter:</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {topic.promoter.name} {topic.promoter.surname} ({topic.promoter.expertiseField})
                                        </p>
                                    </div>
                                    {topic.tags && topic.tags.length > 0 && (
                                        <div className="mt-2">
                                            <h4 className="text-xs font-semibold">Tags:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {topic.tags.map((tag, index) => (
                                                    <span key={index} className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={() => {
                                            setSelectedTopic(topic)
                                            setIsApplyDialogOpen(true)
                                        }}
                                        disabled={topic.availableSlots <= 0 || applyMutation.isPending}
                                    >
                                        {topic.availableSlots > 0 ? "Apply" : "No Slots"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
        )
    }

const StudentApplicationsTab = () => {
    const queryClient = useQueryClient();
    
    const withdrawMutation = useMutation({
        mutationFn: (applicationId: number) => 
            studentApi.withdraw_application(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studentApplications"] });
            queryClient.invalidateQueries({ queryKey: ["thesisTopics"] });
            alert("Application withdrawn successfully!");
        },
        onError: (error: Error) => {
            alert(`Error: ${error.message}`);
        }
    });

    const handleWithdraw = (applicationId: number) => {
        if (confirm("Are you sure you want to withdraw this application?")) {
            withdrawMutation.mutate(applicationId);
        }
    };

    return (
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
                            <CardFooter className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                    Application ID: {application.id}
                                </p>
                                <div className="flex gap-2">
                                    {application.status === 1 && (
                                        <Badge className="bg-green-100">Congratulations!</Badge>
                                    )}
                                    {application.status === 0 && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleWithdraw(application.id)}
                                            disabled={withdrawMutation.isPending}
                                        >
                                            {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw"}
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </TabsContent>
    )
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
                                    <BreadcrumbLink href="#">Student Panel</BreadcrumbLink>
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
                        </TabsList>                        
                        <StudentAvailableTopicsTab />
                        <StudentApplicationsTab />
                    </Tabs>
                </div>
            </SidebarInset>

            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Apply for: {selectedTopic?.title}</DialogTitle>
                        <DialogDescription>
                            Promoter: {selectedTopic?.promoter.name} {selectedTopic?.promoter.surname}
                            <br />
                            Slots: {selectedTopic?.availableSlots} | Degree: {selectedTopic?.degreeLevel}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="message" className="text-right">Message</Label>
                            <Textarea
                                id="message"
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
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
        </SidebarProvider>
    )
}