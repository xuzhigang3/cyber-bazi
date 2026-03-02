"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
  value: string;
  onChange: (location: string) => void;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    province?: string;
    country?: string;
  };
}

function LocationMarker({ onLocationSelect, initialPos }: { onLocationSelect: (lat: number, lng: number) => void, initialPos: L.LatLng | null }) {
  const [position, setPosition] = useState<L.LatLng | null>(initialPos);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (initialPos) {
      setPosition(initialPos);
      map.flyTo(initialPos, 10);
    }
  }, [initialPos, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapPicker({ value, onChange }: Props) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([35.8617, 104.1954]);
  const [markerPos, setMarkerPos] = useState<L.LatLng | null>(null);

  const toggleMap = async () => {
    if (!isOpen) {
      setIsOpen(true);
      if (value) {
        setIsLoading(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=1`, {
            headers: {
              'Accept-Language': language === 'zh' ? 'zh-CN,zh;q=0.9' : 'en-US,en;q=0.9'
            }
          });
          const data = await res.json() as NominatimSearchResult[];
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setMapCenter([lat, lon]);
            setMarkerPos(new L.LatLng(lat, lon));
          }
        } catch (error) {
          console.error("Failed to geocode", error);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, {
        headers: {
          'Accept-Language': language === 'zh' ? 'zh-CN,zh;q=0.9' : 'en-US,en;q=0.9'
        }
      });
      const data = await res.json() as NominatimReverseResult;
      if (data && data.display_name) {
        const address = data.address;
        const city = address.city || address.town || address.village || address.county || '';
        const state = address.state || address.province || '';
        const country = address.country || '';

        const shortName = [country, state, city].filter(Boolean).join(' ');
        onChange(shortName || data.display_name);
      } else {
        onChange(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error("Failed to reverse geocode", error);
      onChange(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-4 items-end">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
            <MapPin className="h-4 w-4 text-theme-muted" />
          </div>
          <input
            type="text"
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('locationPlaceholder')}
            className="w-full bg-transparent border-b border-theme-border py-3 pl-8 pr-4 text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-accent transition-colors font-serif"
          />
        </div>
        <button
          type="button"
          onClick={toggleMap}
          className="px-4 py-3 border-b border-theme-border text-theme-accent hover:border-theme-accent transition-colors font-serif whitespace-nowrap text-sm"
        >
          {isOpen ? t('mapClose') : t('mapSelect')}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full h-64 mt-2 rounded-xl overflow-hidden border border-theme-border shadow-xl">
          <MapContainer center={mapCenter} zoom={4} style={{ height: '100%', width: '100%', background: 'var(--bg-primary)' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="opacity-90"
            />
            <LocationMarker onLocationSelect={handleLocationSelect} initialPos={markerPos} />
          </MapContainer>
          {isLoading && (
            <div className="absolute inset-0 bg-theme-bg/50 flex items-center justify-center z-[1000] backdrop-blur-sm">
              <div className="w-6 h-6 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
