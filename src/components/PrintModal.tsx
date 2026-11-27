import { FileSpreadsheet, Printer, X } from 'lucide-react';
import { useState } from 'react';
import type { CredenciamentoState } from '../types.ts';
import { PrintSheet } from './PrintSheet.tsx';

interface PrintModalProps {
  isOpen: boolean;
  state: CredenciamentoState;
  sortBy: 'name' | 'arrival';
  onChangeSortBy: (sortBy: 'name' | 'arrival') => void;
  onClose: () => void;
  onDownloadCsv: (scope: 'presentes' | 'todos', type?: 'agraciados' | 'indicantes' | 'todos') => void;
}

export function PrintModal({
  isOpen,
  state,
  sortBy,
  onChangeSortBy,
  onClose,
  onDownloadCsv,
}: PrintModalProps) {
  const [generatedAt] = useState(() =>
    new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  if (!isOpen) return null;

  const checkedInCount = state.agraciados.filter((g) => g.checkedIn).length;

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              Imprimir Agraciados Presentes ({checkedInCount})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Relação oficial dos agraciados que já realizaram check-in no evento
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDownloadCsv('presentes', 'agraciados')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#007A33]" />
              <span>Exportar Planilha (.csv)</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={checkedInCount === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#007A33] hover:bg-[#006128] text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Lista Agora</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer"
              aria-label="Fechar janela de impressão"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Print Controls */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Ordenação:</span>
            <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
              <button
                type="button"
                onClick={() => onChangeSortBy('arrival')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === 'arrival'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ordem de chegada
              </button>
              <button
                type="button"
                onClick={() => onChangeSortBy('name')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === 'name'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ordem alfabética
              </button>
            </div>
          </div>

        </div>

        {/* Scrollable A4 Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="max-w-[820px] mx-auto bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
            <PrintSheet
              event={state.event}
              agraciados={state.agraciados}
              sortBy={sortBy}
              generatedAt={generatedAt}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
