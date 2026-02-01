import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardAutoRefresh } from "@/components/dashboard/dashboard-auto-refresh";
import { CommandPalette } from "@/components/layout/command-palette";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardAutoRefresh>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto px-6 pb-6">
                        {children}
                    </main>
                </div>
            </div>
            <CommandPalette />
        </DashboardAutoRefresh>
    );
}
