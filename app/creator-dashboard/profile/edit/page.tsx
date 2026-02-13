

import { ProfileEditForm } from "@/components/profile/profile-edit-form"; // Adjust this import path to where you save the component
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';

export default async function CreatorProfileEditPage() {
  const supabase = await createClient();
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 2. Fetch User Data
  // Ensure you select all the new fields: date_of_birth, pincode, etc.
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    // Just use full width padding here. 
    // The Form component's "max-w-4xl mx-auto" will handle the centering.
    <div className="w-full p-6 lg:p-10">
      <ProfileEditForm user={userData} />
    </div>
  );
}