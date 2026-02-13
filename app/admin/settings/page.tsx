"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, LogOut } from "lucide-react";
import { toast } from "sonner"; // Assuming you use Sonner or similar, remove if not

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Placeholder state - normally you'd fetch this from Supabase in useEffect
  const [formData, setFormData] = useState({
    displayName: "Admin",
    email: "admin@byberr.com",
    notifications: true,
    autoApprove: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulator API Call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would use supabase.from('users').update(...)
    
    setIsLoading(false);
    // toast.success("Settings updated successfully");
    alert("Settings updated");
  };

  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="container mx-auto p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your admin profile and platform preferences.</p>
      </div>

      <div className="grid gap-6">
        
        {/* Profile Settings */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
            <CardDescription>Update your personal administrator details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  value={formData.displayName} 
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  disabled
                  className="text-muted-foreground" 
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Platform Preferences (Example) */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>Platform Preferences</CardTitle>
            <CardDescription>Manage global system behavior.</CardDescription>
          </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive emails when new users sign up.</p>
              </div>
              <Switch 
                checked={formData.notifications}
                onCheckedChange={(c) => setFormData({...formData, notifications: c})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base text-muted-foreground">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Disable access for non-admin users.</p>
              </div>
              <Switch disabled />
            </div>
          </CardContent>
        </Card>

        {/* Logout Card */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Logging out will end your current session. You'll need to sign in again to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}