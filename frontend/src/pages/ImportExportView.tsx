import { useState } from 'react'
import { FileInput, FileSpreadsheet, FileText, Download, Upload, Loader2, CheckCircle } from 'lucide-react'
import { importExportApi } from '../api/services'
import { useQueryClient } from '@tanstack/react-query'

export default function ImportExportView() {
  const qc = useQueryClient()
  const [importing, setImporting] = useState(false)
  const [msg, setMsg] = useState('')

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'excel') => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    try {
      setImporting(true)
      setMsg('')
      let res;
      if (type === 'csv') res = await importExportApi.importCsv(file)
      else res = await importExportApi.importExcel(file)
      
      setMsg(res.data.message || 'Import successful')
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
      e.target.value = '' // reset
    }
  }

  const handleExport = async (type: 'csv' | 'excel' | 'pdf') => {
    try {
      let res;
      if (type === 'csv') res = await importExportApi.exportCsv()
      else if (type === 'excel') res = await importExportApi.exportExcel()
      else res = await importExportApi.exportPdf()

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `railfan_archive.${type === 'excel' ? 'xlsx' : type}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setMsg(`Failed to export ${type.toUpperCase()}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Import & Export</h1>
        <p className="text-slate-500 text-sm mt-1">Backup your data or import mass records</p>
      </div>

      {msg && (
        <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10 text-brand-300 flex items-center gap-2">
          {importing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded bg-brand-500/20 text-brand-400">
              <Upload size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Import Data</h2>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Upload a CSV or Excel file to bulk import videos. The system will look for columns: Title, Recording Date, Status, Train No, Train Name, Loco No.
          </p>
          
          <div className="space-y-4">
            <label className="btn-secondary w-full flex justify-center items-center gap-2 cursor-pointer py-3">
              <FileText size={16} /> Import from CSV
              <input type="file" accept=".csv" className="hidden" onChange={e => handleImport(e, 'csv')} disabled={importing} />
            </label>
            
            <label className="btn-secondary w-full flex justify-center items-center gap-2 cursor-pointer py-3">
              <FileSpreadsheet size={16} /> Import from Excel
              <input type="file" accept=".xlsx" className="hidden" onChange={e => handleImport(e, 'excel')} disabled={importing} />
            </label>
          </div>
        </div>

        {/* Export Section */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded bg-emerald-500/20 text-emerald-400">
              <Download size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Export Data</h2>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Download your entire video database. You can use these files as backups or to share your archive.
          </p>
          
          <div className="space-y-4">
            <button onClick={() => handleExport('csv')} className="btn-secondary w-full flex justify-center items-center gap-2 py-3">
              <FileText size={16} /> Export as CSV
            </button>
            <button onClick={() => handleExport('excel')} className="btn-secondary w-full flex justify-center items-center gap-2 py-3">
              <FileSpreadsheet size={16} /> Export as Excel (.xlsx)
            </button>
            <button onClick={() => handleExport('pdf')} className="btn-secondary w-full flex justify-center items-center gap-2 py-3">
              <FileInput size={16} /> Export as PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
