import { useNavigate } from 'react-router-dom'
import { useCreateVideo } from '../hooks/useVideos'
import VideoForm from '../components/video/VideoForm'
import type { VideoCreateRequest } from '../types'
import { ArrowLeft } from 'lucide-react'

export default function AddVideo() {
  const navigate  = useNavigate()
  const createMutation = useCreateVideo()

  const handleSubmit = async (data: VideoCreateRequest) => {
    await createMutation.mutateAsync(data)
    navigate('/videos')
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary p-2"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Video</h1>
          <p className="text-slate-500 text-sm mt-0.5">Record a new train video entry</p>
        </div>
      </div>

      {/* Error state */}
      {createMutation.isError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Failed to save video. Please check your inputs and try again.
        </div>
      )}

      <div className="glass-card p-5 md:p-8">
        <VideoForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          submitLabel="Add Video"
        />
      </div>
    </div>
  )
}
