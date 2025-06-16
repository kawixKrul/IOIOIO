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
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useQuery} from "@tanstack/react-query"
import { studentApi, supervisorApi } from "@/api/requests"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { AddTopicDialog } from "@/components/AddTopicDialog"

export default function SupervisorPage() {
    const [activeTab, setActiveTab] = useState("other-topics")
    const { user } = useAuth();
    console.log(user)
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

    // New interface for student applications
    interface StudentApplication {
        id: number
        topicId: number
        topicTitle: string
        description: string
        status: number // 0: pending, 1: accepted, 2: rejected
        promoterName: string
        promoterSurname: string
    }
    const handleAddTopic = async () => {

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
        queryFn: () => supervisorApi.getSupervisorApplications,
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
                                        )
                                        }
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
                )}
            </TabsContent>
        );
    };
    
    const SupervisorOtherTopicsTab = () => {
        return (
            <TabsContent value="other-topics">
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
                        <SupervisorOtherTopicsTab></SupervisorOtherTopicsTab>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}