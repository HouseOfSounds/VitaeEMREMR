import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, FileText, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardMetrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricItems = [
    {
      title: "Today's Appointments",
      value: metrics?.todayAppointments || 0,
      change: "+12%",
      changeType: "positive",
      icon: Calendar,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Active Patients",
      value: metrics?.activePatients || 0,
      change: "+8%",
      changeType: "positive",
      icon: Users,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      title: "Pending Reports",
      value: metrics?.pendingReports || 0,
      change: "2.3h avg",
      changeType: "neutral",
      icon: FileText,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      title: "Revenue (Month)",
      value: `$${(metrics?.monthlyRevenue || 0).toLocaleString()}`,
      change: "+15%",
      changeType: "positive",
      icon: DollarSign,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricItems.map((metric, index) => (
        <Card
          key={index}
          className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {metric.value}
                </p>
                <p className={`text-sm mt-1 flex items-center ${
                  metric.changeType === "positive"
                    ? "text-green-600"
                    : metric.changeType === "neutral"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}>
                  {metric.changeType === "positive" && (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}
                  {metric.changeType === "positive" && index < 2 && " from yesterday"}
                  {metric.changeType === "positive" && index >= 2 && " vs last month"}
                  {metric.changeType === "neutral" && " processing"}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.iconBg}`}>
                <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
