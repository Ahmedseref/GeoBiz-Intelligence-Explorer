
import React, { useState, useMemo } from 'react';
import { Business } from '../types';
import { BusinessList } from './BusinessList';
import { MapView } from './MapView';

interface IndustryExplorerProps {
  businesses: Business[];
  center?: { lat: number; lng: number };
}

type ViewMode = 'grid' | 'map';

export const IndustryExplorer: React.FC<IndustryExplorerProps> = ({ businesses, center }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  const groupedBusinesses = useMemo(() => {
    const groups: Record<string, Business[]> = { 'All': businesses };
    businesses.forEach((biz) => {
      const industry = biz.industry || 'Other';
      if (!groups[industry]) groups[industry] = [];
      groups[industry].push(biz);
    });
    return groups;
  }, [businesses]);

  const industries = useMemo(() => Object.keys(groupedBusinesses).sort(), [groupedBusinesses]);
  const currentBusinesses = groupedBusinesses[selectedIndustry] || [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter Industry:</span>
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border-2 ${
                selectedIndustry === industry
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {industry} <span className={`ml-1 opacity-60 ${selectedIndustry === industry ? 'text-white' : 'text-slate-400'}`}>({groupedBusinesses[industry].length})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-end md:self-auto">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l5-2.5 5.553 2.776a1 1 0 01.447.894v10.764a1 1 0 01-1.447.894L15 17l-6 3z" />
            </svg>
            Explorer Map
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Card View
          </button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {viewMode === 'map' ? (
          <div className="bg-white p-3 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <MapView businesses={currentBusinesses} center={center} />
            <div className="px-4 py-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                Visualizing {selectedIndustry} Industry Ecosystem
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-300">
            <BusinessList businesses={currentBusinesses} />
          </div>
        )}
      </div>
    </div>
  );
};
