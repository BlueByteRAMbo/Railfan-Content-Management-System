import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format } from 'date-fns'
import { calendarApi } from '../api/services'
import { useNavigate } from 'react-router-dom'
import { Video, Upload } from 'lucide-react'
import type { VideoSummary } from '../types'

export default function CalendarView() {
  const [date, setDate] = useState<Date>(new Date())
  const navigate = useNavigate()

  const year = date.getFullYear()
  const month = date.getMonth() + 1

  const { data: recEvents = [] } = useQuery({
    queryKey: ['calendar', 'recording', year, month],
    queryFn: () => calendarApi.getRecordingEvents(year, month).then(r => r.data)
  })

  const { data: uplEvents = [] } = useQuery({
    queryKey: ['calendar', 'upload', year, month],
    queryFn: () => calendarApi.getUploadEvents(year, month).then(r => r.data)
  })

  // Group events by day string "YYYY-MM-DD"
  const recMap = new Map<string, typeof recEvents>()
  recEvents.forEach((v: VideoSummary) => {
    if (!v.recordingDate) return
    const current = recMap.get(v.recordingDate) || []
    recMap.set(v.recordingDate, [...current, v])
  })

  const uplMap = new Map<string, typeof uplEvents>()
  uplEvents.forEach((v: VideoSummary) => {
    if (!v.uploadDate) return
    const current = uplMap.get(v.uploadDate) || []
    uplMap.set(v.uploadDate, [...current, v])
  })

  const renderTileContent = ({ date: tileDate, view }: { date: Date, view: string }) => {
    if (view !== 'month') return null
    
    const dayStr = format(tileDate, 'yyyy-MM-dd')
    const recs = recMap.get(dayStr) || []
    const upls = uplMap.get(dayStr) || []

    if (recs.length === 0 && upls.length === 0) return null

    return (
      <div className="flex gap-1 justify-center mt-1">
        {recs.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-brand-400" title={`${recs.length} Recorded`} />}
        {upls.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title={`${upls.length} Uploaded`} />}
      </div>
    )
  }

  const selectedDateStr = format(date, 'yyyy-MM-dd')
  const dayRecs = recMap.get(selectedDateStr) || []
  const dayUpls = uplMap.get(selectedDateStr) || []

  return (
    <div className="max-w-5xl mx-auto p-8 animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Calendar Column */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">View your activity by day</p>
        </div>
        
        <div className="glass-card p-6 custom-calendar-wrapper">
          <Calendar
            onChange={(val) => setDate(val as Date)}
            value={date}
            tileContent={renderTileContent}
            onActiveStartDateChange={({ activeStartDate }) => {
              if (activeStartDate) setDate(activeStartDate)
            }}
            className="w-full bg-transparent border-none text-slate-200 font-sans"
          />
        </div>
      </div>

      {/* Details Column */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          {format(date, 'MMMM d, yyyy')}
        </h2>
        
        <div className="space-y-6">
          {/* Recordings */}
          <div>
            <h3 className="text-sm font-semibold text-brand-400 flex items-center gap-2 mb-3">
              <Video size={14} /> Recorded ({dayRecs.length})
            </h3>
            {dayRecs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No recordings on this day.</p>
            ) : (
              <div className="space-y-2">
                {dayRecs.map((v: VideoSummary) => (
                  <div key={`rec-${v.id}`} onClick={() => navigate(`/videos/${v.id}`)} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-slate-200 truncate">{v.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{v.trainName || v.trainNumber || 'Unknown Train'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Uploads */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
              <Upload size={14} /> Uploaded ({dayUpls.length})
            </h3>
            {dayUpls.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No uploads on this day.</p>
            ) : (
              <div className="space-y-2">
                {dayUpls.map((v: VideoSummary) => (
                  <div key={`upl-${v.id}`} onClick={() => navigate(`/videos/${v.id}`)} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-slate-200 truncate">{v.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{v.youtubeVideoId ? `ID: ${v.youtubeVideoId}` : 'No YT ID'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
