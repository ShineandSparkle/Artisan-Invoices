import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import RecentInvoices from "@/components/RecentInvoices";
import QuickActions from "@/components/QuickActions";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your invoicing business.</p>
        </div>

        <div className="space-y-8">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecentInvoices />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
