import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default Leaflet marker icon in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

interface LocationPickerMapProps {
  lat?: number
  lng?: number
  onChange: (lat: number, lng: number) => void
}

function MapClickEvents({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      // Limit to 6 decimal places for precision
      const newLat = Number(e.latlng.lat.toFixed(6))
      const newLng = Number(e.latlng.lng.toFixed(6))
      onChange(newLat, newLng)
    },
  })
  return null
}

export default function LocationPickerMap({ lat, lng, onChange }: LocationPickerMapProps) {
  // Center of India as default
  const defaultCenter: [number, number] = [20.5937, 78.9629]
  const defaultZoom = lat && lng ? 13 : 4

  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  )

  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng])
    } else {
      setPosition(null)
    }
  }, [lat, lng])

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-white/10 mt-2 z-0 relative">
      <MapContainer
        center={position || defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapClickEvents onChange={onChange} />
        {position && <Marker position={position} />}
      </MapContainer>
      <div className="absolute top-2 right-2 z-[400] pointer-events-none bg-slate-900/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg">
        <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide">
          Click map to drop pin
        </p>
      </div>
    </div>
  )
}
