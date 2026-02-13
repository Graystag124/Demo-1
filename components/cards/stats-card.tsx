"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Users, Eye, BarChart, Heart, MessageSquare, Bookmark, PlayCircle, MapPin, Globe, Calendar, AlertCircle, CheckCircle, Ban, HelpCircle, Database, User } from "lucide-react";

const iconComponents: Record<string, LucideIcon> = {
  Users,
  Eye,
  BarChart,
  Heart,
  MessageSquare,
  Bookmark,
  PlayCircle,
  MapPin,
  Globe,
  Calendar,
  AlertCircle,
  CheckCircle,
  Ban,
  HelpCircle,
  Database,
  User,
};

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: string | React.ReactNode;
  color?: string;
  sub?: string;
  trend?: number;
  trendColor?: string;
  className?: string;
};

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  color,
  sub,
  trendColor,
}: StatCardProps) {
  const isPositive = trend !== undefined ? trend >= 0 : null;

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`h-4 w-4 ${color || 'text-muted-foreground'}`}>
          {typeof icon === 'string' && iconComponents[icon] ? 
            (() => {
              const IconComponent = iconComponents[icon];
              return <IconComponent className="h-4 w-4" />;
            })() : 
            icon
          }
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend !== undefined && (
          <div className="mt-2 flex items-center">
            <span className={`text-sm ${trendColor || (isPositive ? 'text-green-500' : 'text-red-500')}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
