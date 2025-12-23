
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, geography: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [geography, setGeography] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, geography);
    }
  };

  const suggestions = [
    { q: "Tech startups", g: "London, UK" },
    { q: "Fine dining", g: "Paris, France" },
    { q: "Automotive plants", g: "Munich, Germany" },
    { q: "Coffee shops", g: "Seattle, USA" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="bg-white p-2 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-2 transition-all group focus-within:ring-4 focus-within:ring-blue-100">
        <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-100 py-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search business activity..."
            className="block w-full pl-11 pr-4 py-4 bg-transparent focus:outline-none text-lg placeholder:text-slate-400"
            disabled={isLoading}
          />
        </div>
        
        <div className="w-full md:w-64 relative py-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={geography}
            onChange={(e) => setGeography(e.target.value)}
            placeholder="Geography/Region"
            className="block w-full pl-11 pr-4 py-4 bg-transparent focus:outline-none text-lg placeholder:text-slate-400"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <span className="hidden md:inline">Analyze Market</span>
              <span className="md:hidden">Explore</span>
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest py-1">Quick Scenarios:</span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => { setQuery(s.q); setGeography(s.g); onSearch(s.q, s.g); }}
            className="text-xs bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-all shadow-sm hover:shadow"
          >
            {s.q} in {s.g}
          </button>
        ))}
      </div>
    </div>
  );
};
