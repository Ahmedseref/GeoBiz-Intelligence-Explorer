
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SearchBar } from './components/SearchBar';
import { Analytics } from './components/Analytics';
import { IndustryExplorer } from './components/IndustryExplorer';
import { BusinessTable } from './components/BusinessTable';
import { performSmartSearch } from './services/geminiService';
import { SearchResponse } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => console.warn("Geolocation not available")
      );
    }
  }, []);

  const handleSearch = async (query: string, geography: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await performSmartSearch(query, location, geography);
      setData(result);
    } catch (err) {
      setError("Failed to fetch business data. Please check your API key and network connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          GeoBiz Market <span className="text-blue-600">Intelligence</span>
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
          Uncover multi-faceted business activities and geographic trends using AI-powered semantic mapping.
        </p>
      </div>

      <SearchBar onSearch={handleSearch} isLoading={loading} />

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {data && (
        <div className="space-y-12 animate-in fade-in duration-700">
          {/* Executive Summary Section */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Market Insight Summary
              </h3>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-medium mb-10 whitespace-pre-wrap">
                {data.summary}
              </div>
              
              {data.groundingLinks.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {data.groundingLinks.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 px-4 py-2 rounded-xl border border-slate-100 transition-all font-bold shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Analytics Visualizations */}
          <Analytics data={data.analytics} />
          
          {/* Interactive Geographic & Industry Explorer (Map View) */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
              <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-100">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l5-2.5 5.553 2.776a1 1 0 01.447.894v10.764a1 1 0 01-1.447.894L15 17l-6 3z" />
                </svg>
              </div>
              Industry Geographic Navigator
            </h3>
            <IndustryExplorer 
              businesses={data.businesses} 
              center={location ? { lat: location.latitude, lng: location.longitude } : undefined} 
            />
          </div>

          {/* Master Company Registry (The Table) - Always Visible */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-xl shadow-emerald-100">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                Business Intelligence Registry
              </h3>
              <span className="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {data.businesses.length} Total Entities
              </span>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <BusinessTable businesses={data.businesses} />
            </div>
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="text-center py-20 animate-in fade-in duration-1000">
          <div className="inline-block p-10 rounded-full bg-blue-50 mb-8 border border-blue-100 shadow-inner">
            <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Ready for Market Mapping?</h3>
          <p className="text-slate-500 mt-3 font-medium">Enter keywords and a region above to visualize business ecosystems.</p>
        </div>
      )}
    </Layout>
  );
};

export default App;
