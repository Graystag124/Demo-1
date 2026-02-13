'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { MapPin, Globe, Users, User } from 'lucide-react';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300'
];

type AudienceData = {
  ageRanges: Record<string, number>;
  genders: Record<string, number>;
  cities: Array<{ name: string; value: number }>;
  countries: Array<{ name: string; value: number }>;
};

type AudienceDemographicsProps = {
  audience: AudienceData;
};

export function AudienceDemographics({ audience }: AudienceDemographicsProps) {
  // Transform data for charts
  const ageData = Object.entries(audience.ageRanges || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const genderData = Object.entries(audience.genders || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const topCities = audience.cities?.slice(0, 5) || [];
  const topCountries = audience.countries?.slice(0, 5) || [];

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Users className="w-5 h-5 mr-2 text-gray-700" />
        Audience Demographics
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={40} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <CardTitle className="text-base font-medium">Top Cities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCities.length > 0 ? (
                topCities.map((city, index) => (
                  <div key={city.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{city.name}</span>
                    <span className="text-sm text-gray-600">{city.value.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No city data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-600" />
              <CardTitle className="text-base font-medium">Top Countries</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCountries.length > 0 ? (
                topCountries.map((country, index) => (
                  <div key={country.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{country.name}</span>
                    <span className="text-sm text-gray-600">{country.value.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No country data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
