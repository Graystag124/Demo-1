
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Mail, Phone, CheckCircle2, Clock } from 'lucide-react';

interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  status: 'pending' | 'resolved';
  preferredMethod: 'email' | 'phone';
  createdAt: string;
  resolvedAt?: string;
  responses: Array<{
    id: string;
    message: string;
    sentVia: string;
    createdAt: string;
    adminId: string;
    admin?: { email: string };
    senderEmail?: string;
  }>;
}

export default function QueriesPage() {
  const [pendingSubmissions, setPendingSubmissions] = useState<ContactSubmission[]>([]);
  const [completedSubmissions, setCompletedSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to view submissions',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('ContactSubmission')
        .select(`
          *,
          responses:ContactSubmissionResponse(
            id,
            message,
            sentVia,
            createdAt,
            adminId
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      const pending = (data || []).filter(sub => sub.status === 'pending');
      const completed = (data || []).filter(sub => sub.status === 'resolved');

      setPendingSubmissions(pending);
      setCompletedSubmissions(completed);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load contact submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedSubmission || !responseText.trim()) return;

    try {
      setIsSubmitting(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(userError?.message || 'Not authenticated');

      let response;

      try {
        const responseData = {
          submissionId: selectedSubmission.id,
          adminId: user.id,
          message: responseText,
          sentVia: selectedSubmission.preferredMethod,
          senderEmail: 'support@byberr.in'
        };

        const { data: insertedResponse, error: responseError } = await supabase
          .from('ContactSubmissionResponse')
          .insert(responseData)
          .select()
          .single();

        if (responseError) throw new Error(`Database error: ${responseError.message}`);
        response = insertedResponse;
      } catch (dbError) {
        throw new Error(`Failed to save response: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }

      if (selectedSubmission.preferredMethod === 'email') {
        const emailData = {
          message: responseText,
          via: 'email',
          submissionId: selectedSubmission.id
        };
        
        const emailResponse = await fetch(
          `/api/admin/contact-submissions/${selectedSubmission.id}/response`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData),
          }
        );

        if (!emailResponse.ok) {
           if (response) {
              await supabase
                .from('ContactSubmissionResponse')
                .update({ status: 'failed' })
                .eq('id', response.id);
            }
            throw new Error('Failed to send email via API');
        }
        
        if (response) {
            await supabase
              .from('ContactSubmissionResponse')
              .update({ status: 'delivered' })
              .eq('id', response.id);
        }
      }

      toast({
        title: 'Response Sent',
        description: 'Your response has been sent successfully.',
        variant: 'default',
      });
      
      setIsDialogOpen(false);
      setResponseText('');
      fetchSubmissions();

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send response',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SubmissionCard = ({ submission }: { submission: ContactSubmission }) => (
    <Card
      className="flex flex-col h-36 hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden border-slate-200 shadow-sm w-full max-w-lg mx-auto"
      onClick={() => {
        setSelectedSubmission(submission);
        setIsDialogOpen(true);
      }}
    >
      <CardContent className="p-2 flex flex-col h-full">
        <div className="flex flex-row justify-between items-start gap-1.5">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight break-words text-slate-900">
              {submission.firstName} {submission.lastName}
            </h3>
            
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              {submission.preferredMethod === 'email' ? (
                <>
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[140px]">{submission.email}</span>
                </>
              ) : (
                <>
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{submission.phone || 'No phone'}</span>
                </>
              )}
            </div>
          </div>
          
          <Badge 
            variant={submission.status === 'pending' ? 'destructive' : 'default'}
            className="shrink-0 text-[8px] px-1.5 py-0 h-4"
          >
            {submission.status}
          </Badge>
        </div>

        {/* Message Preview */}
        <div className="mt-1">
          <p className="text-xs text-slate-600 whitespace-pre-wrap break-words line-clamp-2 leading-tight">
            {submission.message}
          </p>
        </div>
        
        {/* Footer: Date */}
        <div className="pt-1 mt-1 text-[9px] text-slate-400 font-medium border-t border-slate-100">
          {format(new Date(submission.createdAt), 'MMM d, yyyy • h:mm a')}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    // P-4 for mobile, P-6/8 for larger screens
    <div className="container mx-auto p-4 sm:p-5 max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Contact Submissions</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage and respond to customer inquiries</p>
      </div>

      {/* Pending Submissions */}
      <section>
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="p-1.5 bg-orange-100 rounded-full">
            <Clock className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Pending Submissions</h2>
          <Badge variant="secondary" className="ml-1.5 bg-slate-100 text-slate-700 text-xs h-5">
            {pendingSubmissions.length}
          </Badge>
        </div>
        
        {/* RESPONSIVE GRID: 
            grid-cols-1 (Mobile/Tablet) -> Full width boxes (fixes narrow text issue)
            lg:grid-cols-2 (Desktop) -> Two wide columns 
        */}
        {pendingSubmissions.length > 0 ? (
          <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {pendingSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-slate-500">No pending submissions</p>
          </div>
        )}
      </section>

      {/* Completed Submissions */}
      <section>
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="p-1.5 bg-green-100 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Completed Submissions</h2>
          <Badge variant="secondary" className="ml-1.5 bg-slate-100 text-slate-700 text-xs h-5">
            {completedSubmissions.length}
          </Badge>
        </div>
        
        {completedSubmissions.length > 0 ? (
          <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {completedSubmissions.map((submission) => (
              <SubmissionCard key={`completed-${submission.id}`} submission={submission} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
             <p className="text-slate-500">No completed submissions yet</p>
          </div>
        )}
      </section>

      {/* Response Dialog - Responsive Sizing */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          {selectedSubmission && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl text-left">
                  {selectedSubmission.status === 'pending' ? 'Respond to' : 'View'} 
                  <span className="text-teal-600 ml-1 block sm:inline">
                    {selectedSubmission.firstName} {selectedSubmission.lastName}
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 sm:space-y-6 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="break-all">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-medium">{selectedSubmission.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone</p>
                    <p className="text-sm font-medium">{selectedSubmission.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Message</p>
                  <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <p className="whitespace-pre-wrap break-words text-sm sm:text-base text-slate-700 leading-relaxed">
                      {selectedSubmission.message}
                    </p>
                  </div>
                </div>

                {selectedSubmission.status === 'pending' && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Your Response</p>
                    <Textarea
                      placeholder={`Type your ${selectedSubmission.preferredMethod === 'email' ? 'email' : 'phone call notes'} response here...`}
                      className="min-h-[150px] resize-y text-base"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="w-full sm:w-auto bg-white hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleSubmitResponse}
                        disabled={!responseText.trim() || isSubmitting}
                        className="w-full sm:w-auto bg-white text-teal-600 border border-teal-600 hover:bg-teal-600 hover:text-white transition-colors"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          `Send via ${selectedSubmission.preferredMethod === 'email' ? 'Email' : 'Phone'}`
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedSubmission.responses && selectedSubmission.responses.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold text-slate-800 mb-4">Previous Responses</h3>
                    <div className="space-y-4">
                      {selectedSubmission.responses.map((response) => (
                        <div key={response.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-slate-700">
                              {response.senderEmail || response.admin?.email || 'System'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {format(new Date(response.createdAt), 'MMM d, yyyy • h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap break-words leading-relaxed">
                            {response.message}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase tracking-wide">
                              {response.sentVia}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}