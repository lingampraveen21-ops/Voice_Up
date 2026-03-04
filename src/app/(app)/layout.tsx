import { Sidebar } from "@/components/layout/Sidebar";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 w-full pb-16 md:pb-0 overflow-y-auto">
                <div className="container mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
