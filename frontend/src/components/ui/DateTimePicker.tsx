"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateTimePickerProps {
  date?: Date
  onDateTimeChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  date,
  onDateTimeChange,
  placeholder = "Seleccionar fecha y hora",
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [selectedHour, setSelectedHour] = React.useState<string>(
    date ? format(date, "HH") : "09"
  )
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    date ? format(date, "mm") : "00"
  )

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const updatedDate = new Date(newDate)
      updatedDate.setHours(parseInt(selectedHour), parseInt(selectedMinute))
      setSelectedDate(updatedDate)
      onDateTimeChange(updatedDate)
    } else {
      setSelectedDate(undefined)
      onDateTimeChange(undefined)
    }
  }

  const handleTimeChange = (hour: string, minute: string) => {
    if (selectedDate) {
      const updatedDate = new Date(selectedDate)
      updatedDate.setHours(parseInt(hour), parseInt(minute))
      setSelectedDate(updatedDate)
      onDateTimeChange(updatedDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-[rgb(var(--text-tertiary))]",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP 'a las' HH:mm", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            locale={es}
          />
          <div className="border-t border-[rgb(var(--border-primary))] p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[rgb(var(--text-secondary))]" />
              <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                Hora:
              </span>
              <Select
                value={selectedHour}
                onValueChange={(value) => {
                  setSelectedHour(value)
                  handleTimeChange(value, selectedMinute)
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[rgb(var(--text-secondary))]">:</span>
              <Select
                value={selectedMinute}
                onValueChange={(value) => {
                  setSelectedMinute(value)
                  handleTimeChange(selectedHour, value)
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
