"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

interface ResizableLayoutProps {
    sidebar: React.ReactNode
    children: React.ReactNode
}

export function ResizableLayout({ sidebar, children }: ResizableLayoutProps) {
    return (
        <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full rounded-lg border">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="min-w-[250px]">
                {sidebar}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80}>
                {children}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
