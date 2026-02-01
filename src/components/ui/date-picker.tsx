"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    className?: string
    name?: string
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Pick a date",
    className,
    name,
}: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(value)

    React.useEffect(() => {
        setDate(value)
    }, [value])

    function handleSelect(selected: Date | undefined) {
        setDate(selected)
        onChange?.(selected)
    }

    return (
        <>
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={date ? date.toISOString() : ""}
                />
            )}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                            className
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </>
    )
}

interface DateRangePickerProps {
    from?: Date
    to?: Date
    onSelect?: (range: { from?: Date; to?: Date }) => void
    className?: string
}

export function DateRangePicker({
    from,
    to,
    onSelect,
    className,
}: DateRangePickerProps) {
    const [range, setRange] = React.useState<{ from?: Date; to?: Date }>({
        from,
        to,
    })

    React.useEffect(() => {
        setRange({ from, to })
    }, [from, to])

    function handleSelect(selected: { from?: Date; to?: Date } | undefined) {
        const newRange = selected || { from: undefined, to: undefined }
        setRange(newRange)
        onSelect?.(newRange)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !range.from && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {range.from ? (
                        range.to ? (
                            <>
                                {format(range.from, "LLL dd")} -{" "}
                                {format(range.to, "LLL dd")}
                            </>
                        ) : (
                            format(range.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Pick date range</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    defaultMonth={range.from}
                    selected={range.from ? { from: range.from, to: range.to } : undefined}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    )
}
