
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Filter, X, Import } from 'lucide-react';

const TYPE_COLORS = {
  Training: 'bg-blue-100 text-blue-800',
  Document: 'bg-purple-100 text-purple-800',
  PPE: 'bg-amber-100 text-amber-800',
  Inspection: 'bg-teal-100 text-teal-800',
  Licence: 'bg-rose-100 text-rose-800',
  Induction: 'bg-sky-100 text-sky-800',
  Verification: 'bg-green-100 text-green-800',
};

const ALL_TYPES = ['Training','Document','PPE','Inspection','Licence','Induction','Verification'];

function formatValidity(days) {
  if (days === null || days === undefined) return 'N/A';
  const d = Number(days);
  if (!Number.isFinite(d) || d <= 0) return 'Per task';
  if (d % 365 === 0) {
    const years = d / 365;
    return years === 1 ? '12 months' : `${years} years`;
  }
  if (d % 30 === 0) {
    const months = d / 30;
    return months === 1 ? '1 month' : `${months} months`;
  }
  return `${d} days`;
}

export function ControlLibrary() {
  const [controls, setControls] = useState([]);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Load controls from IPC
  useEffect(() => {
    window.api?.listControls?.()
      .then((rows) => setControls(rows || []))
      .catch(() => setControls([]));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (controls || []).filter((c) => {
      const typeOk = typeFilter === 'All' || c.type === typeFilter;
      if (!s) return typeOk;
      return (
        typeOk && (
          (c.title || '').toLowerCase().includes(s) ||
          (c.code || '').toLowerCase().includes(s) ||
          (c.description || '').toLowerCase().includes(s) ||
          (c.reference || '').toLowerCase().includes(s)
        )
      );
    });
  }, [controls, q, typeFilter]);

  async function onAddControl(data) {
    try {
      const created = await window.api?.createControl?.(data);
      if (created) setControls((prev) => [created, ...prev]);
      setShowAdd(false);
    } catch (e) {
      console.error('createControl failed', e);
      alert('Failed to create control');
    }
  }

  async function importPack(kind) {
    try {
      const res = await window.api?.importControlPack?.({ kind });
      if (Array.isArray(res) && res.length) {
        // Prepend new items; a real impl may de-dupe client-side if needed
        setControls((prev) => [...res, ...prev]);
      }
    } catch (e) {
      console.error('importControlPack failed', e);
      alert('Import failed');
    } finally {
      setShowImport(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Control Library</h3>
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search code, title, ref…"
              className="h-9 w-72 rounded border px-3 text-sm focus:outline-none focus:ring"
            />
            {q && (
              <button
                className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                onClick={() => setQ('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded border px-2 text-sm"
            >
              <option>All</option>
              {ALL_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Import size={18} /> Import Pack
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} /> Add Control
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500" colSpan={4}>
                  No controls found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id || c.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{c.title}</div>
                    <div className="text-xs text-gray-500 font-mono">{c.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${TYPE_COLORS[c.type] || 'bg-gray-100 text-gray-800'}`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.reference || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatValidity(c.validityDays)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <AddControlModal
          onClose={() => setShowAdd(false)}
          onSave={onAddControl}
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

function AddControlModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    code: '',
    title: '',
    type: 'Training',
    description: '',
    reference: '',
    validityDays: 365,
  });
  const [saving, setSaving] = useState(false);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  async function save() {
    if (!form.code.trim() || !form.title.trim()) {
      alert('Code and Title are required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        code: form.code.trim(),
        title: form.title.trim(),
        type: form.type,
        description: form.description || undefined,
        reference: form.reference || undefined,
        validityDays: form.validityDays === '' ? null : Number(form.validityDays),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow w-[560px] p-5 space-y-3">
        <h3 className="text-lg font-semibold">Add Control</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600">Code</label>
            <input className="w-full border rounded px-2 py-1.5" value={form.code} onChange={(e)=>setField('code', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Title</label>
            <input className="w-full border rounded px-2 py-1.5" value={form.title} onChange={(e)=>setField('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Type</label>
            <select className="w-full border rounded px-2 py-1.5" value={form.type} onChange={(e)=>setField('type', e.target.value)}>
              {ALL_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Validity</label>
            <input
              type="number"
              min={0}
              placeholder="Days (0 or blank = Per task)"
              className="w-full border rounded px-2 py-1.5"
              value={form.validityDays}
              onChange={(e)=>setField('validityDays', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <p className="text-[11px] text-gray-500 mt-1">Use days (e.g., 365 = 12 months). Leave blank for N/A, 0 for per-task.</p>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600">Reference</label>
          <input className="w-full border rounded px-2 py-1.5" value={form.reference} onChange={(e)=>setField('reference', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Description</label>
          <textarea rows={3} className="w-full border rounded px-2 py-1.5" value={form.description} onChange={(e)=>setField('description', e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-3 py-1.5 border rounded" onClick={onClose}>Cancel</button>
          <button disabled={saving} className="px-3 py-1.5 bg-black text-white rounded" onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
