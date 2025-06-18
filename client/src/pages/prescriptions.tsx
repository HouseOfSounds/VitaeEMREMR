import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Plus, Edit, Trash2, User, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPrescriptionSchema, type PrescriptionWithDetails } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

const prescriptionFormSchema = insertPrescriptionSchema.extend({
  patientId: z.number().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  medicationName: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  startDate: z.string().min(1, "Start date is required"),
});

export default function Prescriptions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Redirect to home if not authenticated
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

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["/api/prescriptions"],
    enabled: isAuthenticated,
  });

  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
    enabled: isAuthenticated,
  });

  const form = useForm({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      patientId: 0,
      doctorId: user?.id || "",
      appointmentId: undefined,
      medicationName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      status: "active" as const,
      startDate: "",
      endDate: "",
      refillsRemaining: 0,
      pharmacyNotes: "",
    },
  });

  useEffect(() => {
    if (selectedPrescription) {
      form.reset({
        patientId: selectedPrescription.patientId,
        doctorId: selectedPrescription.doctorId,
        appointmentId: selectedPrescription.appointmentId || undefined,
        medicationName: selectedPrescription.medicationName,
        dosage: selectedPrescription.dosage,
        frequency: selectedPrescription.frequency,
        duration: selectedPrescription.duration,
        instructions: selectedPrescription.instructions || "",
        status: selectedPrescription.status as "active" | "completed" | "discontinued",
        startDate: selectedPrescription.startDate,
        endDate: selectedPrescription.endDate || "",
        refillsRemaining: selectedPrescription.refillsRemaining || 0,
        pharmacyNotes: selectedPrescription.pharmacyNotes || "",
      });
    } else {
      form.reset({
        patientId: 0,
        doctorId: user?.id || "",
        appointmentId: undefined,
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        status: "active" as const,
        startDate: "",
        endDate: "",
        refillsRemaining: 0,
        pharmacyNotes: "",
      });
    }
  }, [selectedPrescription, user, form]);

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof prescriptionFormSchema>) => {
      const response = await apiRequest("POST", "/api/prescriptions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      setShowForm(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      });
    },
  });

  const updatePrescriptionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof prescriptionFormSchema>) => {
      const response = await apiRequest("PUT", `/api/prescriptions/${selectedPrescription!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({
        title: "Success",
        description: "Prescription updated successfully",
      });
      setShowForm(false);
      setSelectedPrescription(null);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update prescription",
        variant: "destructive",
      });
    },
  });

  const deletePrescriptionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/prescriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({
        title: "Success",
        description: "Prescription deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete prescription",
        variant: "destructive",
      });
    },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "discontinued":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeletePrescription = (id: number) => {
    if (confirm("Are you sure you want to delete this prescription?")) {
      deletePrescriptionMutation.mutate(id);
    }
  };

  const onSubmit = (data: z.infer<typeof prescriptionFormSchema>) => {
    if (selectedPrescription) {
      updatePrescriptionMutation.mutate(data);
    } else {
      createPrescriptionMutation.mutate(data);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-slate-900">Prescriptions</h1>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Prescription
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedPrescription ? "Edit Prescription" : "Create New Prescription"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient</FormLabel>
                            <Select
                              value={field.value?.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a patient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {patients?.map((patient: any) => (
                                  <SelectItem key={patient.id} value={patient.id.toString()}>
                                    {patient.firstName} {patient.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="medicationName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medication Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter medication name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dosage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosage</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 10mg, 2 tablets" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="once-daily">Once Daily</SelectItem>
                                  <SelectItem value="twice-daily">Twice Daily</SelectItem>
                                  <SelectItem value="three-times-daily">Three Times Daily</SelectItem>
                                  <SelectItem value="four-times-daily">Four Times Daily</SelectItem>
                                  <SelectItem value="every-other-day">Every Other Day</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="as-needed">As Needed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 7 days, 30 days" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date (Optional)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="discontinued">Discontinued</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="refillsRemaining"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Refills Remaining</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  placeholder="0"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter detailed instructions for the patient..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pharmacyNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pharmacy Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter notes for the pharmacy..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowForm(false);
                            setSelectedPrescription(null);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createPrescriptionMutation.isPending || updatePrescriptionMutation.isPending}
                        >
                          {selectedPrescription ? "Update Prescription" : "Create Prescription"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                All Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading prescriptions...</p>
                </div>
              ) : !prescriptions || prescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No prescriptions found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription: PrescriptionWithDetails) => (
                    <Card key={prescription.id} className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getStatusColor(prescription.status)}>
                                {prescription.status}
                              </Badge>
                              <span className="text-sm text-slate-500">
                                {format(new Date(prescription.createdAt!), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {prescription.medicationName}
                            </h3>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center space-x-4 text-sm text-slate-600">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  Patient: {prescription.patient.firstName} {prescription.patient.lastName}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Start: {format(new Date(prescription.startDate), "MMM dd, yyyy")}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-slate-600">
                                <span><strong>Dosage:</strong> {prescription.dosage}</span>
                                <span><strong>Frequency:</strong> {prescription.frequency.replace("-", " ")}</span>
                                <span><strong>Duration:</strong> {prescription.duration}</span>
                              </div>
                              {prescription.refillsRemaining && prescription.refillsRemaining > 0 && (
                                <div className="text-sm text-slate-600">
                                  <strong>Refills:</strong> {prescription.refillsRemaining} remaining
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPrescription(prescription);
                                setShowForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePrescription(prescription.id)}
                              disabled={deletePrescriptionMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {prescription.instructions && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">Instructions:</p>
                            <p className="text-sm text-blue-800">{prescription.instructions}</p>
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}