import React, { useEffect, useRef } from 'react';
import Input from '../common/Input';
import { MapPin } from 'lucide-react';

export default function LocationAutocomplete({
  id,
  label,
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Enter address or city',
  error,
  required = false
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

    if (!mapsKey || mapsKey === 'your_google_maps_browser_key') {
      return; // Fallback to plain input
    }

    const initAutocomplete = () => {
      if (window.google?.maps?.places && inputRef.current) {
        try {
          const inputEl = inputRef.current.querySelector('input');
          if (!inputEl) return;

          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputEl, {
            types: ['geocode', 'establishment']
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (place && place.formatted_address) {
              onChange({ target: { id, value: place.formatted_address } });
              if (onSelectPlace && place.geometry?.location) {
                onSelectPlace({
                  address: place.formatted_address,
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                });
              }
            }
          });
        } catch (e) {
          console.warn('Google Places Autocomplete failed to initialize:', e);
        }
      }
    };

    if (window.google?.maps?.places) {
      initAutocomplete();
    } else {
      const scriptId = 'google-maps-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`;
        script.async = true;
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      }
    }
  }, [id, onChange, onSelectPlace]);

  return (
    <div ref={inputRef}>
      <Input
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        required={required}
        icon={MapPin}
      />
    </div>
  );
}
