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
import { studentApi } from "@/api/requests"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function SupervisorPage() {
    const [activeTab, setActiveTab] = useState("other-topics")

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

    const topicsQuery = useQuery({
        queryKey: ["thesisTopics"],
        queryFn: () => studentApi.getTopics(),
    })
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
                    <Tabs defaultValue="other-topics" onValueChange={setActiveTab}>
                        <TabsList className="flex w-full mb-4">
                            <TabsTrigger className="flex-1" value="my-topics">My Topics</TabsTrigger>
                            <TabsTrigger className="flex-1" value="applications">Applications</TabsTrigger>
                                <TabsTrigger className="flex-1" value="other-topics">Other Topics</TabsTrigger>
                        </TabsList>
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
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}