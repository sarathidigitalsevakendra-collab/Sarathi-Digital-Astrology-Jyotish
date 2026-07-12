import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import DashboardSidebar from "@/components/layout/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* New Sidebar Component */}
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 bg-cosmic-blue p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
         {/* Mobile Header Spacer if needed or Breadcrumbs */}
         <div className="mb-6 pl-12 md:pl-0">
            <Breadcrumbs />
         </div>

         {children}
      </main>
    </div>
  );
}
