import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useRef, useEffect } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to control map view
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng); },
  });
  return null;
}

export default function MapPicker({ value, onChange, onLocationFound, onLocationError }) {
  const [pos, setPos] = useState(value || { lat: -27.4698, lng: 153.0251 });
  const [isLocating, setIsLocating] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapProvider, setMapProvider] = useState('osm'); // osm, carto, esri

  const handlePick = (latlng) => {
    setPos(latlng);
    onChange?.(latlng);
  };

  const handleCurrentLocation = async () => {
    setIsLocating(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const latlng = { lat: latitude, lng: longitude };
      
      setPos(latlng);
      setMapZoom(16); // Zoom in closer for current location
      onChange?.(latlng);
      onLocationFound?.(latlng);
      
    } catch (error) {
      console.error('Location error:', error);
      onLocationError?.(error);
    } finally {
      setIsLocating(false);
    }
  };

  const getTileLayerUrl = () => {
    switch (mapProvider) {
      case 'carto':
        return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      case 'esri':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      case 'osm':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getMapProviderName = () => {
    switch (mapProvider) {
      case 'carto': return 'CartoDB';
      case 'esri': return 'Esri';
      case 'osm': return 'OpenStreetMap';
      default: return 'OpenStreetMap';
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          {isLocating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Locating...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Current Location
            </>
          )}
        </button>

        {/* Map Provider Selector */}
        <select
          value={mapProvider}
          onChange={(e) => setMapProvider(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="osm">OpenStreetMap</option>
          <option value="carto">CartoDB</option>
          <option value="esri">Esri</option>
        </select>
      </div>

      {/* Map */}
      <div className="h-80 rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <MapContainer 
          center={[pos.lat, pos.lng]} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer 
            url={getTileLayerUrl()} 
            attribution={`© ${getMapProviderName()}`}
          />
          <Marker position={[pos.lat, pos.lng]} />
          <ClickHandler onPick={handlePick} />
          <MapController center={[pos.lat, pos.lng]} zoom={mapZoom} />
        </MapContainer>
      </div>

      {/* Coordinates Display */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Latitude:</span>
            <span className="ml-2 font-mono text-gray-900">{pos.lat.toFixed(6)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Longitude:</span>
            <span className="ml-2 font-mono text-gray-900">{pos.lng.toFixed(6)}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Click anywhere on the map to select a different location
        </div>
      </div>
    </div>
  );
}
