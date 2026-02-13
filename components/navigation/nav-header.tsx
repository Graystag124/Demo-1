import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth/logout-button';
import { User } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';

export async function NavHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userData = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('display_name, profile_image_url, user_type, approval_status')
      .eq('id', user.id)
      .single();
    userData = data;
  }

  return (
    <header className="border-b bg-background text-foreground">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          <div className="flex items-center">
            <Image
              src="/Byberr 1.svg"
              alt="Byberr"
              width={82}
              height={32}
              className="h-8 w-auto brightness-0 dark:invert dark:brightness-100"
              style={{ width: 'auto', height: '2rem' }}
              priority
            />
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <ThemeToggle />
          {user && userData?.approval_status === 'approved' ? (
            <>
              <Link
                href="/dashboard"
                className="text-xs font-medium text-black hover:text-green-600 transition-colors md:text-sm md:text-white/80 md:hover:text-white ml-auto"
              >
                Dashboard
              </Link>
              <Link
                href="/collaborations"
                className="text-xs font-medium text-black hover:text-green-600 transition-colors md:text-sm md:text-white/80 md:hover:text-white"
              >
                Collaborations
              </Link>
              <Link
                href="/insights"
                className="text-xs font-medium text-black hover:text-green-600 transition-colors md:text-sm md:text-white/80 md:hover:text-white"
              >
                Insights
              </Link>
              {userData?.user_type === 'admin' && (
                <Link
                  href="/admin"
                  className="text-xs font-medium text-black hover:text-green-600 transition-colors md:text-sm md:text-white/80 md:hover:text-white"
                >
                  Admin
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                    <Avatar className="h-10 w-10 border border-white/20">
                      <AvatarImage src={userData?.profile_image_url || undefined} />
                      <AvatarFallback className="bg-white/10">
                        <User className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userData?.display_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/edit">Edit Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium leading-none">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
