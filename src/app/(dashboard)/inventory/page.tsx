import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter } from "lucide-react"

export default function InventoryPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground mt-1">Track supplies and amenities across properties.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,204</div>
                        <p className="text-xs text-muted-foreground">+2% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">12</div>
                        <p className="text-xs text-muted-foreground">Items requiring reorder</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Value on Hand</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$4,320</div>
                        <p className="text-xs text-muted-foreground">+5% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Inventory Items</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search inventory..." className="pl-8" />
                            </div>
                            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <CardDescription>Manage stock levels for linens, toiletries, and cleaning supplies.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Stock Level</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { name: "Toilet Paper (Rolls)", category: "Toiletries", stock: 142, status: "In Stock" },
                                { name: "Shampoo (Bottles)", category: "Toiletries", stock: 8, status: "Low Stock" },
                                { name: "Kitchen Towels", category: "Linens", stock: 45, status: "In Stock" },
                                { name: "Dish Soap", category: "Cleaning", stock: 12, status: "In Stock" },
                                { name: "Coffee Pods", category: "Kitchen", stock: 0, status: "Out of Stock" },
                            ].map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.category}</Badge>
                                    </TableCell>
                                    <TableCell>{item.stock}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.stock === 0 ? "destructive" : item.stock < 10 ? "secondary" : "default"}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
