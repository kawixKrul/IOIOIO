"use client"

import * as React from "react"
import {
    GalleryVerticalEnd,
    BookOpen,
    Settings2,
    User,
    Users,
    FileText,
    Shield,
    Database,
    BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

// Application data
const getTeamData = (userRole?: string) => ({
    teams: [
        {
            name: "Dyplom AGH",
            logo: GalleryVerticalEnd,
            plan: userRole === "SUPERVISOR" ? "Supervisor Panel" : 
                  userRole === "ADMIN" ? "Admin Panel" : "Student Platform",
        }
    ]
});

// Role-based navigation
const getNavigationForRole = (userRole?: string) => {
    const baseNavigation = [
        {
            title: "Profile",
            url: "#",
            icon: User,
            items: [
                {
                    title: "View Profile",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
    ];

    switch (userRole?.toLowerCase()) {
        case "student":
            return [
                {
                    title: "Thesis Topics",
                    url: "/user",
                    icon: BookOpen,
                    isActive: true,
                    items: [
                        {
                            title: "Available Topics",
                            url: "/user",
                        },
                        {
                            title: "My Applications",
                            url: "/user",
                        },
                    ],
                },
                ...baseNavigation,
                {
                    title: "Settings",
                    url: "#",
                    icon: Settings2,
                    items: [
                        {
                            title: "General",
                            url: "#",
                        },
                        {
                            title: "Notifications",
                            url: "#",
                        },
                    ],
                },
            ];

        case "supervisor":
            return [
                {
                    title: "My Topics",
                    url: "/overseer",
                    icon: BookOpen,
                    isActive: true,
                    items: [
                        {
                            title: "Manage Topics",
                            url: "/overseer",
                        },
                        {
                            title: "Add New Topic",
                            url: "/overseer",
                        },
                    ],
                },
                {
                    title: "Applications",
                    url: "#",
                    icon: FileText,
                    items: [
                        {
                            title: "Pending Applications",
                            url: "#",
                        },
                        {
                            title: "Approved Applications",
                            url: "#",
                        },
                        {
                            title: "Application History",
                            url: "#",
                        },
                    ],
                },
                {
                    title: "Students",
                    url: "#",
                    icon: Users,
                    items: [
                        {
                            title: "My Students",
                            url: "#",
                        },
                        {
                            title: "Student Progress",
                            url: "#",
                        },
                    ],
                },
                ...baseNavigation,
                {
                    title: "Settings",
                    url: "#",
                    icon: Settings2,
                    items: [
                        {
                            title: "General",
                            url: "#",
                        },
                        {
                            title: "Notifications",
                            url: "#",
                        },
                    ],
                },
            ];

        case "admin":
            return [
                {
                    title: "Dashboard",
                    url: "#",
                    icon: BarChart3,
                    isActive: true,
                    items: [
                        {
                            title: "Overview",
                            url: "#",
                        },
                        {
                            title: "Statistics",
                            url: "#",
                        },
                        {
                            title: "Reports",
                            url: "#",
                        },
                    ],
                },
                {
                    title: "User Management",
                    url: "#",
                    icon: Shield,
                    items: [
                        {
                            title: "All Users",
                            url: "#",
                        },
                        {
                            title: "Students",
                            url: "#",
                        },
                        {
                            title: "Supervisors",
                            url: "#",
                        },
                        {
                            title: "Admins",
                            url: "#",
                        },
                    ],
                },
                {
                    title: "Topics Management",
                    url: "#",
                    icon: Database,
                    items: [
                        {
                            title: "All Topics",
                            url: "#",
                        },
                        {
                            title: "Pending Approval",
                            url: "#",
                        },
                        {
                            title: "Categories",
                            url: "#",
                        },
                    ],
                },
                {
                    title: "System",
                    url: "#",
                    icon: Settings2,
                    items: [
                        {
                            title: "System Settings",
                            url: "#",
                        },
                        {
                            title: "Backup & Restore",
                            url: "#",
                        },
                        {
                            title: "Logs",
                            url: "#",
                        },
                    ],
                },
                ...baseNavigation,
            ];

        default:
            // Guest or unknown role
            return [
                {
                    title: "Welcome",
                    url: "/",
                    icon: BookOpen,
                    isActive: true,
                    items: [
                        {
                            title: "Login",
                            url: "/",
                        },
                    ],
                },
            ];
    }
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, isAuthenticated } = useAuth()
    
    // Get user role, default to empty string if not authenticated
    const userRole = isAuthenticated && user ? user.role : "";
    
    // Get role-specific data
    const teamData = getTeamData(userRole);
    const navigationData = getNavigationForRole(userRole);
    
    // Create user data for the sidebar
    const userData = isAuthenticated && user ? {
        name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.email,
        email: user.email,
        avatar: "/avatars/default.jpg",
    } : {
        name: "Guest User",
        email: "guest@example.com",
        avatar: "/avatars/default.jpg",
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={teamData.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navigationData} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
