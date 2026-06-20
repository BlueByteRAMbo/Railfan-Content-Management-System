import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { timelineApi } from '../api/services'
import { Calendar as CalendarIcon, Video, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TimelineView() {
  const navigate = useNavigate()
  const [year, setYear] = useState(new Date().getFullYear())
  
  const { data: recData } = useQuery({
    queryKey: ['timeline', 'recording', year],
    queryFn: () => timelineApi.getRecordingTimeline(year).then(r => r.data)
  })

  const { data: uplData } = useQuery({
    queryKey: ['timeline', 'upload', year],
    queryFn: () => timelineApi.getUploadTimeline(year).then(r => r.data)
  })

  // Combine data by month
  const months = Array.from({ length: 12 }, (_, i) => i + 1).reverse()
  
  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Timeline</h1>
          <p className="text-slate-500 text-sm mt-1">Track your recording and upload velocity</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setYear(y => y - 1)} className="btn-secondary py-1 px-3">&larr;</button>
          <span className="text-lg font-bold text-slate-200">{year}</span>
          <button onClick={() => setYear(y => y + 1)} className="btn-secondary py-1 px-3" disabled={year === new Date().getFullYear()}>&rarr;</button>
        </div>
      </div>

      <div className="glass-card p-8">
        <div className="relative border-l-2 border-white/10 ml-4 md:ml-6 space-y-12">
          
          {months.map(month => {
            const rCount = recData?.find(d => d.month === month)?.count || 0
            const uCount = uplData?.find(d => d.month === month)?.count || 0
            
            if (rCount === 0 && uCount === 0 && year < new Date().getFullYear()) return null
            if (rCount === 0 && uCount === 0 && month > new Date().getMonth() + 1 && year === new Date().getFullYear()) return null

            const date = new Date(year, month - 1, 1)
            const monthName = date.toLocaleString('default', { month: 'long' })

            return (
              <div key={month} className="relative">
                {/* Node */}
                <div className="absolute -left-[31px] md:-left-[35px] bg-slate-900 border-2 border-brand-500 p-1.5 rounded-full z-10">
                  <CalendarIcon size={16} className="text-brand-400" />
                </div>
                
                {/* Content */}
                <div 
                  className="pl-6 md:pl-10 cursor-pointer group/month"
                  onClick={() => navigate(`/videos?year=${year}&month=${month}`)}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-slate-200 group-hover/month:text-brand-400 transition-colors">{monthName} {year}</h3>
                    <span className="text-xs text-brand-500/0 group-hover/month:text-brand-500 transition-colors">View All &rarr;</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recording block */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-brand-500/50 transition-colors">
                      <div className="absolute top-0 right-0 p-4 opacity-10 text-brand-400 group-hover:scale-110 transition-transform">
                        <Video size={48} />
                      </div>
                      <p className="text-sm text-slate-400 mb-1">Recorded</p>
                      <p className="text-3xl font-bold text-white">{rCount} <span className="text-sm font-normal text-slate-500">videos</span></p>
                    </div>

                    {/* Upload block */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                      <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-400 group-hover:scale-110 transition-transform">
                        <Upload size={48} />
                      </div>
                      <p className="text-sm text-slate-400 mb-1">Uploaded</p>
                      <p className="text-3xl font-bold text-white">{uCount} <span className="text-sm font-normal text-slate-500">videos</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}
