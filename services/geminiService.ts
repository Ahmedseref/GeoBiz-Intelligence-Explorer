
import { GoogleGenAI } from "@google/genai";
import { SearchResponse, Business } from "../types";

export const performSmartSearch = async (
  query: string,
  location?: { latitude: number; longitude: number },
  geography?: string
): Promise<SearchResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const geoContext = geography ? `specifically in the region of ${geography}` : "near the user's current location";

  const systemInstruction = `
    You are an expert business intelligence analyst. 
    Use Google Maps grounding to find real businesses matching the user's query: "${query}" ${geoContext}.
    
    Your task is to:
    1. Identify at least 5-10 relevant businesses if possible.
    2. Map them to standardized industries (e.g., 'Hospitality', 'Technology', 'Retail', 'Wellness', 'Finance', 'Manufacturing').
    3. Identify multiple specific activities for each company.
    4. Provide a structured summary of the market landscape.
    5. CONTACT DETAILS: For each company, try to find their phone number, website, and an official contact person or representative if available in public records.
    6. DATA OUTPUT: You MUST include a valid JSON array of the businesses found. 
       Wrap the JSON block between the markers [DATA_START] and [DATA_END].
       Structure for each object in the array:
       {
         "name": string,
         "industry": string,
         "activities": string[],
         "rating": number (1-5),
         "address": string,
         "popularityScore": number (1-100),
         "lat": number,
         "lng": number,
         "url": string (Google Maps URL),
         "phone": string (e.g., "+1-555-0199"),
         "website": string (URL),
         "email": string (if available),
         "contactPerson": {
           "name": string,
           "role": string
         } (optional)
       }
    
    Be extremely precise with the JSON formatting. Use current location data if provided to bias search results.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Perform a deep market analysis for "${query}" in "${geography || 'the local area'}". Find businesses and list their activities, contact info, and key personnel.`,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location ? {
              latitude: location.latitude,
              longitude: location.longitude
            } : undefined
          }
        }
      }
    });

    const fullText = response.text || "";
    
    let jsonString = "";
    const dataStartTag = "[DATA_START]";
    const dataEndTag = "[DATA_END]";
    
    if (fullText.includes(dataStartTag) && fullText.includes(dataEndTag)) {
      jsonString = fullText.split(dataStartTag)[1].split(dataEndTag)[0].trim();
    } else {
      const markdownMatch = fullText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (markdownMatch) {
        jsonString = markdownMatch[1].trim();
      }
    }

    let parsedBusinesses: any[] = [];
    if (jsonString) {
      try {
        const startIdx = jsonString.indexOf('[');
        const endIdx = jsonString.lastIndexOf(']') + 1;
        if (startIdx !== -1 && endIdx !== -1) {
          const cleanedJson = jsonString.substring(startIdx, endIdx);
          parsedBusinesses = JSON.parse(cleanedJson);
        }
      } catch (e) {
        console.error("Failed to parse extracted JSON string:", jsonString, e);
      }
    }

    const industriesMap = new Map<string, number>();
    const activitiesMap = new Map<string, number>();
    const ratingsMap = new Map<string, number>([
      ['1-2', 0], ['2-3', 0], ['3-4', 0], ['4-5', 0]
    ]);

    parsedBusinesses.forEach(b => {
      const industry = b.industry || "Other";
      industriesMap.set(industry, (industriesMap.get(industry) || 0) + 1);
      
      if (Array.isArray(b.activities)) {
        b.activities.forEach((a: string) => activitiesMap.set(a, (activitiesMap.get(a) || 0) + 1));
      }
      
      const rating = typeof b.rating === 'number' ? b.rating : 0;
      if (rating >= 4) ratingsMap.set('4-5', (ratingsMap.get('4-5') || 0) + 1);
      else if (rating >= 3) ratingsMap.set('3-4', (ratingsMap.get('3-4') || 0) + 1);
      else if (rating >= 2) ratingsMap.set('2-3', (ratingsMap.get('2-3') || 0) + 1);
      else ratingsMap.set('1-2', (ratingsMap.get('1-2') || 0) + 1);
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingLinks = groundingChunks
      .filter(chunk => chunk.maps)
      .map(chunk => ({
        title: chunk.maps?.title || "Business Link",
        uri: chunk.maps?.uri || ""
      }));

    return {
      businesses: parsedBusinesses.map((b, i) => ({
        ...b,
        id: `biz-${i}`,
        location: { 
          lat: b.lat || (location?.latitude || 0), 
          lng: b.lng || (location?.longitude || 0) 
        },
        url: b.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' ' + (b.address || ''))}`
      })),
      summary: fullText.split('[DATA_START]')[0].replace(/```[\s\S]*?```/, "").trim() || "Analysis complete.",
      analytics: {
        industryDistribution: Array.from(industriesMap.entries()).map(([name, value]) => ({ name, value })),
        ratingDistribution: Array.from(ratingsMap.entries()).map(([rating, count]) => ({ rating, count })),
        activityFrequency: Array.from(activitiesMap.entries()).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([activity, count]) => ({ activity, count })),
      },
      groundingLinks
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
