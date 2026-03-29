"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

interface ResizableLayoutProps {
    sidebar: React.ReactNode
    children: React.ReactNode
}

export function ResizableLayout({ sidebar, children }: ResizableLayoutProps) {
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <div className="flex min-h-screen w-full rounded-lg border">
                <div className="min-w-[250px] w-[20%] border-r">{sidebar}</div>
                <div className="flex-1">{children}</div>
            </div>
        )
    }

    return (
        <ResizablePanelGroup id="main-layout" direction="horizontal" className="min-h-screen w-full rounded-lg border">
            <ResizablePanel 
                defaultSize={20} 
                minSize={4} 
                maxSize={30} 
                collapsible={true}
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    isMounted && "min-w-[50px] md:min-w-[250px] data-[collapsed=true]:min-w-[50px]"
                )}
            >
                {sidebar}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80}>
                {children}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
