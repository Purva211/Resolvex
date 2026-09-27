import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileCode, X, Check } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function ReportExportModal({ isOpen, onClose, complaints = [] }) {
  const [format, setFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  function handleExport() {
    if (!complaints.length) return;
    setDownloading(true);

    setTimeout(() => {
      try {
        const timestamp = new Date().toISOString().slice(0, 10);
        if (format === 'csv') {
          exportToCSV(complaints, `ResolveX_Report_${timestamp}.csv`);
        } else if (format === 'excel') {
          exportToExcel(complaints, `ResolveX_Report_${timestamp}.xls`);
        } else {
          exportToPDF(complaints, `ResolveX_Report_${timestamp}.pdf`);
        }
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (e) {
        console.error('Report generation error:', e);
      } finally {
        setDownloading(false);
      }
    }, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Download size={20} />
            <h3 className="font-bold text-slate-100 text-base">📊 Generate Complaint Report</h3>
          </div>
          <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-100">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Export full management report for <strong>{complaints.length} complaint ticket(s)</strong> matching your active filters.
        </p>

        {/* Format Selection Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormat('pdf')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              format === 'pdf'
                ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <FileText size={24} className={format === 'pdf' ? 'text-indigo-400' : 'text-slate-500'} />
            <span className="text-xs font-bold">PDF Document</span>
            <span className="text-[10px] text-slate-500">Official Report</span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('excel')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              format === 'excel'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <FileSpreadsheet size={24} className={format === 'excel' ? 'text-emerald-400' : 'text-slate-500'} />
            <span className="text-xs font-bold">Excel (.xls)</span>
            <span className="text-[10px] text-slate-500">Spreadsheet</span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('csv')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              format === 'csv'
                ? 'bg-blue-950/60 border-blue-500 text-blue-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <FileCode size={24} className={format === 'csv' ? 'text-blue-400' : 'text-slate-500'} />
            <span className="text-xs font-bold">CSV File</span>
            <span className="text-[10px] text-slate-500">Raw Dataset</span>
          </button>
        </div>

        {success && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <Check size={16} />
            <span>Report exported successfully! Check your downloads.</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn btn-ghost text-xs">
            Close
          </button>
          <button
            onClick={handleExport}
            disabled={downloading || !complaints.length}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <Download size={15} />
            <span>{downloading ? 'Generating Report...' : `Export ${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
