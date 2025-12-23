
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Business } from '../types';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  businesses: Business[];
  center?: { lat: number; lng: number };
}

const MapController = ({ focusTarget, businesses }: { focusTarget: [number, number], businesses: Business[] }) => {
  const map = useMap();
  const prevBusinessesRef = useRef<string>("");

  // Handle explicit coordinate focus (e.g. "Locate" button)
  useEffect(() => {
    if (focusTarget[0] !== 0) {
      const timeout = setTimeout(() => {
        map.invalidateSize();
        map.setView(focusTarget, 16, { animate: true });
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [focusTarget, map]);

  // Handle automatic bounding when business list changes (filtering)
  useEffect(() => {
    const bizHash = businesses.map(b => b.id).sort().join(",");
    
    // Only auto-fit if businesses changed and we aren't overriding with an explicit focusTarget 
    // or if we just initialized.
    if (businesses.length > 0 && bizHash !== prevBusinessesRef.current) {
      const validPoints = businesses
        .filter(b => b.location && b.location.lat !== 0)
        .map(b => [b.location.lat, b.location.lng] as L.LatLngExpression);
      
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      }
      prevBusinessesRef.current = bizHash;
    }
  }, [businesses, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({ businesses, center }) => {
  const [focusCoord, setFocusCoord] = useState<[number, number]>([0, 0]);

  // When center prop changes from outside (App state), update internal focus
  useEffect(() => {
    if (center && center.lat !== 0) {
      setFocusCoord([center.lat, center.lng]);
    }
  }, [center]);

  const handleMarkerClick = (lat: number, lng: number) => {
    setFocusCoord([lat, lng]);
  };

  if (businesses.length === 0 && (!center || center.lat === 0)) return (
    <div className="w-full h-[450px] flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
      <div className="text-center">
        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <p className="text-slate-400 font-medium">No results to display on map</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-[500px] mb-4 rounded-[2rem] overflow-hidden shadow-inner border border-slate-200 relative z-0">
      <MapContainer 
        center={[0, 0]} 
        zoom={2} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController focusTarget={focusCoord} businesses={businesses} />
        {businesses.map((biz) => {
          if (!biz.location || (biz.location.lat === 0 && biz.location.lng === 0)) return null;
          return (
            <Marker 
              key={biz.id} 
              position={[biz.location.lat, biz.location.lng]}
              eventHandlers={{
                click: () => handleMarkerClick(biz.location.lat, biz.location.lng)
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-black text-slate-900 leading-tight text-xs uppercase tracking-tight">{biz.name}</h4>
                    <span className="bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase flex-shrink-0 tracking-widest">{biz.industry}</span>
                  </div>
                  
                  <div className="flex items-center text-yellow-500 mb-2 bg-slate-50 p-1 rounded-md border border-slate-100">
                    <span className="text-[10px] font-bold mr-1">{biz.rating || 'N/A'}</span>
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <div className="ml-auto flex items-center gap-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{biz.popularityScore}% Pop</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {biz.phone && (
                      <p className="text-[9px] text-slate-600 flex items-center gap-1.5 font-medium">
                        <svg className="w-2.5 h-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        {biz.phone}
                      </p>
                    )}
                    <p className="text-[9px] text-slate-400 leading-tight border-l-2 border-slate-100 pl-2 py-0.5">{biz.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <a 
                      href={biz.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-center text-[9px] bg-slate-900 text-white py-2 rounded-md font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                    >
                      Route
                    </a>
                    {biz.website && (
                      <a 
                        href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-center text-[9px] bg-blue-50 text-blue-700 py-2 rounded-md font-black uppercase tracking-widest hover:bg-blue-100 transition-all shadow-sm border border-blue-100"
                      >
                        Site
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
