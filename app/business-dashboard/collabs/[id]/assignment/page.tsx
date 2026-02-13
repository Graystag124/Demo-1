"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant, getStatusLabel } from "@/lib/status";
import { fetchOpenGraph } from "@/lib/og";

type Submission = {
  id: string;
  collaboration_id: string;
  creator_id: string;
  url: string;
  caption: string | null;
  type: string;
  status: string;
  submitted_at: string;
};

async function approveSubmission(formData: FormData) {
  'use server'
  const supabase = await createClient();
  const submission_id = formData.get('submission_id') as string;
  const collab_id = formData.get('collaboration_id') as string;
  if (!submission_id) return;

  await supabase
    .from('collaboration_submissions')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', submission_id);

  revalidatePath(`/business-dashboard/collabs/${collab_id}/assignment`);
}

async function rejectSubmission(formData: FormData) {
  'use server'
  const supabase = await createClient();
  const submission_id = formData.get('submission_id') as string;
  const collab_id = formData.get('collaboration_id') as string;
  if (!submission_id) return;

  await supabase
    .from('collaboration_submissions')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', submission_id);

  revalidatePath(`/business-dashboard/collabs/${collab_id}/assignment`);
}

async function markApplied(formData: FormData) {
  'use server'
  const supabase = await createClient();
  const submission_id = formData.get('submission_id') as string;
  const collab_id = formData.get('collaboration_id') as string;
  if (!submission_id) return;

  await supabase
    .from('collaboration_submissions')
    .update({ status: 'applied', reviewed_at: new Date().toISOString() })
    .eq('id', submission_id);

  // Optionally mark assignment as completed
  revalidatePath(`/business-dashboard/collabs/${collab_id}/assignment`);
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BusinessAssignmentPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id: collaboration_id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: collaboration } = await supabase
    .from('collaborations')
    .select('*')
    .eq('id', collaboration_id)
    .single();

  if (!collaboration) notFound();
  if (collaboration.business_id !== user.id) notFound();

  const { data: submissions } = await supabase
    .from('collaboration_submissions')
    .select('*')
    .eq('collaboration_id', collaboration_id)
    .order('submitted_at', { ascending: false }) as { data: Submission[] };

  // Fetch previews server-side
  const previews = await Promise.all((submissions || []).map(async (s) => {
    try {
      const preview = await fetchOpenGraph(s.url);
      return { id: s.id, preview };
    } catch (e) {
      return { id: s.id, preview: null };
    }
  }));

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <DashboardPageHeader title={`Submissions — ${collaboration.title || 'Collaboration'}`} description="Review and moderate creator submissions" showBackButton />

      {(submissions || []).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <p className="font-medium">No submissions yet</p>
            <p className="text-sm text-muted-foreground">Creators will appear here when they submit deliverables.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {(submissions || []).map((s: Submission) => {
            const p = previews.find((x: any) => x.id === s.id)?.preview;
            const creatorData = submissions.find(sub => sub.id === s.id);
            
            return (
              <Card key={s.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-0 md:gap-4">
                  {/* Preview Section */}
                  <div className="flex flex-col">
                    {/* Image Preview */}
                    <div className="w-full h-64 md:h-auto md:flex-1 bg-muted/20 overflow-hidden">
                      {p?.image ? (
                        <img src={p.image} alt={p.title || 'preview'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <div className="text-center space-y-2">
                            <div className="text-muted-foreground">📸</div>
                            <p className="text-sm text-muted-foreground">No preview available</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title, Description, Link */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-base line-clamp-2 hover:text-primary transition-colors">{p?.title || 'Untitled'}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{s.type.toUpperCase()} • {new Date(s.submitted_at).toLocaleDateString()}</p>
                      </div>
                      
                      {(p?.description || s.caption) && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{p?.description || s.caption}</p>
                      )}

                      <a 
                        href={s.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                      >
                        View on Instagram →
                      </a>
                    </div>
                  </div>

                  {/* Actions Sidebar */}
                  <div className="bg-muted/5 p-4 flex flex-col justify-between md:col-span-1">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
                        <div className="mt-2">
                          <Badge variant={getStatusVariant(s.status)} className="capitalize">
                            {getStatusLabel(s.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Type:</strong> {s.type}</p>
                        <p><strong>Submitted:</strong> {new Date(s.submitted_at).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 mt-4">
                      <form action={approveSubmission}>
                        <input type="hidden" name="submission_id" value={s.id} />
                        <input type="hidden" name="collaboration_id" value={collaboration_id} />
                        <Button type="submit" className="w-full" disabled={s.status === 'approved'}>
                          ✓ Approve
                        </Button>
                      </form>

                      <form action={rejectSubmission}>
                        <input type="hidden" name="submission_id" value={s.id} />
                        <input type="hidden" name="collaboration_id" value={collaboration_id} />
                        <Button type="submit" variant="destructive" className="w-full" disabled={s.status === 'rejected'}>
                          ✕ Reject
                        </Button>
                      </form>

                      <form action={markApplied}>
                        <input type="hidden" name="submission_id" value={s.id} />
                        <input type="hidden" name="collaboration_id" value={collaboration_id} />
                        <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" disabled={s.status === 'applied'}>
                          Applied
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
