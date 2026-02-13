// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import { createBrowserClient } from '@supabase/ssr';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useToast } from '@/components/ui/use-toast';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Loader2 } from 'lucide-react';

// export default function BusinessSpendContent() {
//   const [collaborations, setCollaborations] = useState<any[]>([]);
//   const [creators, setCreators] = useState<any[]>([]);
//   const [spendHistory, setSpendHistory] = useState<any[]>([]);
//   const [selectedCollaboration, setSelectedCollaboration] = useState('');
//   const [selectedCreator, setSelectedCreator] = useState('');
//   const [amount, setAmount] = useState('');
//   const [description, setDescription] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [businessId, setBusinessId] = useState<string | null>(null);

//   const { toast } = useToast();
//   const router = useRouter();
//   const supabase = useMemo(() => createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   ), []);

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
      
//       // 1. Get User Session
//       const { data: { user }, error: authError } = await supabase.auth.getUser();
      
//       if (authError || !user) {
//         console.error("Auth Error:", authError);
//         router.push('/auth/login');
//         return;
//       }

//       console.log("Logged in Business ID:", user.id);
//       setBusinessId(user.id);

//       // 2. Fetch Data Parallelly
//       try {
//         const [collabRes, spendRes] = await Promise.all([
//           supabase
//             .from('collaborations')
//             .select('id, title')
//             .eq('business_id', user.id)
//             .eq('approval_status', 'approved'),
//           supabase
//             .from('business_transactions')
//             .select(`
//               id, amount, description, created_at, type,
//               creator:creator_id(id, display_name, email),
//               collaboration:reference_id(id, title)
//             `)
//             .eq('business_id', user.id)
//             .order('created_at', { ascending: false })
//         ]);

//         if (collabRes.error) console.error("Collab Fetch Error:", collabRes.error);
//         if (spendRes.error) console.error("Spend Fetch Error:", spendRes.error);

//         console.log("Fetched Collabs:", collabRes.data);
//         console.log("Fetched History:", spendRes.data);

//         setCollaborations(collabRes.data || []);
//         setSpendHistory(spendRes.data || []);

//       } catch (err) {
//         console.error("System Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [supabase, router]);

//   // Fetch creators when collaboration is selected
//   useEffect(() => {
//     const fetchCreators = async () => {
//       if (!selectedCollaboration) return;
      
//       const { data, error } = await supabase
//         .from('collaboration_applications')
//         .select(`
//           creator:users!collaboration_applications_creator_id_fkey(id, display_name, email)
//         `)
//         .eq('collaboration_id', selectedCollaboration)
//         .eq('approval_status', 'approved');

//       if (error) {
//         console.error("Creator Fetch Error:", error);
//       } else {
//         const list = data?.map(d => d.creator).filter(Boolean) || [];
//         setCreators(list);
//       }
//     };
//     fetchCreators();
//   }, [selectedCollaboration, supabase]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!businessId) return;

//     const { error } = await supabase
//       .from('business_transactions')
//       .insert([{
//         business_id: businessId,
//         creator_id: selectedCreator,
//         reference_id: selectedCollaboration,
//         amount: parseFloat(amount),
//         description,
//         category: 'collaboration_payment',
//         type: 'debit'
//       }]);

//     if (error) {
//       toast({ title: "Error", description: error.message, variant: "destructive" });
//     } else {
//       toast({ title: "Success", description: "Payment recorded" });
//       // Refresh local history
//       window.location.reload(); 
//     }
//   };

//   if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <Card>
//         <CardHeader><CardTitle>Record New Payment</CardTitle></CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label>Collaboration</Label>
//               <Select value={selectedCollaboration} onValueChange={setSelectedCollaboration}>
//                 <SelectTrigger><SelectValue placeholder="Select Collab" /></SelectTrigger>
//                 <SelectContent>
//                   {collaborations.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label>Creator</Label>
//               <Select value={selectedCreator} onValueChange={setSelectedCreator} disabled={!creators.length}>
//                 <SelectTrigger><SelectValue placeholder="Select Creator" /></SelectTrigger>
//                 <SelectContent>
//                   {creators.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.display_name || c.email}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>

//             <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
//             <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
//             <Button type="submit" className="md:col-span-2">Record Transaction</Button>
//           </form>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader><CardTitle>Spend History</CardTitle></CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Collab</TableHead>
//                 <TableHead>Creator</TableHead>
//                 <TableHead className="text-right">Amount</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {spendHistory.length === 0 ? (
//                 <TableRow><TableCell colSpan={4} className="text-center">No transactions found.</TableCell></TableRow>
//               ) : (
//                 spendHistory.map((s) => (
//                   <TableRow key={s.id}>
//                     <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
//                     <TableCell>{s.collaboration?.title || 'N/A'}</TableCell>
//                     <TableCell>{s.creator?.display_name || s.creator?.email || 'N/A'}</TableCell>
//                     <TableCell className="text-right font-bold text-red-600">Rs. {s.amount}</TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



