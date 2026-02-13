"use client";

import { useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Briefcase, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Types
interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  created_at: string;
  collaborations?: { title: string } | null;
  creator?: { display_name: string | null; profile_image_url: string | null } | null;
}

interface BusinessWithSpend {
  id: string;
  display_name: string | null;
  email: string;
  profile_image_url: string | null;
  totalSpend: number;
  transactions: Transaction[];
}

export function SpendListTable({ data }: { data: BusinessWithSpend[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Spend Overview</CardTitle>
        <CardDescription>View detailed transaction history by business and creator.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((business) => {
                const isExpanded = expandedRows.has(business.id);
                const hasTransactions = business.transactions.length > 0;

                return (
                  <Fragment key={business.id}>
                    <TableRow
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        isExpanded && "bg-muted/50 border-b-0"
                      )}
                      onClick={() => hasTransactions && toggleRow(business.id)}
                    >
                      <TableCell>
                        {hasTransactions && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={business.profile_image_url || ""} />
                            <AvatarFallback>{business.display_name?.[0] || "B"}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{business.display_name}</span>
                            <span className="text-xs text-muted-foreground">{business.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{business.transactions.length} Records</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatCurrency(business.totalSpend)}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={4} className="p-0">
                          <div className="px-12 py-4 border-b">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-none">
                                  <TableHead className="text-xs">Date</TableHead>
                                  <TableHead className="text-xs">Collaboration</TableHead>
                                  <TableHead className="text-xs">Creator</TableHead>
                                  <TableHead className="text-xs">Description</TableHead>
                                  <TableHead className="text-right text-xs">Amount</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {business.transactions.map((tx) => (
                                  <TableRow key={tx.id} className="hover:bg-background/80 border-none">
                                    <TableCell className="text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(tx.created_at), "MMM dd")}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      <div className="flex items-center gap-2 text-primary font-medium">
                                        <Briefcase className="w-3 h-3" />
                                        <span className="truncate max-w-[150px]">
                                          {tx.collaborations?.title || "Manual"}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {tx.creator ? (
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-5 w-5">
                                            <AvatarImage src={tx.creator.profile_image_url || ""} />
                                            <AvatarFallback className="text-[9px]">
                                              {tx.creator.display_name?.[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="truncate max-w-[120px]">{tx.creator.display_name}</span>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-sm max-w-[200px] truncate">
                                      {tx.description}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                                      {formatCurrency(Number(tx.amount))}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No spend data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {data.map((business) => {
            const isExpanded = expandedRows.has(business.id);
            const hasTransactions = business.transactions.length > 0;

            return (
              <Card key={business.id} className="border">
                <CardContent className="p-4">
                  {/* Business Header */}
                  <div 
                    className={cn(
                      "flex items-center justify-between cursor-pointer",
                      hasTransactions && "hover:bg-muted/50 -mx-4 px-4 py-2 -my-2 rounded-md transition-colors"
                    )}
                    onClick={() => hasTransactions && toggleRow(business.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={business.profile_image_url || ""} />
                        <AvatarFallback>{business.display_name?.[0] || "B"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{business.display_name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{business.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(business.totalSpend)}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {business.transactions.length} Records
                        </Badge>
                      </div>
                      {hasTransactions && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Transactions */}
                  {isExpanded && hasTransactions && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      {business.transactions.map((tx) => (
                        <div key={tx.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(tx.created_at), "MMM dd, yyyy")}
                            </div>
                            <span className="font-medium text-sm text-red-600">
                              {formatCurrency(Number(tx.amount))}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="w-3 h-3 text-primary" />
                              <span className="font-medium text-primary truncate">
                                {tx.collaborations?.title || "Manual Transaction"}
                              </span>
                            </div>
                            
                            {tx.creator && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={tx.creator.profile_image_url || ""} />
                                  <AvatarFallback className="text-[8px]">
                                    {tx.creator.display_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{tx.creator.display_name}</span>
                              </div>
                            )}
                            
                            {tx.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No spend data found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}