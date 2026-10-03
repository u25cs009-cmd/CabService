import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LiveMap({
  driverLocation,
  pickupCoords,
  dropCoords,
  routeTrail = [],
  zoom = 14,
  height = '400px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // Injects Leaflet CSS dynamically if not present
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = [28.6139, 77.2090]; // New Delhi default
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Custom Icon Generators
  const createCustomIcon = (emoji, bg) => {
    return L.divIcon({
      html: `<div style="background:${bg}; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 4px 6px rgba(0,0,0,0.3); border:2px solid #fff;">${emoji}</div>`,
      className: 'custom-leaflet-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
  };

  // Update Driver Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (driverLocation && typeof driverLocation.lat === 'number' && typeof driverLocation.lng === 'number') {
      const pos = [driverLocation.lat, driverLocation.lng];

      if (!driverMarkerRef.current) {
        const driverIcon = createCustomIcon('🚖', '#f59e0b');
        driverMarkerRef.current = L.marker(pos, { icon: driverIcon }).addTo(map);
        driverMarkerRef.current.bindPopup('<b>Cab Driver</b><br>Live GPS Position');
      } else {
        driverMarkerRef.current.setLatLng(pos);
      }
    }
  }, [driverLocation]);

  // Update Pickup & Drop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickupCoords && typeof pickupCoords.lat === 'number' && typeof pickupCoords.lng === 'number') {
      const pos = [pickupCoords.lat, pickupCoords.lng];
      if (!pickupMarkerRef.current) {
        const pickupIcon = createCustomIcon('📍', '#22c55e');
        pickupMarkerRef.current = L.marker(pos, { icon: pickupIcon }).addTo(map);
        pickupMarkerRef.current.bindPopup('<b>Pickup Location</b>');
      } else {
        pickupMarkerRef.current.setLatLng(pos);
      }
    }

    if (dropCoords && typeof dropCoords.lat === 'number' && typeof dropCoords.lng === 'number') {
      const pos = [dropCoords.lat, dropCoords.lng];
      if (!dropMarkerRef.current) {
        const dropIcon = createCustomIcon('🏁', '#ef4444');
        dropMarkerRef.current = L.marker(pos, { icon: dropIcon }).addTo(map);
        dropMarkerRef.current.bindPopup('<b>Drop Destination</b>');
      } else {
        dropMarkerRef.current.setLatLng(pos);
      }
    }
  }, [pickupCoords, dropCoords]);

  // Update Polyline Route Trail
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (Array.isArray(routeTrail) && routeTrail.length > 0) {
      const latLngs = routeTrail
        .filter((pt) => typeof pt.lat === 'number' && typeof pt.lng === 'number')
        .map((pt) => [pt.lat, pt.lng]);

      if (latLngs.length > 0) {
        if (!polylineRef.current) {
          polylineRef.current = L.polyline(latLngs, { color: '#3b82f6', weight: 4, opacity: 0.8 }).addTo(map);
        } else {
          polylineRef.current.setLatLngs(latLngs);
        }
      }
    }
  }, [routeTrail]);

  // Auto bounds fitting
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const points = [];
    if (driverLocation?.lat && driverLocation?.lng) points.push([driverLocation.lat, driverLocation.lng]);
    if (pickupCoords?.lat && pickupCoords?.lng) points.push([pickupCoords.lat, pickupCoords.lng]);
    if (dropCoords?.lat && dropCoords?.lng) points.push([dropCoords.lat, dropCoords.lng]);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [driverLocation, pickupCoords, dropCoords]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height,
        borderRadius: '1rem',
        overflow: 'hidden',
        border: '1px solid #334155',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)'
      }}
    />
  );
}
