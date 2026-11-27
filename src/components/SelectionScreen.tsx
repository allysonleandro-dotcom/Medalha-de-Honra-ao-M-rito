import { Award, FileSpreadsheet, LayoutDashboard, Printer, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { CredenciamentoState, GuestType, ScreenMode } from '../types.ts';

interface SelectionScreenProps {
  state: CredenciamentoState;
  activePosto: string;
  onSelectPosto: (posto: string) => void;
  onSelectRole: (role: GuestType) => void;
  onNavigate: (screen: ScreenMode) => void;
  onOpenPrint: () => void;
  onDownloadCsv: (scope: 'presentes' | 'todos') => void;
}

export function SelectionScreen({
  state,
  activePosto,
  onSelectPosto,
  onSelectRole,
  onNavigate,
  onOpenPrint,
  onDownloadCsv,
}: SelectionScreenProps) {
  const [imgError, setImgError] = useState(false);

  const agraciadosCheckedIn = state.agraciados.filter((g) => g.checkedIn).length;
  const agraciadosTotal = state.agraciados.length;
  const indicantesCheckedIn = state.indicantes.filter((i) => i.checkedIn).length;
  const indicantesTotal = state.indicantes.length;

  return (
    <main className="max-w-[1040px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Highlighted Primary Heading */}
      <div className="text-center mb-7">
        <div className="inline-block border-b-2 border-[#007A33] pb-1.5 px-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#007A33] tracking-tight">
            Credenciamento
          </h1>
        </div>
        <p className="mt-2.5 text-sm sm:text-base text-slate-600">
          {state.event.subtitle} · <span className="font-semibold text-slate-900">{activePosto}</span>
        </p>
      </div>

      {/* Two Primary Clickable Options Immediately Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[780px] mx-auto">
        {/* Card 1: Agraciados */}
        <button
          type="button"
          onClick={() => onSelectRole('agraciado')}
          className="group text-left bg-white border-2 border-slate-900 hover:border-[#007A33] rounded-xl p-6 sm:p-7 transition-all hover:-translate-y-0.5 flex flex-col justify-between min-h-[195px] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#007A33]"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-[#007A33] tabular-nums">
                {agraciadosCheckedIn} / {agraciadosTotal} credenciados
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#007A33] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              AGRACIADOS
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Lista oficial de agraciados · Busca por nome do agraciado ou do indicante
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between gap-3">
            <span>Titulares, instituições e in memoriam</span>
            <span className="font-semibold text-slate-900 group-hover:text-[#007A33] whitespace-nowrap shrink-0">
              Atender →
            </span>
          </div>
        </button>

        {/* Card 2: Indicantes */}
        <button
          type="button"
          onClick={() => onSelectRole('indicante')}
          className="group text-left bg-[#0B4A3E] hover:bg-[#083B31] text-white rounded-xl p-6 sm:p-7 transition-all hover:-translate-y-0.5 flex flex-col justify-between min-h-[195px] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#007A33]"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-emerald-200 tabular-nums">
                {indicantesCheckedIn} / {indicantesTotal} credenciados
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-200/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              INDICANTES
            </h2>
            <p className="mt-2 text-sm text-emerald-100/90">
              Busca pelo nome do deputado indicante, liderança ou agraciado indicado
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/15 text-xs text-emerald-100 flex items-center justify-between gap-3">
            <span>Mesa Diretora · Líderes Partidários</span>
            <span className="font-semibold text-white whitespace-nowrap shrink-0">
              Atender →
            </span>
          </div>
        </button>
      </div>

      {/* Quick Utility Actions */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onOpenPrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#007A33]" />
          <span>Imprimir Agraciados Presentes ({agraciadosCheckedIn})</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('painel')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4 text-[#007A33]" />
          <span>Painel de Acompanhamento</span>
        </button>

        <button
          type="button"
          onClick={() => onDownloadCsv('presentes')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#007A33]" />
          <span>Baixar Planilha (.csv)</span>
        </button>
      </div>

      {/* Compact Institutional Event Strip */}
      <section className="mt-8 bg-white border border-slate-200 rounded-xl overflow-hidden max-w-[780px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-stretch">
          <div className="relative bg-[#0B4A3E] min-h-[120px] flex items-center justify-center overflow-hidden">
            {!imgError ? (
              <img
                src="/assets/aistudio/bni-624x351px-medalha-m_6a073a95.jpg"
                alt="Medalha Mérito Legislativo da Câmara dos Deputados"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-white text-center">
                <Award className="w-8 h-8 mb-1.5 text-amber-400" />
                <span className="font-display font-semibold text-xs">Medalha Mérito Legislativo</span>
              </div>
            )}
          </div>

          <div className="p-5 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-[#007A33] tracking-wide">
                {state.event.organ}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-slate-600">
                <span className="tabular-nums font-medium text-slate-800">{state.event.date}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{state.event.timeRange}</span>
                <span aria-hidden="true">·</span>
                <span>{state.event.location}</span>
                <span aria-hidden="true">·</span>
                <span>Supervisão: {state.event.supervision}</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              {state.postos.length > 1 ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Posto:</span>
                  <div className="inline-flex flex-wrap items-center gap-1 p-0.5 bg-slate-100 rounded-md">
                    {state.postos.map((posto) => (
                      <button
                        key={posto}
                        type="button"
                        onClick={() => onSelectPosto(posto)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                          activePosto === posto
                            ? 'bg-white text-[#007A33] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {posto}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <span>
                  Posto único: <strong className="font-semibold text-slate-800">{activePosto}</strong>
                </span>
              )}
              <span className="tabular-nums">
                Planilha: <code className="font-mono text-slate-700">{state.spreadsheetPath}</code>
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
