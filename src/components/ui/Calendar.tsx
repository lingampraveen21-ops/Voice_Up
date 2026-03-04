import * as React from "react"

import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4 border border-white/10 bg-[#0f0f1a] rounded-2xl", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-white",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    "h-8 w-8 bg-transparent p-0 text-zinc-400 hover:text-white transition-opacity hover:bg-white/5 rounded-md flex items-center justify-center"
                ),
                nav_button_previous: "absolute left-2",
                nav_button_next: "absolute right-2",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-zinc-500 rounded-md w-10 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-white/5 [&:has([aria-selected])]:bg-primary/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                    "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-white/10 text-zinc-300 transition-colors flex items-center justify-center"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold shadow-lg shadow-primary/30",
                day_today: "bg-white/5 text-white font-bold",
                day_outside: "text-zinc-600 opacity-50 aria-selected:bg-white/5 aria-selected:text-zinc-500 aria-selected:opacity-30",
                day_disabled: "text-zinc-600 opacity-50",
                day_range_middle: "aria-selected:bg-white/5 aria-selected:text-zinc-200",
                day_hidden: "invisible",
                ...classNames,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
