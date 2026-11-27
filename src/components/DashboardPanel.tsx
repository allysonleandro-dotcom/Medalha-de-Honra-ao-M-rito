import { Check, Copy, FileSpreadsheet, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CredenciamentoState } from '../types.ts';
import { formatDateTime, formatTime } from '../utils/formatters.ts';

interface DashboardPanelProps {
  state: CredenciamentoState;
  onOpenPrint: () => void;
  onDownloadCsv: (scope: 'presentes' | 'todos', type?: 'agraciados' | 'indicantes' | 'todos') => void;
}

export function DashboardPanel({
  state,
  onOpenPrint,
  onDownloadCsv,
}: DashboardPanelProps) {
  const [copied, setCopied] = useState(false);

  const agraciadosTotal = state.agraciados.length;
  const agraciadosChecked = state.agraciados.filter((g) => g.checkedIn).length;
  const agraciadosPending = agraciadosTotal - agraciadosChecked;
  const agraciadosPct = agraciadosTotal > 0 ? (agraciadosChecked / agraciadosTotal) * 100 : 0;

  const indicantesTotal = state.indicantes.length;
  const indicantesChecked = state.indicantes.filter((i) => i.checkedIn).length;
  const indicantesPending = indicantesTotal - indicantesChecked;
  const indicantesPct = indicantesTotal > 0 ? (indicantesChecked / indicantesTotal) * 100 : 0;

  const postoStats = useMemo(() => {
    const map = new Map<string, { agraciados: number; indicantes: number }>();
    for (const p of state.postos) {
      map.set(p, { agraciados: 0, indicantes: 0 });
    }
    for (const g of state.agraciados) {
      if (g.checkedIn && g.posto) {
        const current = map.get(g.posto) ?? { agraciados: 0, indicantes: 0 };
        current.agraciados += 1;
        map.set(g.posto, current);
      }
    }
    for (const i of state.indicantes) {
      if (i.checkedIn && i.posto) {
        const current = map.get(i.posto) ?? { agraciados: 0, indicantes: 0 };
        current.indicantes += 1;
        map.set(i.posto, current);
      }
    }
    return Array.from(map.entries()).map(([posto, counts]) => ({
      posto,
      agraciados: counts.agraciados,
      indicantes: counts.indicantes,
      total: counts.agraciados + counts.indicantes,
    }));
  }, [state.agraciados, state.indicantes, state.postos]);

  const handleCopySpreadsheet = async () => {
    const header = ['Público', 'Nome', 'Indicante / Cargo', 'Posto', 'Horário Check-in', 'Representante'].join('\t');
    const rows: string[] = [];
    for (const g of state.agraciados.filter((item) => item.checkedIn)) {
      rows.push(
        [
          'Agraciado',
          g.name,
          `${g.indicanteName} (${g.indicantePartyState})`,
          g.posto ?? '',
          formatDateTime(g.checkedInAt),
          g.representativeName || 'Próprio(a)',
        ].join('\t')
      );
    }
    for (const i of state.indicantes.filter((item) => item.checkedIn)) {
      rows.push(
        [
          'Indicante',
          i.name,
          `${i.role} (${i.partyState})`,
          i.posto ?? '',
          formatDateTime(i.checkedInAt),
          i.representativeName || 'Próprio(a)',
        ].join('\t')
      );
    }

    try {
      await navigator.clipboard.writeText([header, ...rows].join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked in non-secure context; fallback handled gracefully
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 4-column KPI strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-slate-500 tracking-wide">AGRACIADOS</div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="font-display text-3xl font-bold text-slate-900">
              {agraciadosChecked}
            </span>
            <span className="text-base font-medium text-slate-400">/ {agraciadosTotal}</span>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#007A33] rounded-full transition-all duration-300"
              style={{ width: `${agraciadosPct}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-slate-500 tracking-wide">INDICANTES</div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="font-display text-3xl font-bold text-slate-900">
              {indicantesChecked}
            </span>
            <span className="text-base font-medium text-slate-400">/ {indicantesTotal}</span>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0B4A3E] rounded-full transition-all duration-300"
              style={{ width: `${indicantesPct}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-slate-500 tracking-wide">
            PENDENTES · AGRACIADOS
          </div>
          <div className="mt-2 tabular-nums">
            <span className="font-display text-3xl font-bold text-slate-900">
              {agraciadosPending}
            </span>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Aguardando chegada no evento
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-slate-500 tracking-wide">
            PENDENTES · INDICANTES
          </div>
          <div className="mt-2 tabular-nums">
            <span className="font-display text-3xl font-bold text-slate-900">
              {indicantesPending}
            </span>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Aguardando chegada no evento
          </div>
        </div>
      </section>

      {/* Main 2-column Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 items-start">
        {/* Left Column: Check-ins por Posto + Planilha & Impressão */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-500 tracking-wide mb-4">
              CHECK-INS POR POSTO
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400">
                  <th className="py-2 text-left font-semibold">POSTO</th>
                  <th className="py-2 text-right font-semibold">AGRACIADOS</th>
                  <th className="py-2 text-right font-semibold">INDICANTES</th>
                  <th className="py-2 text-right font-semibold">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {postoStats.map((row) => (
                  <tr key={row.posto}>
                    <td className="py-2.5 font-medium text-slate-800">{row.posto}</td>
                    <td className="py-2.5 text-right text-slate-600">{row.agraciados}</td>
                    <td className="py-2.5 text-right text-slate-600">{row.indicantes}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 tracking-wide">
                IMPRESSÃO E PLANILHA DE PRESENÇA
              </h2>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Cada check-in é salvo automaticamente na planilha do servidor:{' '}
                <code className="font-mono text-[11px] text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                  {state.spreadsheetPath}
                </code>
              </p>
              <p className="mt-1 text-[11px] text-slate-400 tabular-nums">
                Última atualização: {formatDateTime(state.lastUpdated)}
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onOpenPrint}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#007A33] hover:bg-[#006128] text-white rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Agraciados Presentes ({agraciadosChecked})</span>
              </button>

              <button
                type="button"
                onClick={() => onDownloadCsv('presentes', 'todos')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#007A33]" />
                <span>Baixar Planilha de Presentes (.csv)</span>
              </button>

              <button
                type="button"
                onClick={() => onDownloadCsv('todos', 'todos')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>Baixar Planilha Geral Completa (.csv)</span>
              </button>

              <button
                type="button"
                onClick={handleCopySpreadsheet}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#007A33]" />
                    <span className="text-[#007A33]">Tabela copiada para Excel / Google Sheets!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar Presentes para Excel / Google Sheets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Últimos Check-ins */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-xs font-semibold text-slate-500 tracking-wide">
              ÚLTIMOS CHECK-INS · EVENTO
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {state.logs.length} {state.logs.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {state.logs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-600">
                Nenhum check-in registrado até o momento.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Os agraciados e indicantes credenciados aparecerão aqui em tempo real.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {state.logs.map((entry) => (
                <div
                  key={entry.id}
                  className="py-2.5 flex items-center justify-between gap-4 text-sm"
                >
                  <div className="flex items-baseline gap-3.5 min-w-0">
                    <span className="font-mono text-xs text-slate-500 tabular-nums shrink-0">
                      {formatTime(entry.checkedInAt)}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {entry.name}
                        {entry.representativeName && (
                          <span className="text-xs font-normal text-slate-500 ml-2">
                            (Rep.: {entry.representativeName})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{entry.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="text-slate-500">{entry.posto}</span>
                    <span
                      className={`font-mono font-semibold px-2 py-0.5 rounded border ${
                        entry.guestType === 'agraciado'
                          ? 'border-emerald-200 text-[#007A33] bg-emerald-50/60'
                          : 'border-slate-300 text-slate-700 bg-slate-50'
                      }`}
                    >
                      {entry.guestType === 'agraciado' ? 'AGR' : 'IND'}
                      {entry.isExtra ? '+' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
