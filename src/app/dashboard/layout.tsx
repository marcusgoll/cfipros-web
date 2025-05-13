import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-hidden">
      <Topbar isLoggedIn={true} />
      <main className="flex-grow w-full bg-brand-primary text-brand-light">
        {children}
      </main>
    </div>
  );
} 