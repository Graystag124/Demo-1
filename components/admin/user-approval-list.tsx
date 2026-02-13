"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  AlertTriangle,
  Eye,
  User as UserIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserActionButtons } from "./user-action-buttons";
import { toast } from "sonner";

interface User {
  id: string;
  display_name: string;
  email: string;
  user_type: string;
  approval_status: string;
  created_at: string;
  profile_image_url?: string;
  deletion_reason?: string;
  deletion_request_id?: string;
  request_date?: string;
}

interface UserApprovalListProps {
  userType?: string;
  status: string;
  initialUsers?: User[];
}

export function UserApprovalList({ userType, status, initialUsers = [] }: UserApprovalListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const isDeletionTab = status === 'delete_requested';

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        if (isDeletionTab) {
          const { data: requestData, error } = await supabase
            .from("deletion_requests")
            .select(`
              id,
              reason,
              created_at,
              status,
              users:user_id (*)
            `)
            .eq("status", "pending")
            .order("created_at", { ascending: false });

          if (error) throw error;
          
          if (requestData) {
            const filteredUsers = requestData
              .filter((item: any) => !userType || item.users?.user_type === userType)
              .map((item: any) => ({
                ...item.users,
                deletion_reason: item.reason,
                deletion_request_id: item.id,
                request_date: item.created_at
              }));
            setUsers(filteredUsers);
          }
        } else {
          let query = supabase
            .from("users")
            .select("*")
            .eq("approval_status", status)
            .order("created_at", { ascending: false });

          if (userType) {
            query = query.eq("user_type", userType);
          }

          const { data: userData, error } = await query;
          if (error) throw error;
          setUsers(userData || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have initial users or if the status changes
    if (initialUsers.length === 0) {
      fetchUsers();
    } else {
      setUsers(initialUsers);
    }
  }, [status, userType, isDeletionTab]);

  const getTabLink = (tabStatus: string) => {
    let path = "/admin";
    if (userType) {
      path += `/${userType}s`;
    }
    return `${path}?status=${tabStatus}`;
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, approval_status: newStatus }
          : user
      )
    );
  };

  const handleDeleteSuccess = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const pageTitle = isDeletionTab 
    ? "Account Deletion Requests"
    : userType 
      ? `${userType.charAt(0).toUpperCase() + userType.slice(1)} Approvals` 
      : "All User Approvals";

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold capitalize text-slate-900">{pageTitle}</h1>
              <p className="text-slate-500 mt-1">
                  {isDeletionTab 
                    ? "Review and process account removal requests." 
                    : `Manage ${userType || "user"} accounts.`}
              </p>
            </div>
        </div>

        <div className="overflow-x-auto pb-2 md:pb-0">
            <Tabs defaultValue={status} className="w-full md:w-auto">
                <TabsList className="bg-slate-100">
                    <Link href={getTabLink("pending")}>
                        <TabsTrigger value="pending" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                            Pending
                        </TabsTrigger>
                    </Link>
                    <Link href={getTabLink("approved")}>
                        <TabsTrigger value="approved" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                            Approved
                        </TabsTrigger>
                    </Link>
                    <Link href={getTabLink("rejected")}>
                        <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                            Rejected
                        </TabsTrigger>
                    </Link>
                    <Link href={getTabLink("delete_requested")}>
                        <TabsTrigger value="delete_requested" className="gap-2 data-[state=active]:bg-red-900 data-[state=active]:text-white">
                            <Trash2 className="h-3 w-3" />
                            Deletion Requests
                        </TabsTrigger>
                    </Link>
                </TabsList>
            </Tabs>
        </div>
      </div>

      {/* List Section */}
      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users && users.length > 0 ? (
          users.map((u) => (
            <Card key={u.id} className={cn(
                "bg-white border-slate-200 hover:border-slate-300 transition-colors text-sm",
                isDeletionTab && "border-red-200/30 bg-red-50"
            )}>
              <CardContent className="p-3 md:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                
                {/* User Info with Clickable Avatar and Name */}
                <div className="flex items-start gap-3 flex-1">
                  {/* Avatar / DP */}
                  <Link href={`/admin/users/${u.id}`} className="shrink-0 transition-opacity hover:opacity-80">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                      {u.profile_image_url ? (
                        <img 
                          src={u.profile_image_url} 
                          alt={u.display_name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </Link>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/users/${u.id}`} className="hover:underline decoration-slate-400 underline-offset-2">
                        <h3 className="font-medium text-base text-slate-900 leading-tight">
                          {u.display_name || "No Name"}
                        </h3>
                      </Link>
                      
                      <Badge variant="outline" className="h-5 border-slate-200 text-slate-500 capitalize bg-slate-50 text-[11px] px-1.5">
                        {u.user_type}
                      </Badge>
                      
                      <Badge className={cn("capitalize h-5 text-[11px] px-1.5", 
                          u.approval_status === 'approved' ? "bg-green-100 text-green-800" :
                          u.approval_status === 'rejected' ? "bg-red-100 text-red-800" :
                          u.approval_status === 'delete_requested' ? "bg-red-600 text-white" :
                          "bg-orange-100 text-orange-800"
                      )}>
                          {u.approval_status === 'delete_requested' ? "Deletion" : u.approval_status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">{u.email}</p>
                    
                    {isDeletionTab && u.deletion_reason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                          <div>
                              <span className="text-[11px] font-bold text-red-600 uppercase">Reason:</span>
                              <p className="text-xs text-slate-700 italic">"{u.deletion_reason}"</p>
                          </div>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 pt-0.5">
                      {isDeletionTab 
                          ? `Requested: ${new Date(u.request_date).toLocaleDateString()}` 
                          : `Joined: ${new Date(u.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2 xl:mt-0">
                   {!isDeletionTab && (
                       <div className="hidden md:block text-right border-r border-slate-200 pr-4">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                            Meta Status
                          </p>
                          <Badge 
                            variant="secondary" 
                            className={u.meta_user_id ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}
                          >
                            {u.meta_user_id ? "Connected" : "No Connection"}
                          </Badge>
                       </div>
                   )}

                   <div className="flex items-center gap-2 mt-2 xl:mt-0">
                      {(status === 'pending' || isDeletionTab) && (
                        <UserActionButtons 
                            userId={u.id} 
                            isDeletionRequest={isDeletionTab}
                            requestId={u.deletion_request_id}
                            onStatusChange={(status) => handleStatusChange(u.id, status)}
                            onDeleteSuccess={() => handleDeleteSuccess(u.id)}
                        />
                      )}

                      <Link href={`/admin/users/${u.id}`}>
                        <Button variant="outline" size="sm" className="h-7 px-2">
                          <Eye className="h-3 w-3 mr-1" />
                          <span className="text-xs">View</span>
                        </Button>
                      </Link>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          /* Empty State */
          <Card className="bg-slate-50 border-slate-200 border-dashed p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              {status === 'approved' ? <CheckCircle className="h-12 w-12 text-slate-400" /> : 
               status === 'rejected' ? <XCircle className="h-12 w-12 text-slate-400" /> :
               status === 'delete_requested' ? <Trash2 className="h-12 w-12 text-slate-400" /> :
               <Clock className="h-12 w-12 text-slate-400" />
              }
              <h3 className="text-xl font-medium text-slate-800">
                {status === 'delete_requested' ? "No deletion requests" : `No ${status} users`}
              </h3>
              <p className="text-slate-500 max-w-sm">
                {status === 'delete_requested' 
                    ? "There are currently no users requesting account deletion."
                    : `There are currently no ${userType || ""} users with the status "${status}".`
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}