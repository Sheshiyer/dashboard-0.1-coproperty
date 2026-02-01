"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { createTask } from "@/lib/actions/tasks"
import { Property } from "@/lib/data/properties"
import { Plus } from "lucide-react"
import { useState } from "react"

export function CreateTaskDialog({ properties }: { properties: Property[] }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        if (dueDate) {
            formData.set("due_date", dueDate.toISOString())
        }
        await createTask(formData)
        setIsLoading(false)
        setOpen(false)
        setDueDate(undefined)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Task</DialogTitle>
                        <DialogDescription>
                            Add a new task for your team. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input id="title" name="title" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="property" className="text-right">
                                Property
                            </Label>
                            <Select name="property_id" required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a property" />
                                </SelectTrigger>
                                <SelectContent>
                                    {properties.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.building_name || p.name || p.internal_code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">
                                Priority
                            </Label>
                            <Select name="priority" defaultValue="medium" required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Select name="category" defaultValue="general" required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="inspection">Inspection</SelectItem>
                                    <SelectItem value="inventory">Inventory</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                                Due Date
                            </Label>
                            <div className="col-span-3">
                                <DatePicker
                                    value={dueDate}
                                    onChange={setDueDate}
                                    name="due_date"
                                    placeholder="Set due date (optional)"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="assigned_to" className="text-right">
                                Assign To
                            </Label>
                            <Input
                                id="assigned_to"
                                name="assigned_to"
                                className="col-span-3"
                                placeholder="Assignee name (optional)"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea id="description" name="description" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} loading={isLoading}>
                            Save Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
