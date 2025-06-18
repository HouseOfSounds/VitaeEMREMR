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
import { FileText, Plus, Edit, Trash2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClinicalNoteSchema, type ClinicalNoteWithDetails } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

const clinicalNoteFormSchema = insertClinicalNoteSchema.extend({
  patientId: z.number().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.string().min(1, "Type is required"),
});

export default function ClinicalNotes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedNote, setSelectedNote] = useState<ClinicalNoteWithDetails | null>(null);
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

  const { data: clinicalNotes, isLoading: notesLoading } = useQuery({
    queryKey: ["/api/clinical-notes"],
    enabled: isAuthenticated,
  });

  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
    enabled: isAuthenticated,
  });

  const form = useForm({
    resolver: zodResolver(clinicalNoteFormSchema),
    defaultValues: {
      patientId: 0,
      doctorId: user?.id || "",
      title: "",
      content: "",
      type: "",
      appointmentId: undefined,
    },
  });

  useEffect(() => {
    if (selectedNote) {
      form.reset({
        patientId: selectedNote.patientId,
        doctorId: selectedNote.doctorId,
        title: selectedNote.title,
        content: selectedNote.content,
        type: selectedNote.type,
        appointmentId: selectedNote.appointmentId || undefined,
      });
    } else {
      form.reset({
        patientId: 0,
        doctorId: user?.id || "",
        title: "",
        content: "",
        type: "",
        appointmentId: undefined,
      });
    }
  }, [selectedNote, user, form]);

  const createNoteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof clinicalNoteFormSchema>) => {
      const response = await apiRequest("POST", "/api/clinical-notes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clinical-notes"] });
      toast({
        title: "Success",
        description: "Clinical note created successfully",
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
        description: "Failed to create clinical note",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof clinicalNoteFormSchema>) => {
      const response = await apiRequest("PUT", `/api/clinical-notes/${selectedNote!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clinical-notes"] });
      toast({
        title: "Success",
        description: "Clinical note updated successfully",
      });
      setShowForm(false);
      setSelectedNote(null);
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
        description: "Failed to update clinical note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clinical-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clinical-notes"] });
      toast({
        title: "Success",
        description: "Clinical note deleted successfully",
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
        description: "Failed to delete clinical note",
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "progress-note":
        return "bg-blue-100 text-blue-800";
      case "diagnosis":
        return "bg-red-100 text-red-800";
      case "treatment-plan":
        return "bg-green-100 text-green-800";
      case "lab-results":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("Are you sure you want to delete this clinical note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const onSubmit = (data: z.infer<typeof clinicalNoteFormSchema>) => {
    if (selectedNote) {
      updateNoteMutation.mutate(data);
    } else {
      createNoteMutation.mutate(data);
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
              <h1 className="text-2xl font-semibold text-slate-900">Clinical Notes</h1>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedNote ? "Edit Clinical Note" : "Create New Clinical Note"}
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

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter note title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select note type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="progress-note">Progress Note</SelectItem>
                                <SelectItem value="diagnosis">Diagnosis</SelectItem>
                                <SelectItem value="treatment-plan">Treatment Plan</SelectItem>
                                <SelectItem value="lab-results">Lab Results</SelectItem>
                                <SelectItem value="consultation">Consultation</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter detailed clinical notes..."
                                className="min-h-[200px]"
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
                            setSelectedNote(null);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                        >
                          {selectedNote ? "Update Note" : "Create Note"}
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
                <FileText className="h-5 w-5 mr-2" />
                All Clinical Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading clinical notes...</p>
                </div>
              ) : !clinicalNotes || clinicalNotes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No clinical notes found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clinicalNotes.map((note: ClinicalNoteWithDetails) => (
                    <Card key={note.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getTypeColor(note.type)}>
                                {note.type.replace("-", " ")}
                              </Badge>
                              <span className="text-sm text-slate-500">
                                {format(new Date(note.createdAt!), "MMM dd, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">{note.title}</h3>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                Patient: {note.patient.firstName} {note.patient.lastName}
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                Doctor: {note.doctor.firstName} {note.doctor.lastName}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedNote(note);
                                setShowForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={deleteNoteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
                      </CardContent>
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
