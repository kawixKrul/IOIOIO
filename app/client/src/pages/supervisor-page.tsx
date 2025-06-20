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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import { studentApi, supervisorApi } from "@/api/requests"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { AddTopicDialog } from "@/components/AddTopicDialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import React from "react"

export default function SupervisorPage() {
    const [activeTab, setActiveTab] = useState("other-topics")
    const { user } = useAuth();
    console.log(user)
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

    const topicsQuery = useQuery({
        queryKey: ["thesisTopics"],
        queryFn: () => studentApi.getTopics(),
    })

    const supervisorTopicsQuery = useQuery({
        queryKey: ["supervisorTopics"],
        queryFn: () => supervisorApi.getSupervisorTopics(),
    })

    const supervisorApplicationsQuery = useQuery({
        queryKey: ["supervisorApplications"],
        queryFn: () => supervisorApi.getSupervisorApplications(),
    })
    const SupervisorMyTopicsTab = () => {
        const { data: topics, isSuccess: topicsSuccess, isError: topicsError, error: topicsErrorInfo, isPending: topicsLoading } = supervisorTopicsQuery;
        const { data: applications, isSuccess: applicationsSuccess } = supervisorApplicationsQuery;

        return (
            <TabsContent value={"my-topics"}>
                {topicsLoading && <p>Loading topics...</p>}
                {topicsError && <p className="text-red-500">Error: {topicsErrorInfo.message}</p>}
                {topicsSuccess && topics.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8">
                        <p className="text-lg text-muted-foreground mb-4">You have not submitted any topics yet.</p>
                        <AddTopicDialog />
                    </div>
                )}
                {topicsSuccess && topics.length > 0 && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <AddTopicDialog />
                        </div>
                        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {topics.map((topic) => {
                                const waitingApplicationsCount = applicationsSuccess && Array.isArray(applications) ?
                                    applications.filter(app => app.topicId === topic.id && app.status === 0).length : 0;
                                return (
                                    <Card key={topic.id}>
                                        <CardHeader>
                                            <CardTitle>{topic.title}</CardTitle>
                                            <CardDescription>
                                                Degree: {topic.degreeLevel} - Slots: {topic.availableSlots}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                {topic.description.substring(0, 150)}{topic.description.length > 150 ? "..." : ""}
                                            </p>
                                            {waitingApplicationsCount === 1 && (
                                                <div className="mt-2">
                                                    <h4 className="text-xs font-semibold" style={{ color: "red" }}>
                                                        There is 1 pending application, waiting for your review.
                                                    </h4>
                                                </div>
                                            )}
                                            {waitingApplicationsCount > 1 && (
                                                <div className="mt-2">
                                                    <h4 className="text-xs font-semibold" style={{ color: "red" }}>
                                                        There are {waitingApplicationsCount} pending applications, waiting for your review.
                                                    </h4>
                                                </div>
                                            )}
                                            {topic.availableSlots === 0 && (
                                                <div className="mt-2">
                                                    <h4 className="text-xs font-semibold" style={{ color: "green" }}>
                                                        There are no available left slots for this topic!
                                                    </h4>
                                                </div>
                                            )}
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
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </TabsContent>
        );
    };
    
   const SupervisorOtherTopicsTab = () => {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedDegree, setSelectedDegree] = React.useState<"bsc" | "msc" | "">("")
    const [isSearching, setIsSearching] = React.useState(false)

    // Fetch supervisor's applications to get their own topics
    const supervisorApplicationsQuery = useQuery({
        queryKey: ["supervisorApplications"],
        queryFn: () => supervisorApi.getSupervisorApplications(),
    })

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim().length > 0) {
            setIsSearching(true)
        }
    }

    const searchQuery_data = useQuery({
        queryKey: ["searchTopics", searchQuery, selectedDegree],
        queryFn: () => studentApi.searchTopics(searchQuery, selectedDegree || undefined),
        enabled: isSearching && searchQuery.trim().length > 0,
    })
    
    const handleClearSearch = () => {
        setSearchQuery("")
        setSelectedDegree("")
        setIsSearching(false)
    }

    // Get IDs of topics that belong to this supervisor
    const supervisorTopicIds = React.useMemo(() => {
        return supervisorTopicsQuery.data?.map(topic => topic.id) || []
    }, [supervisorApplicationsQuery.data])

    // Filter out supervisor's own topics
    const currentTopicsData = isSearching ? searchQuery_data : topicsQuery
    const displayTopics = (currentTopicsData.data || []).filter(topic => 
        !supervisorTopicIds.includes(topic.id)
    )

        return (
            <TabsContent value="other-topics">
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
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
        )
    }

    const SupervisorApplicationsTab = () => {
    const queryClient = useQueryClient();
    const { data: applications, isPending, isError, error, isSuccess } = supervisorApplicationsQuery;

    const confirmMutation = useMutation({
        mutationFn: (applicationId: number) => 
            supervisorApi.confirm_application(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["supervisorApplications"] });
            alert("Application confirmed successfully!");
        },
        onError: (error: Error) => {
            alert(`Error: ${error.message}`);
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (applicationId: number) => 
            supervisorApi.reject_application(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["supervisorApplications"] });
            alert("Application rejected successfully!");
        },
        onError: (error: Error) => {
            alert(`Error: ${error.message}`);
        }
    });

    const handleConfirm = (applicationId: number) => {
        if (confirm("Are you sure you want to confirm this application?")) {
            confirmMutation.mutate(applicationId);
        }
    };

    const handleReject = (applicationId: number) => {
        if (confirm("Are you sure you want to reject this application?")) {
            rejectMutation.mutate(applicationId);
        }
    };

    return (
        <TabsContent value="applications">
            {isPending && <p>Loading your applications...</p>}
            {isError && (
                <p className="text-red-500">Error: {error.message}</p>
            )}
            {isSuccess && applications.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8">
                    <p className="text-lg text-muted-foreground mb-4">No one applied for your topics yet.</p>
                </div>
            )}
            {isSuccess && applications.length > 0 && (
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    {applications.map((application) => (
                        <Card key={application.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{application.topicTitle}</CardTitle>
                                    {renderApplicationStatus(application.status)}
                                </div>
                                <CardDescription>
                                    Student: {application.student.name} {application.student.surname}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <h4 className="text-xs font-semibold mb-1">Student's application message:</h4>
                                <p className="text-sm text-muted-foreground">
                                    {application.description || "No message provided"}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                    Application ID: {application.id}
                                </p>
                                {application.status === 0 && ( // Only show buttons for pending applications
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleConfirm(application.id)}
                                            disabled={confirmMutation.isPending || rejectMutation.isPending}
                                        >
                                            {confirmMutation.isPending ? "Confirming..." : "Confirm"}
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => handleReject(application.id)}
                                            disabled={confirmMutation.isPending || rejectMutation.isPending}
                                        >
                                            {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                                        </Button>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </TabsContent>
    );
};

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
                                        Supervisor Panel 
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {activeTab === "other-topics"
                                            ? "All Available Topics"
                                            : activeTab === "my-topics"
                                            ? "My Available Topics"
                                            : "Applications submitted for my Topics"}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Tabs defaultValue="my-topics" onValueChange={setActiveTab}>
                        <TabsList className="flex w-full mb-4">
                            <TabsTrigger className="flex-1" value="my-topics">My Topics</TabsTrigger>
                            <TabsTrigger className="flex-1" value="applications">Applications</TabsTrigger>
                                <TabsTrigger className="flex-1" value="other-topics">Other Topics</TabsTrigger>
                        </TabsList>
                        <SupervisorMyTopicsTab></SupervisorMyTopicsTab>
                        <SupervisorApplicationsTab></SupervisorApplicationsTab>
                        <SupervisorOtherTopicsTab></SupervisorOtherTopicsTab>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}