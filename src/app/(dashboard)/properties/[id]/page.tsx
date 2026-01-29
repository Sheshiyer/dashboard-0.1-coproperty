import { notFound } from "next/navigation"
import { getProperty, Reservation, Task } from "@/lib/data/properties"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Edit, CalendarDays, CheckCircle2, ClipboardCheck, Home, MapPin, Sparkles } from "lucide-react"
import Link from "next/link"

interface Props {
    params: {
        id: string
    }
}

export default async function PropertyDetailPage({ params }: Props) {
    const property = await getProperty(params.id)

    if (!property) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/properties">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">{property.building_name}</h1>
                    <p className="text-muted-foreground">{property.address || property.room_number}</p>
                </div>
                <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
            </div>

            {/* Content */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none text-muted-foreground">Type</p>
                                    <div className="flex items-center gap-2">
                                        <Home className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium capitalize">{property.segment?.replace("_", " ") || "Short Term Rental"}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none text-muted-foreground">Address</p>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{property.address || 'N/A'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Reservations</CardTitle>
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{property.reservations?.length || 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Cleaning Jobs</CardTitle>
                                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{property.cleaning_jobs?.length || 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{property.tasks?.filter((t: Task) => t.status !== 'completed').length || 0}</div>
                                </CardContent>
                            </Card>
                            {/* Checklist Score Cards - Removed as data is not available */}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="attributes">
                    <Card>
                        <CardHeader><CardTitle>Attributes</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground text-sm">Property attributes coming soon.</p></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="operations">
                    <Card>
                        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground text-sm">No recent activity.</p></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
