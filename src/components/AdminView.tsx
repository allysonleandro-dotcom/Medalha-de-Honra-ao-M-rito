import { FileSpreadsheet, Printer, RotateCcw, Search, Trash2, AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CredenciamentoState, GuestType } from '../types.ts';
import { formatDateTime, matchesTokens } from '../utils/formatters.ts';

interface AdminViewProps {
  state: CredenciamentoState;
  onUndoCheckin: (guestType: GuestType, id: string) => Promise<void>;
  onCheckin: (guestType: GuestType, id: string) => Promise<void>;
  onDeleteExtra: (guestType: GuestType, id: string) => Promise<void>;
  onResetAll: () => Promise<void>;
  onOpenPrint: () => void;
  onDownloadCsv: (scope: 'presentes' | 'todos', type?: 'agraciados' | 'indicantes' | 'todos') => void;
}

export function AdminView({
  state,
  onUndoCheckin,
  onCheckin,
  onDeleteExtra,
  onResetAll,
  onOpenPrint,
  onDownloadCsv,
}: AdminViewProps) {
  const [tab, setTab] = useState<GuestType>('agraciado');
  const [search, setSearch] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  const filteredAgraciados = useMemo(
    () =>
      state.agraciados.filter((g) =>
        matchesTokens([g.name, g.indicanteName, g.indicanteRole, g.representativeName], search)
      ),
    [state.agraciados, search]
  );

  const filteredIndicantes = useMemo(
    () =>
      state.indicantes.filter((i) =>
        matchesTokens([i.name, i.role, i.partyState, ...i.agraciadoNames], search)
      ),
    [state.indicantes, search]
  );

  const handleConfirmReset = async () => {
    setBusy(true);
    try {
      await onResetAll();
      setConfirmReset(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-lg font-bold text-slate-900">
            Administração do Credenciamento
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Planilha sincronizada automaticamente em{' '}
            <code className="font-mono text-slate-700">{state.spreadsheetPath}</code> ·{' '}
            <span className="tabular-nums">Última gravação: {formatDateTime(state.lastUpdated)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#007A33] hover:bg-[#006128] text-white rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Agraciados Presentes</span>
          </button>

          <button
            type="button"
            onClick={() => onDownloadCsv('presentes', 'todos')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#007A33]" />
            <span>Baixar Planilha Presentes (.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => onDownloadCsv('todos', 'todos')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Baixar Planilha Completa (.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zerar Check-ins</span>
          </button>
        </div>
      </div>

      {/* Filter & Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setTab('agraciado')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors tabular-nums cursor-pointer ${
                tab === 'agraciado'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agraciados ({state.agraciados.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('indicante')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors tabular-nums cursor-pointer ${
                tab === 'indicante'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Indicantes ({state.indicantes.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar tabela..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#007A33]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {tab === 'agraciado' ? (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-3 px-4">Agraciado</th>
                  <th className="py-3 px-4">Indicante</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Posto / Horário</th>
                  <th className="py-3 px-4">Representante / Obs.</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgraciados.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {g.name}
                      {g.isExtra && (
                        <span className="ml-2 text-xs font-semibold text-amber-700">· Extra</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="font-medium text-slate-800">{g.indicanteName}</div>
                      <div>
                        {g.indicanteRole}
                        {g.indicantePartyState ? ` (${g.indicantePartyState})` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {g.checkedIn ? (
                        <span className="font-semibold text-[#007A33]">Credenciado</span>
                      ) : (
                        <span className="text-slate-400">Pendente</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">
                      {g.checkedIn ? `${g.posto} · ${formatDateTime(g.checkedInAt)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {g.representativeName || g.notes ? (
                        <>
                          {g.representativeName && <div>Rep.: {g.representativeName}</div>}
                          {g.notes && <div className="text-slate-400">{g.notes}</div>}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {g.checkedIn ? (
                          <button
                            type="button"
                            onClick={() => onUndoCheckin('agraciado', g.id)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-700 border border-slate-200 rounded-md hover:bg-red-50 cursor-pointer"
                          >
                            Desfazer
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onCheckin('agraciado', g.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-[#007A33] hover:bg-[#006128] rounded-md cursor-pointer"
                          >
                            Check-in
                          </button>
                        )}
                        {g.isExtra && (
                          <button
                            type="button"
                            onClick={() => onDeleteExtra('agraciado', g.id)}
                            className="p-1.5 text-slate-400 hover:text-red-700 rounded-md hover:bg-red-50 cursor-pointer"
                            title="Remover inclusão extra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-3 px-4">Indicante</th>
                  <th className="py-3 px-4">Cargo / Partido</th>
                  <th className="py-3 px-4">Agraciado(s)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Posto / Horário</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIndicantes.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {i.name}
                      {i.isExtra && (
                        <span className="ml-2 text-xs font-semibold text-amber-700">· Extra</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div>{i.role}</div>
                      <div className="text-slate-400">{i.partyState}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">
                      {i.agraciadoNames.length ? i.agraciadoNames.join('; ') : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {i.checkedIn ? (
                        <span className="font-semibold text-[#007A33]">Credenciado</span>
                      ) : (
                        <span className="text-slate-400">Pendente</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">
                      {i.checkedIn ? `${i.posto} · ${formatDateTime(i.checkedInAt)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {i.checkedIn ? (
                          <button
                            type="button"
                            onClick={() => onUndoCheckin('indicante', i.id)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-700 border border-slate-200 rounded-md hover:bg-red-50 cursor-pointer"
                          >
                            Desfazer
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onCheckin('indicante', i.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0B4A3E] hover:bg-[#083B31] rounded-md cursor-pointer"
                          >
                            Check-in
                          </button>
                        )}
                        {i.isExtra && (
                          <button
                            type="button"
                            onClick={() => onDeleteExtra('indicante', i.id)}
                            className="p-1.5 text-slate-400 hover:text-red-700 rounded-md hover:bg-red-50 cursor-pointer"
                            title="Remover inclusão extra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {confirmReset && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Zerar todos os check-ins?
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Esta ação apagará todos os registros de presença, horários, inclusões extras e
                  limpará a planilha salva no servidor, restaurando a lista oficial de 40 agraciados
                  e 29 indicantes.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                disabled={busy}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={busy}
                className="px-4 py-2 text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
              >
                {busy ? 'Zerando...' : 'Confirmar e Zerar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
