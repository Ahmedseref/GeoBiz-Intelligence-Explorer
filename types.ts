
export interface Business {
  id: string;
  name: string;
  industry: string;
  activities: string[];
  rating: number;
  address: string;
  location: { lat: number; lng: number };
  url?: string;
  popularityScore: number;
  // Contact Info
  phone?: string;
  website?: string;
  email?: string;
  contactPerson?: {
    name: string;
    role: string;
  };
}

export interface AnalyticsData {
  industryDistribution: { name: string; value: number }[];
  ratingDistribution: { rating: string; count: number }[];
  activityFrequency: { activity: string; count: number }[];
}

export interface SearchResponse {
  businesses: Business[];
  summary: string;
  analytics: AnalyticsData;
  groundingLinks: Array<{ title: string; uri: string }>;
}
