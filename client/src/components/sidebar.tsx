import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Pill,
  BarChart3,
  UserCog,
  Settings,
  Heart,
  MoreVertical
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Patients", path: "/patients" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: FileText, label: "Clinical Notes", path: "/clinical-notes" },
  { icon: Pill, label: "Prescriptions", path: "/prescriptions" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

const adminItems = [
  { icon: UserCog, label: "Staff Management", path: "/staff" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo and Hospital Info */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Heart className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">MedCore EMR</h1>
            <p className="text-sm text-slate-500">St. Mary's Hospital</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`w-full justify-start h-10 px-3 ${
              isActive(item.path)
                ? "bg-blue-100 text-blue-700 font-medium hover:bg-blue-100"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Button>
        ))}

        <div className="pt-4 border-t border-slate-200 mt-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 px-3">
            Administration
          </p>
          {adminItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start h-10 px-3 ${
                isActive(item.path)
                  ? "bg-blue-100 text-blue-700 font-medium hover:bg-blue-100"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              Dr. {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.specialty || "Medical Doctor"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.location.href = "/api/logout"}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
