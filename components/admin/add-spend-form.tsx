'use client'

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { 
  recordBusinessSpend, 
  getBusinessCollaborations, 
  getCollabCreators,
  getExistingSpend 
} from "@/app/admin/business-spend/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, DollarSign, Building2, Briefcase, User, IndianRupee } from "lucide-react";
import { toast } from "sonner";

// ... Keep Interfaces ... 
interface Business { id: string; display_name: string | null; email: string; }
interface Collab { id: string; title: string; status: string; }
interface Creator { id: string; display_name: string | null; email: string; }

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} variant={isEditMode ? "secondary" : "default"}>
      {pending ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
      ) : (
        isEditMode ? "Update Existing Expenditure" : "Add New Expenditure"
      )}
    </Button>
  );
}

export function AddSpendForm({ businesses }: { businesses: Business[] }) {
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [selectedCollab, setSelectedCollab] = useState<string>("");
  
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string>("");

  const [loadingCollabs, setLoadingCollabs] = useState(false);
  const [loadingCreators, setLoadingCreators] = useState(false);
  
  // State for Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingAmount, setExistingAmount] = useState("");
  const [existingDesc, setExistingDesc] = useState("");

  // 1. Fetch Collaborations when Business changes
  useEffect(() => {
    setSelectedCollab(""); 
    setCollabs([]);
    if (!selectedBusiness) return;

    async function fetch() {
      setLoadingCollabs(true);
      try {
        const data = await getBusinessCollaborations(selectedBusiness);
        setCollabs(data || []);
      } catch (e) { toast.error("Failed to load collaborations"); }
      setLoadingCollabs(false);
    }
    fetch();
  }, [selectedBusiness]);

  // 2. Fetch Creators when Collab changes
  useEffect(() => {
    setSelectedCreator("");
    setCreators([]);
    if (!selectedCollab) return;

    async function fetch() {
      setLoadingCreators(true);
      try {
        const data = await getCollabCreators(selectedCollab);
        setCreators(data || []);
      } catch (e) { toast.error("Failed to load creators"); }
      setLoadingCreators(false);
    }
    fetch();
  }, [selectedCollab]);

  // 3. Check for Existing Spend when Creator changes
  useEffect(() => {
    setIsEditMode(false);
    setExistingAmount("");
    setExistingDesc("");
    
    if (!selectedCollab || !selectedCreator) return;

    async function checkExisting() {
      try {
        const data = await getExistingSpend(selectedCollab, selectedCreator);
        if (data) {
          setIsEditMode(true);
          setExistingAmount(data.amount.toString());
          setExistingDesc(data.description || "");
          toast.info("Existing record found. Switching to edit mode.");
        }
      } catch (e) { console.error(e); }
    }
    checkExisting();
  }, [selectedCreator, selectedCollab]);

  const handleSubmit = async (formData: FormData) => {
    const result = await recordBusinessSpend(null, formData);
    if (result?.error) toast.error(typeof result.error === 'string' ? result.error : "Error");
    if (result?.success) {
      toast.success(result.success);
      // Optional: Don't clear form immediately to allow seeing the update
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Collaboration Spend</CardTitle>
        <CardDescription>
            Select a business, collaboration, and creator to record or update expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          
          {/* Business */}
          <div className="space-y-2">
            <Label>1. Select Business</Label>
            <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <Select name="businessId" onValueChange={setSelectedBusiness} required>
                <SelectTrigger>
                    <SelectValue placeholder="Select Business..." />
                </SelectTrigger>
                <SelectContent>
                    {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.display_name} ({b.email})</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
          </div>

          {/* Collaboration */}
          <div className="space-y-2">
            <Label>2. Select Collaboration</Label>
            <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <Select name="collaborationId" onValueChange={setSelectedCollab} disabled={!selectedBusiness || loadingCollabs} required>
                <SelectTrigger>
                    <SelectValue placeholder={loadingCollabs ? "Loading..." : "Select Collaboration..."} />
                </SelectTrigger>
                <SelectContent>
                    {collabs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
          </div>

          {/* Creator */}
          <div className="space-y-2">
            <Label>3. Select Assigned Creator</Label>
            <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Select name="creatorId" onValueChange={setSelectedCreator} disabled={!selectedCollab || loadingCreators} required>
                <SelectTrigger>
                    <SelectValue placeholder={loadingCreators ? "Loading..." : "Select Creator..."} />
                </SelectTrigger>
                <SelectContent>
                    {creators.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.display_name} ({c.email})</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            {selectedCollab && creators.length === 0 && !loadingCreators && (
                <p className="text-xs text-amber-600">No approved creators found for this collaboration.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    name="amount" type="number" step="0.01" min="0" placeholder="0.00" 
                    className="pl-9" required 
                    defaultValue={existingAmount}
                    key={existingAmount} // Force re-render on edit
                />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                    name="description" placeholder="Details..." required 
                    defaultValue={existingDesc}
                    key={existingDesc}
                    className="min-h-[40px] max-h-[40px] resize-none"
                />
            </div>
          </div>

          <SubmitButton isEditMode={isEditMode} />
        </form>
      </CardContent>
    </Card>
  );
}