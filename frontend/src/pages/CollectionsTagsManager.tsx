import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsApi, tagsApi } from '../api/services'
import { Plus, Edit2, Trash2, Folder, Tag as TagIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CollectionsTagsManager() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'collections'|'tags'>('collections')
  const [editingTagId, setEditingTagId] = useState<number | null>(null)
  const [editingTagName, setEditingTagName] = useState<string>('')
  
  const [editingCollectionId, setEditingCollectionId] = useState<number | 'new' | null>(null)
  const [editColName, setEditColName] = useState('')
  const [editColDesc, setEditColDesc] = useState('')
  
  const [confirmDeleteTagId, setConfirmDeleteTagId] = useState<number | null>(null)
  const [confirmDeleteColId, setConfirmDeleteColId] = useState<number | null>(null)
  
  const { data: collections = [] } = useQuery({ queryKey: ['collections'], queryFn: () => collectionsApi.getAll().then(r => r.data) })
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: () => tagsApi.getAll().then(r => r.data) })

  const deleteCollection = useMutation({
    mutationFn: (id: number) => collectionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] })
  })

  const createCollection = useMutation({
    mutationFn: (data: { name: string, description: string }) => collectionsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] })
  })

  const updateCollection = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string, description: string } }) => collectionsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] })
  })

  const deleteTag = useMutation({
    mutationFn: (id: number) => tagsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] })
  })

  const updateTag = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => tagsApi.update(id, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] })
      setEditingTagId(null)
    }
  })

  return (
    <div className="max-w-5xl mx-auto p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Collections & Tags</h1>
        <p className="text-slate-500 text-sm mt-1">Organize your railfan archive</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'collections' ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
        >
          <Folder size={14} className="inline mr-2" /> Collections
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'tags' ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
        >
          <TagIcon size={14} className="inline mr-2" /> Tags
        </button>
      </div>

      <div className="glass-card p-6">
        {activeTab === 'collections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Your Collections ({collections.length})</h2>
              <button 
                onClick={() => {
                  setEditingCollectionId('new');
                  setEditColName('');
                  setEditColDesc('');
                }}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
              >
                <Plus size={14} /> New
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editingCollectionId === 'new' && (
                <div className="p-4 rounded-xl bg-slate-800 border border-brand-500 shadow-[0_0_15px_rgba(201,138,44,0.15)] flex flex-col gap-3">
                  <input type="text" placeholder="Collection Name" value={editColName} onChange={e => setEditColName(e.target.value)} className="form-input text-sm font-bold bg-slate-900 border-slate-700" autoFocus />
                  <textarea placeholder="Description (optional)" value={editColDesc} onChange={e => setEditColDesc(e.target.value)} className="form-input text-xs h-16 bg-slate-900 border-slate-700 resize-none" />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setEditingCollectionId(null)} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                    <button onClick={() => {
                      if (editColName.trim()) {
                        createCollection.mutate({ name: editColName.trim(), description: editColDesc.trim() });
                        setEditingCollectionId(null);
                      }
                    }} className="btn-primary py-1.5 px-3 text-xs">Create</button>
                  </div>
                </div>
              )}

              {collections.map(c => {
                if (editingCollectionId === c.id) {
                  return (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-800 border border-brand-500 shadow-[0_0_15px_rgba(201,138,44,0.15)] flex flex-col gap-3">
                      <input type="text" placeholder="Collection Name" value={editColName} onChange={e => setEditColName(e.target.value)} className="form-input text-sm font-bold bg-slate-900 border-slate-700" autoFocus />
                      <textarea placeholder="Description (optional)" value={editColDesc} onChange={e => setEditColDesc(e.target.value)} className="form-input text-xs h-16 bg-slate-900 border-slate-700 resize-none" />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setEditingCollectionId(null)} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                        <button onClick={() => {
                          if (editColName.trim()) {
                            updateCollection.mutate({ id: c.id, data: { name: editColName.trim(), description: editColDesc.trim() } });
                            setEditingCollectionId(null);
                          }
                        }} className="btn-primary py-1.5 px-3 text-xs">Save</button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={c.id} onClick={() => navigate(`/collections/${c.id}`)} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/50 cursor-pointer transition-colors group flex flex-col h-full">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-slate-200 group-hover:text-brand-400 transition-colors">{c.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 whitespace-nowrap">
                        {c.videoCount || 0} Videos
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{c.description || 'No description'}</p>
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCollectionId(c.id);
                          setEditColName(c.name);
                          setEditColDesc(c.description || '');
                        }}
                        className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-brand-400 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      {confirmDeleteColId === c.id ? (
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 bg-red-500/10 rounded px-2">
                          <span className="text-[10px] font-bold text-red-400 uppercase">Sure?</span>
                          <button onClick={() => deleteCollection.mutate(c.id)} className="text-xs font-bold text-white hover:text-red-200">Yes</button>
                          <button onClick={() => setConfirmDeleteColId(null)} className="text-xs font-bold text-slate-400 hover:text-white">No</button>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteColId(c.id); }} className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">All Tags ({tags.length})</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => {
                const isEditing = editingTagId === t.id;
                if (isEditing) {
                  return (
                    <div key={t.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-brand-500">
                      <input
                        type="text"
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        className="bg-transparent text-sm font-medium text-slate-200 outline-none w-24"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (editingTagName.trim()) {
                            updateTag.mutate({ id: t.id, name: editingTagName.trim() })
                          }
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTagId(null)}
                        className="text-xs text-slate-400 hover:text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors group">
                    <span className="text-sm font-medium text-slate-300">#{t.name}</span>
                    <button
                      onClick={() => {
                        setEditingTagId(t.id)
                        setEditingTagName(t.name)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-brand-400 transition-all"
                      title="Edit tag"
                    >
                      <Edit2 size={12} />
                    </button>
                    {confirmDeleteTagId === t.id ? (
                      <div className="flex items-center gap-2 bg-red-500/10 rounded px-2 opacity-0 group-hover:opacity-100 transition-all">
                        <span className="text-[10px] font-bold text-red-400 uppercase">Sure?</span>
                        <button onClick={() => deleteTag.mutate(t.id)} className="text-xs font-bold text-white hover:text-red-200">Yes</button>
                        <button onClick={() => setConfirmDeleteTagId(null)} className="text-xs font-bold text-slate-400 hover:text-white">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteTagId(t.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-red-400 transition-all"
                        title="Delete tag"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
