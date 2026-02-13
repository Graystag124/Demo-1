"use client";

import { BusinessEditForm } from "./business-edit-form";
import { CreatorEditForm } from "./creator-edit-form";

export function ProfileEditForm({ user }: { user: any }) {
  if (!user) {
    return <div>User not found.</div>;
  }

  return user.user_type === "business" ? (
    <BusinessEditForm user={user} />
  ) : (
    <CreatorEditForm user={user} />
  );
}