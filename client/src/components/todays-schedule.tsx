import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import type { AppointmentWithPatient } from "@shared/schema";
import { format } from "date-fns";

export default function TodaysSchedule() {
  const [, navigate] = useLocation();
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments/today"],
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <CardTitle>Today's Schedule</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {format(new Date(), "MMMM dd, yyyy")}
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3">
              <div className="flex-shrink-0 w-12">
                <Skeleton className="h-4 w-8 mb-1" />
                <Skeleton className="h-3 w-6" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const todayAppointments = appointments || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return {
      time: `${displayHour}:${minutes}`,
      period: ampm
    };
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-200">
        <CardTitle>Today's Schedule</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          {format(new Date(), "MMMM dd, yyyy")}
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {todayAppointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600">No appointments scheduled for today.</p>
          </div>
        ) : (
          <>
            {todayAppointments.slice(0, 4).map((appointment: AppointmentWithPatient) => {
              const timeFormat = formatTime(appointment.time);
              return (
                <div
                  key={appointment.id}
                  className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 w-12 text-center">
                    <p className="text-sm font-medium text-slate-900">{timeFormat.time}</p>
                    <p className="text-xs text-slate-500">{timeFormat.period}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </p>
                    <p className="text-sm text-slate-500 capitalize">{appointment.type}</p>
                    <div className="flex items-center mt-1">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            {todayAppointments.length > 4 && (
              <div className="text-center pt-2">
                <p className="text-sm text-slate-500">
                  +{todayAppointments.length - 4} more appointments
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
      <div className="p-6 border-t border-slate-200">
        <Button
          variant="ghost"
          className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm"
          onClick={() => navigate("/appointments")}
        >
          View Full Schedule
        </Button>
      </div>
    </Card>
  );
}
