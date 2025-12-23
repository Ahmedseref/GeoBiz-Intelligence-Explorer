
import React, { useState } from 'react';
import { Business } from '../types';

interface BusinessTableProps {
  businesses: Business[];
}

export const BusinessTable: React.FC<BusinessTableProps> = ({ businesses }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getMapsUrl = (biz: Business) => {
    if (biz.url) return biz.url;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.name + ' ' + biz.address)}`;
  };

  if (!businesses || businesses.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-lg font-bold text-slate-900">No companies found</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-1">Try adjusting your search terms or expanding the geographic region.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company & Personnel</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Popularity</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Activities</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {businesses.map((biz) => {
            const hasManyActivities = biz.activities && biz.activities.length > 2;
            const displayedActivities = biz.activities ? (expandedRow === biz.id ? biz.activities : biz.activities.slice(0, 2)) : [];
            const remainingCount = biz.activities ? biz.activities.length - 2 : 0;

            return (
              <React.Fragment key={biz.id}>
                <tr className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{biz.name}</div>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{biz.industry}</div>
                    {biz.contactPerson && (
                      <div className="mt-1 text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                        {biz.contactPerson.name} ({biz.contactPerson.role})
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {biz.phone && (
                        <div className="text-xs text-slate-700 flex items-center gap-1">
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                          {biz.phone}
                        </div>
                      )}
                      {biz.website && (
                        <div className="text-xs text-blue-600 truncate max-w-[140px] flex items-center gap-1 font-medium">
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                          <a href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Website</a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-slate-900">
                      <span className="text-yellow-500 mr-1">{biz.rating || 'N/A'}</span>
                      <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 w-24">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Score: {biz.popularityScore}%</div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                          style={{ width: `${biz.popularityScore || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-xs text-slate-600 line-clamp-2 max-w-[250px]" title={biz.activities?.join(', ')}>
                        {displayedActivities.join(', ')}
                        {hasManyActivities && expandedRow !== biz.id && (
                          <button 
                            onClick={() => toggleExpand(biz.id)}
                            className="ml-1 text-blue-600 hover:text-blue-800 font-semibold text-[10px] uppercase tracking-wider"
                          >
                            +{remainingCount} more
                          </button>
                        )}
                        {expandedRow === biz.id && (
                          <button 
                            onClick={() => toggleExpand(biz.id)}
                            className="ml-1 text-slate-400 hover:text-slate-600 font-semibold text-[10px] uppercase tracking-wider"
                          >
                            less
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <a 
                        href={getMapsUrl(biz)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 bg-slate-50 hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-all font-bold text-xs"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Maps
                      </a>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
