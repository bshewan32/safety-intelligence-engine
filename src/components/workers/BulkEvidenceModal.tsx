// Requires: @types/dayjs
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

interface BulkEvidenceModalProps {
  onClose: () => void;
  workers: { id: string; firstName: string; lastName: string }[];
  controls: { id: string; title: string; validityDays?: number | null }[];
}

export default function BulkEvidenceModal({ onClose, workers, controls }: BulkEvidenceModalProps) {
  const [selectedControl, setSelectedControl] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [issuedDate, setIssuedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [filePath, setFilePath] = useState<string | undefined>();

  const handleFileSelect = async () => {
    const res = await window.api.selectEvidence();
    if (res && (res.filePaths || res.filePath)) {
      const path = Array.isArray(res.filePaths) ? res.filePaths[0] : res.filePath;
      setFilePath(path);
    }
  };

  const handleSubmit = async () => {
    if (!selectedControl || selectedWorkers.length === 0) {
      alert("Select control and at least one worker");
      return;
    }

    await window.api.bulkAddEvidence({
      controlId: selectedControl,
      workerIds: selectedWorkers,
      issuedDate,
      expiryDate,
      notes,
      filePath,
    });

    alert("Evidence added successfully!");
    onClose();
  };

  useEffect(() => {
    // Auto set expiry when control has validityDays
    const ctrl = controls.find((c) => c.id === selectedControl);
    if (ctrl?.validityDays) {
      setExpiryDate(dayjs(issuedDate).add(ctrl.validityDays, "day").format("YYYY-MM-DD"));
    }
  }, [selectedControl, issuedDate]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Add Evidence Record</h3>

        <label className="block mb-2 font-medium">Training / Control</label>
        <select
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={selectedControl}
          onChange={(e) => setSelectedControl(e.target.value)}
        >
          <option value="">Select Control</option>
          {controls.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-medium">Issued</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Expiry</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
        </div>

        <label className="block mb-2 font-medium">Workers</label>
        <div className="h-32 overflow-y-auto border rounded-lg p-2 mb-4">
          {workers.map((w) => (
            <label key={w.id} className="block">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedWorkers.includes(w.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedWorkers([...selectedWorkers, w.id]);
                  else setSelectedWorkers(selectedWorkers.filter((id) => id !== w.id));
                }}
              />
              {w.firstName} {w.lastName}
            </label>
          ))}
        </div>

        <label className="block mb-2 font-medium">Notes</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleFileSelect}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            {filePath ? "📎 File Attached" : "Attach File"}
          </button>

          <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}