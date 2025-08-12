"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface SelectValueProps {
  placeholder?: string
  className?: string
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")

  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
              onClick: () => setIsOpen(!isOpen),
              isOpen,
            })
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child, {
              onSelect: handleSelect,
              selectedValue,
            })
          }
        }
        return child
      })}
    </div>
  )
}

export function SelectTrigger({ children, className, ...props }: SelectTriggerProps & { onClick?: () => void; isOpen?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectContent({ children, className, onSelect, selectedValue }: SelectContentProps & { onSelect?: (value: string) => void; selectedValue?: string }) {
  return (
    <div
      className={cn(
        "absolute top-full z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect,
              selectedValue,
            })
          }
          return child
        })}
      </div>
    </div>
  )
}

export function SelectItem({ value, children, className, onSelect, selectedValue }: SelectItemProps & { onSelect?: (value: string) => void; selectedValue?: string }) {
  const isSelected = selectedValue === value

  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  )
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  return (
    <span className={cn("block truncate", className)}>
      {placeholder || "Select an option"}
    </span>
  )
}
