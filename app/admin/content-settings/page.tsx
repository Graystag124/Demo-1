'use client';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function ContentSettingsPage() {
  const router = useRouter();

  const settings = [
    { title: 'Cuisines', description: 'Manage available cuisines', path: '/admin/cuisines' },
    { title: 'Privacy Policy', description: 'Manage platform privacy policy', path: '/admin/privacy' },
    { title: 'Categories', description: 'Manage collaboration categories', path: '/admin/categories' },
    { title: 'Venue Types', description: 'Manage different types of venues', path: '/admin/venue-types' },
    { title: 'Experience Types', description: 'Manage different types of experiences', path: '/admin/experience-types' },
    { title: 'FAQs', description: 'Manage frequently asked questions', path: '/admin/faqs' },
    { title: 'Content Moderation', description: 'Moderate user-generated content', path: '/admin/moderation', disabled: true }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Content Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your content configuration and organization
        </p>
      </div>

      <div className="flex flex-wrap gap-6 justify-start">
        {settings.map((setting) => (
          <Card 
            key={setting.path} 
            // Fixed height to h-36 (slightly shorter) and increased width to w-60
            // Changed justify-between to justify-center to remove the gap
            className="transition-all hover:shadow-lg h-36 w-50 flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] border-none shadow-sm bg-white"
          >
            {/* Text container */}
            <div className="flex flex-col items-center text-center">
              <CardTitle className="text-sm font-bold text-slate-800">
                {setting.title}
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500 line-clamp-1">
                {setting.description}
              </CardDescription>
            </div>
            
            {/* Reduced Button: Not full width, shorter height, smaller text */}
            <Button 
              onClick={() => router.push(setting.path)}
              disabled={setting.disabled}
              className="w-28 bg-[#00E676] hover:bg-[#00c853] text-slate-800 font-bold rounded-full h-6 text-[10px] shadow-sm"
            >
              {setting.disabled ? 'Soon' : 'Manage'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}