import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Import, Wrench, X, ArrowLeftRight, Minus, Flag } from 'lucide-react';

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
              <h4 className="font-semibold text-gray-900 mb-1">{h.name}</h4>
              <p className="text-xs text-gray-500 mb-1">{h.category || '—'}</p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{h.description || '—'}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{h.code}</span>
                <span className={riskBadge[h.risk || 'Medium']}>{h.risk || 'Medium'}</span>
              </div>
              <div className="pt-4 flex justify-end">
                <button onClick={() => mapControls(h)} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-50" title="Map controls for this hazard">
                  <ArrowLeftRight size={16} /> Map Controls
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddHazardModal onClose={() => setShowAdd(false)} onAdded={onAdded} />}

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

function AddHazardModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    category: '',
    risk: 'Medium',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  function set(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      const created = await window.api?.createHazard?.(form);
      if (created) onAdded(created);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow w-[520px] p-5 space-y-3">
        <h3 className="text-lg font-semibold">Add Hazard</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600">Name</label>
            <input className="w-full border rounded px-2 py-1.5" value={form.name} onChange={e=>set('name', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Code</label>
            <input className="w-full border rounded px-2 py-1.5" value={form.code} onChange={e=>set('code', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Category</label>
            <input className="w-full border rounded px-2 py-1.5" value={form.category} onChange={e=>set('category', e.target.value)} placeholder="e.g., Electrical, Heights" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Risk</label>
            <select className="w-full border rounded px-2 py-1.5" value={form.risk} onChange={e=>set('risk', e.target.value)}>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600">Description</label>
          <textarea rows={4} className="w-full border rounded px-2 py-1.5" value={form.description} onChange={e=>set('description', e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-3 py-1.5 border rounded" onClick={onClose}>Cancel</button>
          <button disabled={saving} className="px-3 py-1.5 bg-black text-white rounded" onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
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