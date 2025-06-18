import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Users, Calendar } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Vitae EMR</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Modern Electronic Medical Records platform designed for small hospitals and clinics. 
            Streamline patient care with intuitive, secure, and customizable workflows.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>
                Comprehensive patient records with medical history, allergies, medications, and more.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Smart Scheduling</CardTitle>
              <CardDescription>
                Intelligent appointment scheduling with calendar views and automated reminders.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Secure & Compliant</CardTitle>
              <CardDescription>
                HIPAA-compliant data handling with role-based access control and audit logs.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Login Card */}
        <Card className="max-w-md mx-auto border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Vitae EMR</CardTitle>
            <CardDescription>
              Please log in to access your medical records platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
              onClick={() => window.location.href = '/api/login'}
            >
              Log In to Continue
            </Button>
            <p className="text-sm text-slate-500 text-center">
              Secure authentication powered by your organization's identity provider
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
