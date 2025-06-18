import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  FileText, 
  Pill,
  DollarSign,
  Clock,
  Activity,
  Download
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [timeRange, setTimeRange] = useState("30");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics", timeRange],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mock data for analytics (in production, this would come from the API)
  const appointmentTrends = [
    { month: "Jan", appointments: 145, completed: 132, cancelled: 13 },
    { month: "Feb", appointments: 168, completed: 155, cancelled: 13 },
    { month: "Mar", appointments: 193, completed: 178, cancelled: 15 },
    { month: "Apr", appointments: 211, completed: 196, cancelled: 15 },
    { month: "May", appointments: 189, completed: 171, cancelled: 18 },
    { month: "Jun", appointments: 225, completed: 208, cancelled: 17 },
  ];

  const patientDemographics = [
    { name: "18-30", value: 25, color: "#3B82F6" },
    { name: "31-45", value: 35, color: "#10B981" },
    { name: "46-60", value: 28, color: "#F59E0B" },
    { name: "60+", value: 12, color: "#EF4444" },
  ];

  const departmentStats = [
    { department: "Cardiology", patients: 89, revenue: 45000 },
    { department: "Orthopedics", patients: 67, revenue: 38000 },
    { department: "Pediatrics", patients: 123, revenue: 29000 },
    { department: "Dermatology", patients: 45, revenue: 22000 },
    { department: "Internal Medicine", patients: 156, revenue: 67000 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 125000, expenses: 85000, profit: 40000 },
    { month: "Feb", revenue: 138000, expenses: 92000, profit: 46000 },
    { month: "Mar", revenue: 152000, expenses: 98000, profit: 54000 },
    { month: "Apr", revenue: 165000, expenses: 105000, profit: 60000 },
    { month: "May", revenue: 148000, expenses: 89000, profit: 59000 },
    { month: "Jun", revenue: 178000, expenses: 112000, profit: 66000 },
  ];

  const topConditions = [
    { condition: "Hypertension", count: 156, percentage: 23 },
    { condition: "Diabetes", count: 134, percentage: 20 },
    { condition: "Arthritis", count: 98, percentage: 15 },
    { condition: "Asthma", count: 87, percentage: 13 },
    { condition: "Heart Disease", count: 67, percentage: 10 },
  ];

  const keyMetrics = [
    {
      title: "Patient Satisfaction",
      value: "4.8/5.0",
      change: "+0.2",
      changeType: "positive",
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Avg Wait Time",
      value: "12 min",
      change: "-3 min",
      changeType: "positive",
      icon: Clock,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      title: "No-Show Rate",
      value: "8.2%",
      change: "-1.5%",
      changeType: "positive",
      icon: Calendar,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      title: "Revenue Growth",
      value: "15.3%",
      change: "+2.1%",
      changeType: "positive",
      icon: TrendingUp,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-slate-900">Analytics & Reports</h1>
              <div className="flex items-center space-x-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {keyMetrics.map((metric, index) => (
              <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{metric.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">
                        {metric.value}
                      </p>
                      <p className={`text-sm mt-1 flex items-center ${
                        metric.changeType === "positive" ? "text-green-600" : "text-red-600"
                      }`}>
                        {metric.changeType === "positive" && (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        )}
                        {metric.change} vs last period
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Appointment Trends */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Appointment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={appointmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="appointments" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="cancelled" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Patient Demographics */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Patient Demographics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={patientDemographics}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {patientDemographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Analysis */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Revenue Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                    <Bar dataKey="expenses" fill="#EF4444" />
                    <Bar dataKey="profit" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Performance */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentStats.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{dept.department}</p>
                        <p className="text-sm text-slate-500">{dept.patients} patients</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${dept.revenue.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Medical Conditions */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Top Medical Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topConditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{condition.condition}</p>
                        <p className="text-sm text-slate-500">{condition.count} patients</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${condition.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 w-10">
                        {condition.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}