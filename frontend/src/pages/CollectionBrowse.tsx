import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { collectionsApi } from '../api/services'
import { ArrowLeft, PlayCircle, Calendar, Film } from 'lucide-react'

export default function CollectionBrowse() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // We could fetch the collection details separately if needed, 
  // but let's assume we fetch all videos for this collection.
  const { data: videos, isLoading } = useQuery({
    queryKey: ['collections', id, 'videos'],
    queryFn: () => collectionsApi.getVideos(Number(id)).then(r => r.data)
  })

  // Optionally fetch the collection detail to show the name and description
  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionsApi.getAll().then(r => r.data)
  })

  const collection = collections?.find(c => c.id === Number(id))

  if (isLoading) {
    return <div className="p-8 text-slate-500 animate-pulse">Loading collection...</div>
  }

  const relatedIds = videos?.content?.map(v => v.id) || []

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in pb-32">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/collections')} className="btn-secondary p-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Film className="text-brand-400" />
            {collection?.name || 'Collection Videos'}
          </h1>
          {collection?.description && (
            <p className="text-sm text-slate-400 mt-1">{collection.description}</p>
          )}
        </div>
      </div>

      {!videos || !videos.content || videos.content.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <Film size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No videos in this collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.content.map(v => (
            <div 
              key={v.id} 
              onClick={() => navigate(`/videos/${v.id}`, { state: { videoIds: relatedIds } })} 
              className="bg-white/5 border border-white/5 hover:border-brand-500/50 rounded-xl overflow-hidden cursor-pointer group transition-all"
            >
              <div className="h-48 bg-slate-800 relative">
                {v.thumbnail ? (
                  <img src={v.thumbnail.startsWith('http') ? v.thumbnail : `data:image/jpeg;base64,${v.thumbnail}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Thumbnail" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 group-hover:text-brand-400 transition-colors">
                    <PlayCircle size={48} />
                  </div>
                )}
                {v.durationSeconds != null && (
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    {Math.floor(v.durationSeconds / 60)}:{(v.durationSeconds % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-200 text-sm line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors mb-2">{v.title}</h4>
                <div className="flex flex-col gap-1.5 mt-3">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Calendar size={12} className="text-brand-400/70" /> {v.recordingDate || 'Unknown Date'}
                  </p>
                  {v.trainNumber && (
                    <p className="text-xs font-bold text-slate-400">Train {v.trainNumber}</p>
                  )}
                  {v.locoNumber && (
                    <p className="text-[10px] text-slate-500">Loco: {v.locoNumber} {v.locoTypeName ? `(${v.locoTypeName})` : ''}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