'use client';

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function BusinessSpendContent() {
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [spendHistory, setSpendHistory] = useState<any[]>([]);
  const [selectedCollaboration, setSelectedCollaboration] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // 1. Get User Session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Auth Error:", authError);
        router.push('/auth/login');
        return;
      }

      console.log("Logged in Business ID:", user.id);
      setBusinessId(user.id);

      // 2. Fetch Data Parallelly
      try {
        const [collabRes, spendRes] = await Promise.all([
          supabase
            .from('collaborations')
            .select('id, title')
            .eq('business_id', user.id)
            .eq('approval_status', 'approved'),
          supabase
            .from('business_transactions')
            .select(`
              id, amount, description, created_at, type,
              creator:creator_id(id, display_name, email),
              collaboration:reference_id(id, title)
            `)
            .eq('business_id', user.id)
            .order('created_at', { ascending: false })
        ]);

        if (collabRes.error) console.error("Collab Fetch Error:", collabRes.error);
        if (spendRes.error) console.error("Spend Fetch Error:", spendRes.error);

        console.log("Fetched Collabs:", collabRes.data);
        console.log("Fetched History:", spendRes.data);

        setCollaborations(collabRes.data || []);
        setSpendHistory(spendRes.data || []);

      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase, router]);

  // Fetch creators when collaboration is selected
  useEffect(() => {
    const fetchCreators = async () => {
      if (!selectedCollaboration) return;
      
      const { data, error } = await supabase
        .from('collaboration_applications')
        .select(`
          creator:users!collaboration_applications_creator_id_fkey(id, display_name, email)
        `)
        .eq('collaboration_id', selectedCollaboration)
        .eq('approval_status', 'approved');

      if (error) {
        console.error("Creator Fetch Error:", error);
      } else {
        const list = data?.map(d => d.creator).filter(Boolean) || [];
        setCreators(list);
      }
    };
    fetchCreators();
  }, [selectedCollaboration, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    const { error } = await supabase
      .from('business_transactions')
      .insert([{
        business_id: businessId,
        creator_id: selectedCreator,
        reference_id: selectedCollaboration,
        amount: parseFloat(amount),
        description,
        category: 'collaboration_payment',
        type: 'debit'
      }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Payment recorded" });
      // Refresh local history
      window.location.reload(); 
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    /* Improved container: Added pb-32 to prevent bottom overlap and px-4 for mobile breathing room */
    <div className="container mx-auto px-4 py-6 space-y-6 pb-32 max-w-full md:max-w-4xl">
      <Card className="overflow-hidden border-none shadow-sm md:border md:shadow">
        <CardHeader className="px-4 py-5">
          <CardTitle className="text-xl">Record New Payment</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <form onSubmit={handleSubmit} className="flex flex-col md:grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Collaboration</Label>
              <Select value={selectedCollaboration} onValueChange={setSelectedCollaboration}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Collab" /></SelectTrigger>
                <SelectContent>
                  {collaborations.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Creator</Label>
              <Select value={selectedCreator} onValueChange={setSelectedCreator} disabled={!creators.length}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Creator" /></SelectTrigger>
                <SelectContent>
                  {creators.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.display_name || c.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full" />
            </div>

            <Button type="submit" className="w-full h-11 md:col-span-2 mt-2 ">
              Record Transaction
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm md:border md:shadow">
        <CardHeader className="px-4 py-5">
          <CardTitle className="text-xl">Spend History</CardTitle>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          <div className="w-full">
            <Table>
              {/* Hide headers on mobile to save horizontal space */}
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Collab</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="block md:table-row-group">
                {spendHistory.length === 0 ? (
                  <TableRow className="block md:table-row"><TableCell colSpan={4} className="text-center block md:table-cell py-10">No transactions found.</TableCell></TableRow>
                ) : (
                  spendHistory.map((s) => (
                    /* Mobile: Convert row to a stacked card. Desktop: Keep as standard table row */
                    <TableRow key={s.id} className="block md:table-row border-b mb-4 md:mb-0 pb-4 md:pb-0">
                      <TableCell className="block md:table-cell py-1 px-2 md:py-4">
                        <span className="md:hidden font-bold text-xs text-muted-foreground mr-2 uppercase">Date:</span>
                        {new Date(s.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="block md:table-cell py-1 px-2 md:py-4">
                        <span className="md:hidden font-bold text-xs text-muted-foreground mr-2 uppercase">Collab:</span>
                        <span className="inline-block max-w-[200px] truncate align-bottom">{s.collaboration?.title || 'N/A'}</span>
                      </TableCell>
                      <TableCell className="block md:table-cell py-1 px-2 md:py-4">
                        <span className="md:hidden font-bold text-xs text-muted-foreground mr-2 uppercase">Creator:</span>
                        <span className="inline-block max-w-[200px] truncate align-bottom">{s.creator?.display_name || s.creator?.email || 'N/A'}</span>
                      </TableCell>
                      <TableCell className="block md:table-cell py-1 px-2 md:py-4 text-left md:text-right font-bold text-red-600">
                        <span className="md:hidden font-bold text-xs text-muted-foreground mr-2 uppercase">Amount:</span>
                        Rs. {s.amount}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}