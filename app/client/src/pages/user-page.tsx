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
import { makeRequest } from "@/api/requests"

interface PromoterInfo {
    id: number
    name: string
    surname: string
    expertiseField: string
}

interface ThesisTopic {
    id: number
    title: string
    description: string
    degreeLevel: string
    availableSlots: number
    tags: string[]
    promoter: PromoterInfo
}

interface ApplyTopicRequest {
    topicId: number
    description: string
}

export default function UserPage() {
    const queryClient = useQueryClient()
    const [selectedTopic, setSelectedTopic] = useState<ThesisTopic | null>(null)
    const [applicationMessage, setApplicationMessage] = useState("")
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)

    // Fetch thesis topics
    const topicsQuery = useQuery({
        queryKey: ["thesisTopics"],
        queryFn: () =>
            (makeRequest("/api/student/topics", "GET") as Promise<ThesisTopic[]>),
    })

    // Apply for a topic mutation
    const applyMutation = useMutation({
        mutationFn: (payload: ApplyTopicRequest) =>
            makeRequest("/api/student/apply", "POST", payload),
        onSuccess: () => {
            alert("Application submitted successfully! The supervisor has been notified.")
            setIsApplyDialogOpen(false)
            setSelectedTopic(null)
            // Invalidate the topics query to refetch if necessary
            queryClient.invalidateQueries({ queryKey: ["thesisTopics"] })
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
                                        Available Thesis Topics
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {topicsQuery.isPending && <p>Loading topics...</p>}
                    {topicsQuery.isError && (
                        <p className="text-red-500">Error: {topicsQuery.error.message}</p>
                    )}
                    {topicsQuery.isSuccess && topicsQuery.data.length === 0 && (
                        <p>No topics available at the moment.</p>
                    )}
                    {topicsQuery.isSuccess && topicsQuery.data.length > 0 && (
                        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {topicsQuery.data.map((topic) => (
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
                                            disabled={topic.availableSlots <= 0 || applyMutation.isPending}
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