import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expectedLocoConfigApi } from '../api/services';
import { useLocoTypes } from '../hooks/useReferenceData';
import { AlertTriangle, Trash2, Plus, ServerCrash } from 'lucide-react';
import SignalLoader from '../components/ui/SignalLoader';
import SearchableSelect from '../components/ui/SearchableSelect';

export default function OfflinkRules() {
  const queryClient = useQueryClient();
  const [trainNumber, setTrainNumber] = useState('');
  const [expectedLocoTypeId, setExpectedLocoTypeId] = useState<number | null>(null);

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['expectedLocoConfigs'],
    queryFn: () => expectedLocoConfigApi.getAll().then(r => r.data)
  });

  const { data: locoTypes = [], isLoading: typesLoading } = useLocoTypes();

  const createMutation = useMutation({
    mutationFn: expectedLocoConfigApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expectedLocoConfigs'] });
      setTrainNumber('');
      setExpectedLocoTypeId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: expectedLocoConfigApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expectedLocoConfigs'] });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNumber || !expectedLocoTypeId) return;
    createMutation.mutate({ trainNumber, expectedLocoTypeId });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <AlertTriangle className="text-amber-400" />
          Offlink Detector Rules
        </h1>
        <p className="text-slate-500 text-sm mt-1">Configure expected locomotive types for specific train numbers. Videos that don't match these rules will be flagged as Offlinks.</p>
      </div>

      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-200 mb-4">Add New Rule</h2>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Train Number</label>
            <input 
              type="text" 
              className="form-input text-slate-200 w-full" 
              placeholder="e.g. 12951"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Expected Loco Type</label>
            <SearchableSelect
              options={locoTypes.map(t => ({ value: t.id, label: t.name }))}
              value={expectedLocoTypeId ?? undefined}
              onChange={(val) => setExpectedLocoTypeId(val as number)}
              placeholder="— Select loco type —"
              isLoading={typesLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={createMutation.isPending || !trainNumber || !expectedLocoTypeId}
            className="btn-primary w-full md:w-auto h-11 px-6 whitespace-nowrap"
          >
            {createMutation.isPending ? <SignalLoader message="" /> : <><Plus size={18} /> Add Rule</>}
          </button>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        <h2 className="text-lg font-bold text-slate-200 p-6 border-b border-white/5">Current Rules</h2>
        {rulesLoading ? (
          <div className="p-12 flex justify-center">
            <SignalLoader message="LOADING RULES..." />
          </div>
        ) : rules.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <ServerCrash size={48} className="text-slate-700 mb-4" />
            <p className="text-lg font-medium text-slate-400">No offlink rules defined</p>
            <p className="text-sm mt-1">Add a rule above to start detecting offlinks automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider text-slate-400">
                  <th className="p-4 font-semibold">Train Number</th>
                  <th className="p-4 font-semibold">Expected Loco Type</th>
                  <th className="p-4 font-semibold w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rules.map(rule => (
                  <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-medium text-slate-200">{rule.trainNumber}</td>
                    <td className="p-4 text-slate-300">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                        ${rule.expectedLocoType.traction === 'ELECTRIC' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                          rule.expectedLocoType.traction === 'DIESEL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          'bg-teal-500/10 text-teal-400 border border-teal-500/20'}`}>
                        {rule.expectedLocoType.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => deleteMutation.mutate(rule.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
