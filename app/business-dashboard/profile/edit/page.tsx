import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';

export default async function BusinessProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-8">
      <ProfileEditForm user={userData} />
    </div>
  );
}
