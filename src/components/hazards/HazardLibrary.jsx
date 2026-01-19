import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Import, ArrowLeftRight, Edit2 } from 'lucide-react';  // Add Edit2

const riskStyles = {
  Critical: 'border-l-4 border-red-500',
  High: 'border-l-4 border-orange-500',
  Medium: 'border-l-4 border-yellow-500',
  Low: 'border-l-4 border-green-500',
};

const riskBadge = {
  Critical: 'px-2 py-1 bg-red-100 text-red-800 text-xs rounded',
  High: 'px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded',
  Medium: 'px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded',
  Low: 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded',
};

export function HazardLibrary() {
  const [hazards, setHazards] = useState([]);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingHazard, setEditingHazard] = useState(null);
  const [mapperOpen, setMapperOpen] = useState(false);
  const [mapperHazard, setMapperHazard] = useState(null); // { id, code, name }

  useEffect(() => {
    window.api?.listHazards?.().then(setHazards).catch(() => setHazards([]));
  }, []);

  const filtered = useMemo(() => {
    if (!q) return hazards;
    const s = q.toLowerCase();
    return hazards.filter(h =>
      (h.name || '').toLowerCase().includes(s) ||
      (h.code || '').toLowerCase().includes(s) ||
      (h.category || '').toLowerCase().includes(s)
    );
  }, [hazards, q]);

  function onAdded(h) {
    setHazards(prev => [h, ...prev]);
    setShowAdd(false);
  }

  async function importPack(kind) {
    setShowImport(false);
    try {
      const res = await window.api?.importHazardPack?.({ kind });
      if (Array.isArray(res)) setHazards(prev => [...res, ...prev]);
    } catch {}
  }

  function mapControls(hazard) {
    setMapperHazard(hazard);
    setMapperOpen(true);
  }

  function editHazard(hazard) {
  setEditingHazard(hazard);
  setShowAdd(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Hazard Library</h3>
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, code, category…"
              className="h-9 w-72 rounded border px-3 text-sm focus:outline-none focus:ring"
            />
            {q && (
              <button className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600" onClick={() => setQ('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(v => !v)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
            title="Import starter packs"
          >
            <Import size={18} /> Import Pack
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} /> Add Hazard
          </button>
        </div>
      </div>

      {showImport && (
        <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-3">
          <PackButton label="Industry" onClick={() => importPack('industry')} />
          <PackButton label="Work Method" onClick={() => importPack('workMethod')} />
          <PackButton label="Jurisdiction" onClick={() => importPack('jurisdiction')} />
          <PackButton label="ISO 45001 Add-ons" onClick={() => importPack('iso45001')} />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} onImport={() => setShowImport(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((h) => (
            <div key={h.id || h.code} className={`bg-white rounded-lg shadow p-6 ${riskStyles[h.risk || 'Medium'] || 'border'}`}>
              {/* Header with Edit button */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{h.name}</h4>
                <button
                  onClick={() => editHazard(h)}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Edit hazard"
                >
                  <Edit2 size={16} className="text-gray-600" />
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mb-1">{h.category || '—'}</p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{h.description || '—'}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gray-500">{h.code}</span>
                <span className={riskBadge[h.risk || 'Medium']}>{h.risk || 'Medium'}</span>
              </div>
              
              <div className="pt-4 border-t flex justify-end">
                <button 
                  onClick={() => mapControls(h)} 
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                >
                  <ArrowLeftRight size={16} /> Map Controls
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

     {showAdd && (
      <AddHazardModal 
        hazard={editingHazard}
        onClose={() => { 
          setShowAdd(false); 
          setEditingHazard(null);
        }} 
        onAdded={(updated) => {
          onAdded(updated);
          setEditingHazard(null);
        }} 
      />
    )}

      {mapperOpen && mapperHazard && (
        <HazardControlMapperModal
          hazard={mapperHazard}
          onClose={() => { setMapperOpen(false); setMapperHazard(null); }}
        />
      )}
    </div>
  );
}

function PackButton({ label, onClick }) {
  return (
    <button onClick={onClick} className="px-3 py-2 text-sm border rounded hover:bg-gray-50">
      {label}
    </button>
  );
}

function EmptyState({ onAdd, onImport }) {
  return (
    <div className="bg-white rounded-lg border-dashed border-2 p-10 text-center">
      <p className="text-gray-600 mb-4">No hazards yet. Start by importing a pack or adding your first hazard.</p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={onImport} className="px-3 py-2 border rounded hover:bg-gray-50 flex items-center gap-2">
          <Import size={16} /> Import Pack
        </button>
        <button onClick={onAdd} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} /> Add Hazard
        </button>
      </div>
    </div>
  );
}

// Updated AddHazardModal component for HazardLibrary.jsx
// Replace the existing AddHazardModal component

function AddHazardModal({ hazard, onClose, onAdded }) {
  const isEdit = !!hazard;
  
  const [form, setForm] = useState({
    name: hazard?.name || '',
    code: hazard?.code || '',
    category: hazard?.category || '',
    risk: hazard?.risk || 'Medium',
    riskValue: hazard?.preControlRisk || 7,
    description: hazard?.description || ''
  });
  const [saving, setSaving] = useState(false);

  function set(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  // Risk level options with numeric values
  const riskLevels = [
    { label: 'Critical', value: 20, range: '15-25', color: 'bg-red-50 border-red-200 text-red-800', description: 'Severe injury or death likely' },
    { label: 'High', value: 12, range: '10-14', color: 'bg-orange-50 border-orange-200 text-orange-800', description: 'Serious injury possible' },
    { label: 'Medium', value: 7, range: '5-9', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', description: 'Moderate injury possible' },
    { label: 'Low', value: 3, range: '1-4', color: 'bg-blue-50 border-blue-200 text-blue-800', description: 'Minor injury at worst' },
  ];

  function handleRiskChange(level) {
    set('risk', level.label);
    set('riskValue', level.value);
  }

  async function save() {
    if (!form.name.trim() || !form.code.trim()) {
      alert('Name and Code are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        category: form.category.trim(),
        risk: form.risk,
        description: form.description.trim()
      };

      let result;
      if (isEdit) {
        result = await window.api?.updateHazard?.({ id: hazard.id, ...payload });
      } else {
        result = await window.api?.createHazard?.(payload);
      }

      if (result) onAdded(result);
    } finally {
      setSaving(false);
    }
  }

  const selectedRisk = riskLevels.find(r => r.label === form.risk) || riskLevels[2];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <h3 className="text-xl font-semibold">
          {isEdit ? 'Edit Hazard' : 'Add Hazard'}
        </h3>

        {/* Name and Code */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={form.name} 
              onChange={e => set('name', e.target.value)}
              placeholder="e.g., Arc Flash"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" 
              value={form.code} 
              onChange={e => set('code', e.target.value)}
              placeholder="e.g., ELEC-001"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={form.category} 
            onChange={e => set('category', e.target.value)} 
            placeholder="e.g., Electrical, Heights, Confined Space"
          />
          <p className="text-xs text-gray-500 mt-1">
            Category determines which roles this hazard applies to
          </p>
        </div>

        {/* Risk Level Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pre-Control Risk Level <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Risk level before controls are applied. This determines which controls are Critical vs Medium.
          </p>
          
          <div className="space-y-2">
            {riskLevels.map((level) => (
              <button
                key={level.label}
                type="button"
                onClick={() => handleRiskChange(level)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedRisk.label === level.label
                    ? level.color + ' border-current'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedRisk.label === level.label 
                          ? 'border-current bg-current' 
                          : 'border-gray-300'
                      }`}>
                        {selectedRisk.label === level.label && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-semibold text-base">{level.label}</span>
                      <span className="text-xs font-mono text-gray-500">
                        Risk Score: {level.value} (range {level.range})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-7 mt-1">
                      {level.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea 
            rows={3} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={form.description} 
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the hazard and when it occurs..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            disabled={saving} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" 
            onClick={save}
          >
            {saving ? 'Saving…' : (isEdit ? 'Update Hazard' : 'Create Hazard')}
          </button>
        </div>
      </div>
    </div>
  );
}

function HazardControlMapperModal({ hazard, onClose }) {
  const [loading, setLoading] = useState(true);
  const [mapped, setMapped] = useState([]); // [{ id, controlId, isCritical, priority, control: {...} }]
  const [available, setAvailable] = useState([]); // [{ id, code, title, type }]
  const [qLeft, setQLeft] = useState('');
  const [qRight, setQRight] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hazard?.id]);

  async function load() {
    if (!hazard?.id) return;
    setLoading(true);
    try {
      const res = await window.api?.getHazardControls?.(hazard.id);
      setMapped(res?.mapped || []);
      setAvailable(res?.available || []);
    } catch (e) {
      console.error('getHazardControls failed', e);
      setMapped([]);
      setAvailable([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredMapped = useMemo(() => {
    const s = qLeft.trim().toLowerCase();
    if (!s) return mapped;
    return mapped.filter(m =>
      (m.control?.title || '').toLowerCase().includes(s) ||
      (m.control?.code || '').toLowerCase().includes(s) ||
      (m.control?.type || '').toLowerCase().includes(s)
    );
  }, [mapped, qLeft]);

  const filteredAvailable = useMemo(() => {
    const s = qRight.trim().toLowerCase();
    if (!s) return available;
    return available.filter(c =>
      (c.title || '').toLowerCase().includes(s) ||
      (c.code || '').toLowerCase().includes(s) ||
      (c.type || '').toLowerCase().includes(s)
    );
  }, [available, qRight]);

  async function add(controlId) {
    await window.api?.addHazardControl?.({ hazardId: hazard.id, controlId });
    await load();
  }

  async function removeByComposite(controlId) {
    await window.api?.removeHazardControl?.({ hazardId: hazard.id, controlId });
    await load();
  }

  async function toggleCritical(mapping) {
    await window.api?.addHazardControl?.({
      hazardId: hazard.id,
      controlId: mapping.controlId,
      isCritical: !mapping.isCritical,
      priority: mapping.priority,
    });
    await load();
  }

  async function updatePriority(mapping, value) {
    const p = Number(value);
    if (!Number.isFinite(p)) return;
    await window.api?.addHazardControl?.({
      hazardId: hazard.id,
      controlId: mapping.controlId,
      isCritical: mapping.isCritical,
      priority: p,
    });
    await load();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-[960px] max-w-[95vw] p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">Map Controls</h3>
            <p className="text-sm text-gray-600">Hazard: <span className="font-medium">{hazard.code}</span> — {hazard.name}</p>
          </div>
          <button className="p-2 rounded hover:bg-gray-100" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading…</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Mapped */}
            <div className="border rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b bg-gray-50 flex items-center gap-2">
                <span className="font-medium text-sm">Mapped Controls</span>
                <span className="ml-auto text-xs text-gray-500">{filteredMapped.length}</span>
              </div>
              <div className="p-2">
                <input
                  value={qLeft}
                  onChange={(e) => setQLeft(e.target.value)}
                  placeholder="Search mapped…"
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
              </div>
              <div className="max-h-[420px] overflow-auto divide-y">
                {filteredMapped.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">No mapped controls</div>
                ) : (
                  filteredMapped.map((m) => (
                    <div key={m.id} className="px-3 py-2 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{m.control?.title}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{m.control?.code} • {m.control?.type}</div>
                      </div>
                      <button
                        className={`px-2 py-1 text-xs rounded inline-flex items-center gap-1 ${m.isCritical ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => toggleCritical(m)}
                        title="Toggle critical"
                      >
                        <Flag size={12} /> Critical
                      </button>
                      <input
                        type="number"
                        className="w-16 border rounded px-1 py-1 text-xs"
                        value={m.priority ?? 0}
                        onChange={(e) => updatePriority(m, e.target.value)}
                        title="Priority (lower = earlier)"
                      />
                      <button
                        className="px-2 py-1 text-xs border rounded inline-flex items-center gap-1 hover:bg-gray-50"
                        onClick={() => removeByComposite(m.controlId)}
                        title="Remove mapping"
                      >
                        <Minus size={12} /> Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Available */}
            <div className="border rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b bg-gray-50 flex items-center gap-2">
                <span className="font-medium text-sm">Available Controls</span>
                <span className="ml-auto text-xs text-gray-500">{filteredAvailable.length}</span>
              </div>
              <div className="p-2">
                <input
                  value={qRight}
                  onChange={(e) => setQRight(e.target.value)}
                  placeholder="Search available…"
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
              </div>
              <div className="max-h-[420px] overflow-auto divide-y">
                {filteredAvailable.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">No available controls</div>
                ) : (
                  filteredAvailable.map((c) => (
                    <div key={c.id || c.code} className="px-3 py-2 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{c.title}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{c.code} • {c.type}</div>
                      </div>
                      <button
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded inline-flex items-center gap-1 hover:bg-blue-700"
                        onClick={() => add(c.id)}
                        title="Add mapping"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}