import { useQuery } from '@tanstack/react-query'
import { videosApi } from '../api/services'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SignalLoader from '../components/ui/SignalLoader'

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

export default function SpotterMap() {
  const navigate = useNavigate()

  const { data: points = [], isLoading } = useQuery({
    queryKey: ['videos', 'map-points'],
    queryFn: () => videosApi.getMapPoints().then(r => r.data)
  })

  // Center map on India as default, or use the first point if available
  const defaultCenter: [number, number] = points.length > 0
    ? [points[0].gpsLat, points[0].gpsLng]
    : [20.5937, 78.9629] // Center of India

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 h-[calc(100vh-100px)] flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-brand-400" /> Spotter Map
            </h1>
          </div>
        </div>
        <div className="flex-1 glass-card bg-white/5 flex items-center justify-center rounded-xl border border-white/10">
          <SignalLoader message="LOADING MAP DATA..." />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-100px)] flex flex-col animate-fade-in pb-32">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="text-brand-400" /> Spotter Map
          </h1>
          <p className="text-slate-500 text-sm mt-1">Geographical distribution of your locomotive encounters</p>
        </div>
        <div className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
          <Navigation size={14} />
          {points.length} Locations
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden rounded-xl border border-white/10 shadow-2xl relative z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={5} 
          style={{ height: '100%', width: '100%', background: '#0f172a' }} // Darker background behind tiles
        >
          {/* Using a dark themed map tile layer for better aesthetic */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {points.map((p) => (
            <Marker 
              key={p.id} 
              position={[p.gpsLat, p.gpsLng]}
            >
              <Popup className="railfan-popup">
                <div 
                  className="cursor-pointer group min-w-[200px]"
                  onClick={() => navigate(`/videos/${p.id}`)}
                >
                  {p.thumbnail && (
                    <div className="h-24 w-full mb-2 bg-slate-800 rounded overflow-hidden">
                      <img 
                        src={p.thumbnail.startsWith('http') ? p.thumbnail : `data:image/jpeg;base64,${p.thumbnail}`} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-brand-600 transition-colors">
                    {p.locoNumber ? `Loco ${p.locoNumber}` : 'Encounter'}
                  </h3>
                  {p.locoTypeName && (
                    <p className="text-xs text-slate-500 mb-1">{p.locoTypeName}</p>
                  )}
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-2">
                    <Calendar size={10} />
                    {p.recordingDate}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Inject custom CSS for popup styling to match the dark theme */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #ffffff;
          color: #1e293b;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        .leaflet-popup-tip {
          background: #ffffff;
        }
        .railfan-popup .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
    </div>
  )
}
