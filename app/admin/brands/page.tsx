'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, TrendingUp, Users, ArrowUpRight, Search, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

type Brand = {
  id: string;
  display_name: string;
  email: string;
  profile_image_url: string;
  website?: string;
  created_at: string;
  collabCount: number;
  totalSpend: number;
  activeCollabs: number;
  rank: number;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchTopBrands();
  }, [timeRange]);

  const fetchTopBrands = async () => {
    try {
      setLoading(true);
      
      let dateFilter = new Date();
      if (timeRange === 'week') {
        dateFilter.setDate(dateFilter.getDate() - 7);
      } else if (timeRange === 'month') {
        dateFilter.setMonth(dateFilter.getMonth() - 1);
      }

      // QUERY 1: Fetch Brands and their Collaborations (without payments to avoid the join error)
      const { data: brandsData, error: brandsError } = await supabase
        .from('users')
        .select(`
          *,
          collaborations:collaborations!business_id (
            id,
            created_at,
            status:approval_status
          )
        `)
        .eq('user_type', 'business')
        .eq('approval_status', 'approved');

      if (brandsError) throw brandsError;
      if (!brandsData) return;

      // QUERY 2: Fetch all business transactions (debits only)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('business_transactions')
        .select('amount, reference_id, type, business_id, created_at, description')
        .eq('type', 'debit');

      if (transactionsError) {
        console.warn('Could not fetch transactions, spend will be 0:', transactionsError.message);
      }

      // Debug: Log all transactions for the specific business
      const specificBusinessId = 'd6988560-10cc-45a7-90ff-04fd58ed63d7';
      const specificBusinessTx = transactionsData?.filter(tx => tx.business_id === specificBusinessId);
      console.log('Transactions for business', specificBusinessId, ':', specificBusinessTx);

      // Create a map of collaboration_id -> total_amount for fast lookup
      const spendMap: Record<string, number> = {};
      transactionsData?.forEach(tx => {
        if (tx.reference_id) { // Only include transactions with a reference_id (collaboration_id)
          const amount = Number(tx.amount) || 0;
          spendMap[tx.reference_id] = (spendMap[tx.reference_id] || 0) + amount;
          
          // Debug log for the specific transaction
          if (tx.business_id === specificBusinessId) {
            console.log('Processing transaction for business', specificBusinessId, ':', {
              reference_id: tx.reference_id,
              amount: tx.amount,
              totalForRef: spendMap[tx.reference_id],
              date: tx.created_at,
              description: tx.description
            });
          }
        }
      });
      
      console.log('Final spendMap:', spendMap);

      // Process and Calculate Metrics
      let processedBrands = brandsData.map(brand => {
        const filteredCollabs = brand.collaborations?.filter((collab: any) => {
          if (timeRange === 'all') return true;
          return new Date(collab.created_at) >= dateFilter;
        }) || [];

        // Debug: Log collaborations for the specific business
        if (brand.id === specificBusinessId) {
          console.log('Collaborations for business', specificBusinessId, ':', filteredCollabs);
        }

        // Sum up spend using our transactions lookup map
        let totalSpend = 0;
        const collabSpends: Record<string, number> = {};
        
        filteredCollabs.forEach((collab: any) => {
          const collabSpend = spendMap[collab.id] || 0;
          collabSpends[collab.id] = collabSpend;
          totalSpend += collabSpend;
        });

        // Debug: Log spend details for the specific business
        if (brand.id === specificBusinessId) {
          console.log('Spend details for business', specificBusinessId, ':', {
            collabSpends,
            totalSpend,
            spendMapKeys: Object.keys(spendMap)
          });
        }

        const activeCollabs = filteredCollabs.filter(
          (collab: any) => collab.status === 'approved'
        ).length;

        return {
          id: brand.id,
          display_name: brand.display_name || 'Unnamed Brand',
          email: brand.email,
          profile_image_url: brand.profile_image_url,
          collabCount: filteredCollabs.length,
          totalSpend,
          activeCollabs,
          created_at: brand.created_at
        };
      });
      
      // Debug: Log the final processed brand data
      const specificBrand = processedBrands.find(b => b.id === specificBusinessId);
      if (specificBrand) {
        console.log('Processed brand data for', specificBusinessId, ':', specificBrand);
      } else {
        console.log('Brand', specificBusinessId, 'not found in processed brands');
      }

      // MULTI-LEVEL SORTING (Spend first, then Collab count)
      processedBrands.sort((a, b) => {
        if (b.totalSpend !== a.totalSpend) return b.totalSpend - a.totalSpend;
        return b.collabCount - a.collabCount;
      });

      // Assign fixed Ranks
      const rankedBrands = processedBrands.map((brand, index) => ({
        ...brand,
        rank: index + 1
      })) as Brand[];

      setBrands(rankedBrands);
    } catch (error: any) {
      console.error('Error in fetchTopBrands:', error.message);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = useMemo(() => {
    return brands.filter(brand => 
      brand.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, brands]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatCurrency = (amount: number) => {
    // Format as Indian Rupees (₹) without decimal places
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brand Leaderboard</h1>
          <p className="text-sm text-slate-500 mt-1">Global rankings by investment and collaborations.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search brands..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
            {(['week', 'month', 'all'] as const).map((range) => (
              <Button 
                key={range}
                variant={timeRange === range ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setTimeRange(range)}
                className="capitalize h-8 text-xs px-3"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredBrands.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-xl">
          <p className="text-slate-400">No brands found matching "{searchQuery}"</p>
          <Button variant="link" onClick={() => setSearchQuery('')}>Clear search</Button>
        </div>
      ) : (
        <>
          {!searchQuery && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBrands.slice(0, 3).map((brand) => (
                <Card key={brand.id} className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                          <AvatarImage src={brand.profile_image_url || ''} />
                          <AvatarFallback>{brand.display_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black">
                          {brand.rank}
                        </div>
                      </div>
                      <div className="max-w-[150px]">
                        <h3 className="font-bold text-slate-900 truncate">{brand.display_name}</h3>
                        <p className="text-xs text-slate-500 truncate">{brand.email}</p>
                      </div>
                    </div>
                    <div className="text-2xl">{getRankBadge(brand.rank)}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-blue-100/50 my-2">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Total Spend</p>
                        <p className="font-bold text-sm">{formatCurrency(brand.totalSpend)}</p>
                      </div>
                      <div className="text-center border-x border-blue-100/50">
                        <p className="text-[10px] text-slate-400 uppercase">Collabs</p>
                        <p className="font-bold text-sm">{brand.collabCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Active</p>
                        <p className="font-bold text-sm text-green-600">{brand.activeCollabs}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2 hover:bg-blue-100/50 text-xs" asChild>
                      <Link href={`/admin/users/${brand.id}`}>View Brand Dashboard <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50/50 p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5 sm:col-span-4">Brand</div>
              <div className="hidden sm:block col-span-2 text-center">Total Spend</div>
              <div className="col-span-3 sm:col-span-2 text-center">Collaborations</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1"></div>
            </div>
            
            {(searchQuery ? filteredBrands : filteredBrands.slice(3)).map((brand) => (
              <div key={brand.id} className="grid grid-cols-12 items-center p-4 border-b last:border-0 hover:bg-slate-50/80 transition-all group">
                <div className="col-span-1 font-mono text-sm text-slate-400">
                  {brand.rank <= 3 ? getRankBadge(brand.rank) : `#${brand.rank}`}
                </div>
                <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                  <Avatar className="h-9 w-9 border group-hover:border-blue-200 transition-colors">
                    <AvatarImage src={brand.profile_image_url} />
                    <AvatarFallback>{brand.display_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <p className="font-semibold text-sm text-slate-900 truncate">{brand.display_name}</p>
                    <p className="text-xs text-slate-500 truncate">{brand.email}</p>
                  </div>
                </div>
                <div className="hidden sm:block col-span-2 text-center">
                  <Badge variant="outline" className="font-bold border-blue-100 text-blue-700 bg-blue-50/30">
                    {formatCurrency(brand.totalSpend)}
                  </Badge>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center">
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                    <Users className="h-3 w-3 text-blue-500" />
                    {brand.collabCount}
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {brand.activeCollabs} Active
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                    <Link href={`/admin/brands/${brand.id}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}