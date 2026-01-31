/**
 * Component Library Examples
 *
 * This file demonstrates all UI components with their variants,
 * including the new glass morphism effects integrated with our design system.
 *
 * Design System:
 * - Primary Color: #0F766E (Teal 700)
 * - Secondary Color: #14B8A6 (Teal 500)
 * - CTA Color: #0369A1 (Sky 700)
 * - Typography: Poppins (headings), Open Sans (body)
 * - Glass effects: Backdrop blur with transparent backgrounds
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Home, Search, Settings, Bell, Download, Upload } from "lucide-react"

export function ComponentLibraryExamples() {
    const [loading, setLoading] = React.useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-property-bg to-white dark:from-gray-950 dark:to-gray-900 p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="font-heading text-4xl font-bold text-property-text dark:text-white">
                        UI Component Library
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Professional components with glass morphism effects and design system integration
                    </p>
                </div>

                {/* Button Examples */}
                <section className="space-y-6">
                    <div>
                        <h2 className="font-heading text-2xl font-semibold mb-2">Buttons</h2>
                        <p className="text-muted-foreground text-sm">
                            All button variants with sizes and states
                        </p>
                    </div>

                    {/* Button Variants */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Button Variants</CardTitle>
                            <CardDescription>Different styles for various use cases</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button variant="default">Default Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                            <Button variant="glass">Glass Effect</Button>
                        </CardContent>
                    </Card>

                    {/* Button Sizes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Button Sizes</CardTitle>
                            <CardDescription>Small, medium, and large sizes</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-4">
                            <Button size="sm" variant="default">Small</Button>
                            <Button size="default" variant="default">Default</Button>
                            <Button size="lg" variant="default">Large</Button>
                            <Button size="icon" variant="default">
                                <Home className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Button States */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Button States</CardTitle>
                            <CardDescription>Loading and disabled states</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button
                                variant="default"
                                loading={loading}
                                onClick={() => {
                                    setLoading(true)
                                    setTimeout(() => setLoading(false), 2000)
                                }}
                            >
                                {loading ? "Loading..." : "Click to Load"}
                            </Button>
                            <Button variant="default" disabled>
                                Disabled
                            </Button>
                            <Button variant="glass" loading>
                                Glass Loading
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Button with Icons */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Buttons with Icons</CardTitle>
                            <CardDescription>Combining text with icons</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button variant="default">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                            <Button variant="secondary">
                                <Upload className="h-4 w-4" />
                                Upload
                            </Button>
                            <Button variant="glass">
                                <Search className="h-4 w-4" />
                                Search
                            </Button>
                            <Button variant="outline">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                {/* Card Examples */}
                <section className="space-y-6">
                    <div>
                        <h2 className="font-heading text-2xl font-semibold mb-2">Cards</h2>
                        <p className="text-muted-foreground text-sm">
                            Container components with default and glass variants
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Default Card */}
                        <Card variant="default">
                            <CardHeader>
                                <CardTitle>Default Card</CardTitle>
                                <CardDescription>
                                    Standard card with solid background
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    This is a default card with a solid background and border.
                                    Perfect for primary content areas and data displays.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="default" size="sm">Learn More</Button>
                            </CardFooter>
                        </Card>

                        {/* Glass Card */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Glass Card</CardTitle>
                                <CardDescription>
                                    Beautiful glass morphism effect
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    This glass card features backdrop blur and transparency.
                                    Ideal for overlays and modern UI elements.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="glass" size="sm">Explore</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                {/* Badge Examples */}
                <section className="space-y-6">
                    <div>
                        <h2 className="font-heading text-2xl font-semibold mb-2">Badges</h2>
                        <p className="text-muted-foreground text-sm">
                            Small status indicators with semantic colors
                        </p>
                    </div>

                    {/* Badge Variants */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Badge Variants</CardTitle>
                            <CardDescription>Different colors for various statuses</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Badge variant="default">Default</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="success">Success</Badge>
                            <Badge variant="warning">Warning</Badge>
                            <Badge variant="error">Error</Badge>
                            <Badge variant="destructive">Destructive</Badge>
                            <Badge variant="outline">Outline</Badge>
                            <Badge variant="glass">Glass</Badge>
                        </CardContent>
                    </Card>

                    {/* Badge Sizes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Badge Sizes</CardTitle>
                            <CardDescription>Small, medium, and large badges</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-3">
                            <Badge variant="default" size="sm">Small</Badge>
                            <Badge variant="default" size="md">Medium</Badge>
                            <Badge variant="default" size="lg">Large</Badge>
                        </CardContent>
                    </Card>

                    {/* Badge Use Cases */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Badge Use Cases</CardTitle>
                            <CardDescription>Real-world badge applications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Property Status:</span>
                                <Badge variant="success" size="sm">Active</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Payment Status:</span>
                                <Badge variant="warning" size="sm">Pending</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Maintenance:</span>
                                <Badge variant="error" size="sm">Overdue</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Notification:</span>
                                <Badge variant="glass" size="sm">
                                    <Bell className="h-3 w-3 mr-1" />
                                    New
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Input Examples */}
                <section className="space-y-6">
                    <div>
                        <h2 className="font-heading text-2xl font-semibold mb-2">Inputs</h2>
                        <p className="text-muted-foreground text-sm">
                            Form inputs with default and glass variants
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Default Inputs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Default Inputs</CardTitle>
                                <CardDescription>Standard input fields</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        variant="default"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter password"
                                        variant="default"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="error-input">With Error</Label>
                                    <Input
                                        id="error-input"
                                        type="text"
                                        placeholder="Invalid input"
                                        variant="default"
                                        error={true}
                                    />
                                    <p className="text-xs text-error-500">This field is required</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Glass Inputs */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Glass Inputs</CardTitle>
                                <CardDescription>Inputs with glass effect</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="glass-email">Email</Label>
                                    <Input
                                        id="glass-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        variant="glass"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="glass-password">Password</Label>
                                    <Input
                                        id="glass-password"
                                        type="password"
                                        placeholder="Enter password"
                                        variant="glass"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="glass-search">Search</Label>
                                    <Input
                                        id="glass-search"
                                        type="search"
                                        placeholder="Search properties..."
                                        variant="glass"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Input Sizes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Input Sizes</CardTitle>
                            <CardDescription>Different input sizes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                inputSize="sm"
                                placeholder="Small input"
                                variant="default"
                            />
                            <Input
                                inputSize="default"
                                placeholder="Default input"
                                variant="default"
                            />
                            <Input
                                inputSize="lg"
                                placeholder="Large input"
                                variant="default"
                            />
                        </CardContent>
                    </Card>
                </section>

                {/* Select Examples */}
                <section className="space-y-6">
                    <div>
                        <h2 className="font-heading text-2xl font-semibold mb-2">Select Dropdowns</h2>
                        <p className="text-muted-foreground text-sm">
                            Dropdown selects with default and glass variants
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Default Select */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Default Select</CardTitle>
                                <CardDescription>Standard dropdown select</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="property-type">Property Type</Label>
                                    <Select>
                                        <SelectTrigger id="property-type" variant="default">
                                            <SelectValue placeholder="Select a property type" />
                                        </SelectTrigger>
                                        <SelectContent variant="default">
                                            <SelectGroup>
                                                <SelectLabel>Property Types</SelectLabel>
                                                <SelectItem value="residential">Residential</SelectItem>
                                                <SelectItem value="commercial">Commercial</SelectItem>
                                                <SelectItem value="industrial">Industrial</SelectItem>
                                                <SelectItem value="land">Land</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select>
                                        <SelectTrigger id="status" variant="default">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent variant="default">
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Glass Select */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Glass Select</CardTitle>
                                <CardDescription>Dropdown with glass effect</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="glass-property-type">Property Type</Label>
                                    <Select>
                                        <SelectTrigger id="glass-property-type" variant="glass">
                                            <SelectValue placeholder="Select a property type" />
                                        </SelectTrigger>
                                        <SelectContent variant="glass">
                                            <SelectGroup>
                                                <SelectLabel>Property Types</SelectLabel>
                                                <SelectItem value="residential">Residential</SelectItem>
                                                <SelectItem value="commercial">Commercial</SelectItem>
                                                <SelectItem value="industrial">Industrial</SelectItem>
                                                <SelectItem value="land">Land</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="glass-status">Status</Label>
                                    <Select>
                                        <SelectTrigger id="glass-status" variant="glass">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent variant="glass">
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Combined Examples */}
                <section className="space-y-6">
                    <div>
                        <h2 className="font-heading text-2xl font-semibold mb-2">Combined Examples</h2>
                        <p className="text-muted-foreground text-sm">
                            Real-world component combinations
                        </p>
                    </div>

                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Property Management Form
                                <Badge variant="success">Active</Badge>
                            </CardTitle>
                            <CardDescription>
                                Complete form using multiple components together
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="property-name">Property Name</Label>
                                    <Input
                                        id="property-name"
                                        placeholder="Enter property name"
                                        variant="glass"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="property-select">Property Type</Label>
                                    <Select>
                                        <SelectTrigger id="property-select" variant="glass">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent variant="glass">
                                            <SelectItem value="residential">Residential</SelectItem>
                                            <SelectItem value="commercial">Commercial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="property-address">Address</Label>
                                <Input
                                    id="property-address"
                                    placeholder="Enter address"
                                    variant="glass"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="glass" size="sm">Featured</Badge>
                                <Badge variant="glass" size="sm">Verified</Badge>
                                <Badge variant="glass" size="sm">Premium</Badge>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-4">
                            <Button variant="glass" className="flex-1">
                                Save Draft
                            </Button>
                            <Button variant="default" className="flex-1">
                                Publish Property
                            </Button>
                        </CardFooter>
                    </Card>
                </section>
            </div>
        </div>
    )
}

export default ComponentLibraryExamples
