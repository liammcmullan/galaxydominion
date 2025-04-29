"use client";

import type React from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

interface GameLayoutProps {
  children: [React.ReactNode, React.ReactNode]; // Expecting ControlPanel and GalaxyMap area
}

export default function GameLayout({ children }: GameLayoutProps) {
  const [controlPanel, mainContent] = children;

  return (
    <SidebarProvider defaultOpen={true}>
       {/* Sidebar container for the control panel */}
       <Sidebar variant="sidebar" collapsible="icon" className="border-r">
         {controlPanel}
       </Sidebar>

       {/* Main content area (inset) */}
      <SidebarInset>
         {mainContent}
      </SidebarInset>
    </SidebarProvider>
  );
}
