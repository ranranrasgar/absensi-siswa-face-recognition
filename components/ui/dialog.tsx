"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <div className={cn("fixed inset-0 z-50", open ? "block" : "hidden")}>
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={cn(
        "relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-600", className)}>
      {children}
    </p>
  )
}

export function DialogTrigger({ children, asChild = false }: DialogTriggerProps) {
  if (asChild) {
    return children
  }
  
  return (
    <div className="inline-block">
      {children}
    </div>
  )
}
