import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  CalendarPlus, 
  FileText, 
  BarChart3, 
  DollarSign, 
  Settings 
} from "lucide-react";

export default function QuickActions() {
  const [, navigate] = useLocation();

  const actions = [
    {
      icon: UserPlus,
      label: "Add Patient",
      color: "text-blue-600",
      bgColor: "bg-blue-100 hover:bg-blue-200",
      action: () => navigate("/patients"),
    },
    {
      icon: CalendarPlus,
      label: "Schedule",
      color: "text-green-600",
      bgColor: "bg-green-100 hover:bg-green-200",
      action: () => navigate("/appointments"),
    },
    {
      icon: FileText,
      label: "New Note",
      color: "text-amber-600",
      bgColor: "bg-amber-100 hover:bg-amber-200",
      action: () => navigate("/clinical-notes"),
    },
    {
      icon: BarChart3,
      label: "Reports",
      color: "text-purple-600",
      bgColor: "bg-purple-100 hover:bg-purple-200",
      action: () => navigate("/analytics"),
    },
    {
      icon: DollarSign,
      label: "Billing",
      color: "text-green-600",
      bgColor: "bg-green-100 hover:bg-green-200",
      action: () => navigate("/billing"),
    },
    {
      icon: Settings,
      label: "Settings",
      color: "text-slate-600",
      bgColor: "bg-slate-100 hover:bg-slate-200",
      action: () => navigate("/settings"),
    },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-center h-auto flex-col group"
            onClick={action.action}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors ${action.bgColor}`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <p className="font-medium text-slate-900">{action.label}</p>
          </Button>
        ))}
      </div>
    </div>
  );
}
