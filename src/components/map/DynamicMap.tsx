'use client';

import dynamic from 'next/dynamic';
import { MapSkeleton } from './MapSkeleton';

interface DynamicMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  address?: string;
  roomName?: string;
  showNearby?: boolean;
  nearbyTypes?: ('restaurant' | 'atm' | 'convenience')[];
  className?: string;
  onNearbyLoad?: (places: any[]) => void;
}

/**
 * Dynamically import Map component to avoid SSR issues with Leaflet
 * Leaflet requires window/document which are not available on server
 */
const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <MapSkeleton height="400px" className="rounded-xl" />
  ),
});

export default function DynamicMapWrapper(props: DynamicMapProps) {
  // Validate coordinates before rendering
  if (
    typeof props.lat !== 'number' ||
    typeof props.lng !== 'number' ||
    isNaN(props.lat) ||
    isNaN(props.lng) ||
    props.lat < -90 ||
    props.lat > 90 ||
    props.lng < -180 ||
    props.lng > 180
  ) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-gray-400">
          location_off
        </span>
        <p className="text-gray-500 mt-2">Vị trí không hợp lệ</p>
      </div>
    );
  }

  return <DynamicMap {...props} />;
}
