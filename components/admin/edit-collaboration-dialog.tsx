"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { updateCollaboration } from "@/app/actions/admin-collaboration-action";
import { toast } from "sonner";

interface EditCollaborationDialogProps {
  collaboration: any;
  // Update type to accept the updated object
  onUpdate?: (updatedCollab: any) => void;
}

export function EditCollaborationDialog({ collaboration, onUpdate }: EditCollaborationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await updateCollaboration(formData);
      
      if (result?.error) {
        alert("Error: " + result.error);
      } else if (result?.data) {
        // Success!
        toast.success("Details updated successfully");
        setOpen(false);
        
        // Pass the actual updated data back to the parent immediately
        if (onUpdate) {
          onUpdate(result.data);
        }
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Collaboration</DialogTitle>
          <DialogDescription>
            Update details before approving.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={collaboration.id} />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={collaboration.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={collaboration.category} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={collaboration.description} rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea id="requirements" name="requirements" defaultValue={collaboration.requirements} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="compensation">Compensation</Label>
              <Input id="compensation" name="compensation" defaultValue={collaboration.compensation} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" name="deadline" type="date" defaultValue={formatDate(collaboration.deadline)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Pencil } from "lucide-react";
// import { updateCollaboration } from "@/app/actions/admin-collaboration-action";
// import { toast } from "sonner";

// interface EditCollaborationDialogProps {
//   collaboration: any;
//   // Update type to accept the updated object
//   onUpdate?: (updatedCollab: any) => void;
// }

// export function EditCollaborationDialog({ collaboration, onUpdate }: EditCollaborationDialogProps) {
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const formatDate = (dateString: string | null) => {
//     if (!dateString) return "";
//     return new Date(dateString).toISOString().split("T")[0];
//   };

//   const handleSubmit = async (formData: FormData) => {
//     setLoading(true);
//     try {
//       const result = await updateCollaboration(formData);
      
//       if (result?.error) {
//         alert("Error: " + result.error);
//       } else if (result?.data) {
//         // Success!
//         toast.success("Details updated successfully");
//         setOpen(false);
        
//         // Pass the actual updated data back to the parent immediately
//         if (onUpdate) {
//           onUpdate(result.data);
//         }
//       }
//     } catch (error) {
//       console.error(error);
//       alert("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm" className="gap-2 h-8">
//           <Pencil className="h-3 w-3" />
//           Edit
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Edit Collaboration</DialogTitle>
//           <DialogDescription>
//             Update details before approving.
//           </DialogDescription>
//         </DialogHeader>
        
//         <form action={handleSubmit} className="grid gap-4 py-4">
//           <input type="hidden" name="id" value={collaboration.id} />
          
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="title">Title</Label>
//               <Input id="title" name="title" defaultValue={collaboration.title} required />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="category">Category</Label>
//               <Input id="category" name="category" defaultValue={collaboration.category} />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea id="description" name="description" defaultValue={collaboration.description} rows={4} />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="requirements">Requirements</Label>
//             <Textarea id="requirements" name="requirements" defaultValue={collaboration.requirements} rows={3} />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="compensation">Compensation</Label>
//               <Input id="compensation" name="compensation" defaultValue={collaboration.compensation} />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="deadline">Deadline</Label>
//               <Input id="deadline" name="deadline" type="date" defaultValue={formatDate(collaboration.deadline)} />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading ? "Saving..." : "Save Changes"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }