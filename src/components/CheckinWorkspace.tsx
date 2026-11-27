import { CheckCircle2, Edit3, FileSpreadsheet, Printer, RotateCcw, Search, UserCheck, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AgraciadoRecord, CredenciamentoState, GuestType, IndicanteRecord } from '../types.ts';
import { formatTime, matchesTokens } from '../utils/formatters.ts';

interface CheckinWorkspaceProps {
  state: CredenciamentoState;
  activeRole: GuestType;
  activePosto: string;
  onChangePosto: (posto: string) => void;
  onCheckin: (
    guestType: GuestType,
    id: string,
    representativeName?: string,
    notes?: string
  ) => Promise<void>;
  onUndoCheckin: (guestType: GuestType, id: string) => Promise<void>;
  onUpdateGuest: (
    guestType: GuestType,
    id: string,
    representativeName: string,
    notes: string
  ) => Promise<void>;
  onOpenPrint: () => void;
  onDownloadCsv: (scope: 'presentes' | 'todos') => void;
}

type StatusFilter = 'todos' | 'pendentes' | 'credenciados';

interface EditModalTarget {
  guestType: GuestType;
  id: string;
  name: string;
  subtitle: string;
  checkedIn: boolean;
  representativeName: string;
  notes: string;
}

export function CheckinWorkspace({
  state,
  activeRole,
  activePosto,
  onChangePosto,
  onCheckin,
  onUndoCheckin,
  onUpdateGuest,
  onOpenPrint,
  onDownloadCsv,
}: CheckinWorkspaceProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<EditModalTarget | null>(null);
  const [repInput, setRepInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeRole]);

  const checkedInAgraciadoNames = useMemo(() => {
    return new Set(
      state.agraciados.filter((g) => g.checkedIn).map((g) => g.name)
    );
  }, [state.agraciados]);

  const filteredAgraciados = useMemo(() => {
    return state.agraciados
      .filter((item) => {
        if (statusFilter === 'pendentes' && item.checkedIn) return false;
        if (statusFilter === 'credenciados' && !item.checkedIn) return false;
        return matchesTokens(
          [
            item.name,
            item.indicanteName,
            item.indicanteRole,
            item.indicantePartyState,
            item.representativeName,
          ],
          query
        );
      })
      .sort((a, b) => {
        if (statusFilter === 'credenciados' && a.checkedInAt && b.checkedInAt) {
          return b.checkedInAt.localeCompare(a.checkedInAt);
        }
        return a.name.localeCompare(b.name, 'pt-BR');
      });
  }, [state.agraciados, query, statusFilter]);

  const filteredIndicantes = useMemo(() => {
    return state.indicantes
      .filter((item) => {
        if (statusFilter === 'pendentes' && item.checkedIn) return false;
        if (statusFilter === 'credenciados' && !item.checkedIn) return false;
        return matchesTokens(
          [
            item.name,
            item.role,
            item.partyState,
            item.category,
            ...item.agraciadoNames,
            item.representativeName,
          ],
          query
        );
      })
      .sort((a, b) => {
        if (statusFilter === 'credenciados' && a.checkedInAt && b.checkedInAt) {
          return b.checkedInAt.localeCompare(a.checkedInAt);
        }
        return a.name.localeCompare(b.name, 'pt-BR');
      });
  }, [state.indicantes, query, statusFilter]);

  const totalCount =
    activeRole === 'agraciado' ? state.agraciados.length : state.indicantes.length;
  const checkedCount =
    activeRole === 'agraciado'
      ? state.agraciados.filter((g) => g.checkedIn).length
      : state.indicantes.filter((i) => i.checkedIn).length;
  const pendingCount = totalCount - checkedCount;

  const openEditModal = (
    guestType: GuestType,
    item: AgraciadoRecord | IndicanteRecord
  ) => {
    const subtitle =
      guestType === 'agraciado'
        ? `${(item as AgraciadoRecord).indicanteName} · ${(item as AgraciadoRecord).indicanteRole}`
        : `${(item as IndicanteRecord).role} · ${(item as IndicanteRecord).partyState}`;
    setEditTarget({
      guestType,
      id: item.id,
      name: item.name,
      subtitle,
      checkedIn: item.checkedIn,
      representativeName: item.representativeName,
      notes: item.notes,
    });
    setRepInput(item.representativeName);
    setNotesInput(item.notes);
  };

  const handleSaveEdit = async (andCheckin: boolean) => {
    if (!editTarget) return;
    setBusyId(editTarget.id);
    try {
      if (andCheckin && !editTarget.checkedIn) {
        await onCheckin(editTarget.guestType, editTarget.id, repInput, notesInput);
      } else {
        await onUpdateGuest(editTarget.guestType, editTarget.id, repInput, notesInput);
      }
      setEditTarget(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleQuickCheckin = async (guestType: GuestType, id: string) => {
    setBusyId(id);
    try {
      await onCheckin(guestType, id);
    } finally {
      setBusyId(null);
    }
  };

  const handleUndo = async (guestType: GuestType, id: string) => {
    setBusyId(id);
    try {
      await onUndoCheckin(guestType, id);
    } finally {
      setBusyId(null);
    }
  };

  const displayedListLength =
    activeRole === 'agraciado' ? filteredAgraciados.length : filteredIndicantes.length;

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative flex items-center bg-white border-2 border-[#007A33] rounded-xl shadow-xs focus-within:ring-4 focus-within:ring-[#007A33]/10 transition-shadow">
          <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeRole === 'agraciado'
                ? 'Nome do agraciado ou do deputado indicante...'
                : 'Nome do deputado indicante, liderança ou agraciado...'
            }
            className="w-full px-3.5 py-4 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="mr-3 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>limpar</span>
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Digite partes do nome do{' '}
          <strong className="text-slate-700">
            {activeRole === 'agraciado' ? 'agraciado ou indicante' : 'deputado, cargo ou agraciado'}
          </strong>
          , em qualquer ordem e sem acento.
        </p>
      </div>

      {/* Filter & Posto Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 mb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors tabular-nums cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pendentes')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors tabular-nums cursor-pointer ${
                statusFilter === 'pendentes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('credenciados')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors tabular-nums cursor-pointer ${
                statusFilter === 'credenciados'
                  ? 'bg-white text-[#007A33] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Credenciados ({checkedCount})
            </button>
          </div>

          <span className="text-xs text-slate-500 tabular-nums">
            Exibindo {displayedListLength} {displayedListLength === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-slate-600">Posto:</span>
          {state.postos.length > 1 ? (
            <select
              id="posto-select"
              value={activePosto}
              onChange={(e) => onChangePosto(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#007A33]"
            >
              {state.postos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-semibold text-slate-800">{activePosto}</span>
          )}
        </div>
      </div>

      {/* Results List */}
      {displayedListLength === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            Nenhum registro encontrado para os filtros atuais.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Verifique a grafia ou altere o filtro de status acima.
          </p>
        </div>
      ) : activeRole === 'agraciado' ? (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {filteredAgraciados.map((item) => {
            const isBusy = busyId === item.id;
            return (
              <div
                key={item.id}
                className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  item.checkedIn ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <h3 className="font-display font-semibold text-base text-slate-900">
                      {item.name}
                    </h3>
                    {item.isInstitution && (
                      <span className="text-xs font-medium text-slate-500">· Instituição</span>
                    )}
                    {item.isExtra && (
                      <span className="text-xs font-semibold text-amber-700">
                        · Inclusão no local
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>
                      Indicante: <strong className="font-medium text-slate-800">{item.indicanteName}</strong>
                    </span>
                    {item.indicantePartyState && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.indicantePartyState}</span>
                      </>
                    )}
                    {item.indicanteRole && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500">{item.indicanteRole}</span>
                      </>
                    )}
                  </div>

                  {(item.representativeName || item.notes) && (
                    <div className="mt-1.5 text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      {item.representativeName && (
                        <span>
                          Representante:{' '}
                          <strong className="font-medium text-slate-800">
                            {item.representativeName}
                          </strong>
                        </span>
                      )}
                      {item.notes && <span className="text-slate-500">Obs.: {item.notes}</span>}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {item.checkedIn ? (
                    <>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007A33] mr-2 tabular-nums">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          Check-in às {formatTime(item.checkedInAt)} · {item.posto}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditModal('agraciado', item)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Representante</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUndo('agraciado', item.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Desfazer</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal('agraciado', item)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Representante</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickCheckin('agraciado', item.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#007A33] hover:bg-[#006128] text-white rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{isBusy ? 'Confirmando...' : 'Confirmar Check-in'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {filteredIndicantes.map((item) => {
            const isBusy = busyId === item.id;
            return (
              <div
                key={item.id}
                className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  item.checkedIn ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <h3 className="font-display font-semibold text-base text-slate-900">
                      {item.name}
                    </h3>
                    {item.partyState && (
                      <span className="text-xs font-medium text-slate-600">
                        · {item.partyState}
                      </span>
                    )}
                    {item.isExtra && (
                      <span className="text-xs font-semibold text-amber-700">
                        · Inclusão no local
                      </span>
                    )}
                  </div>

                  <div className="mt-0.5 text-xs sm:text-sm text-slate-600">
                    {item.role} · {item.category}
                  </div>

                  {item.agraciadoNames.length > 0 && (
                    <div className="mt-1.5 text-xs text-slate-600">
                      <span className="text-slate-500">Agraciado(s) indicado(s): </span>
                      {item.agraciadoNames.map((agrName, idx) => {
                        const arrived = checkedInAgraciadoNames.has(agrName);
                        return (
                          <span key={agrName}>
                            {idx > 0 && <span className="mx-1.5 text-slate-300">|</span>}
                            <span
                              className={
                                arrived
                                  ? 'font-semibold text-[#007A33]'
                                  : 'font-medium text-slate-800'
                              }
                            >
                              {arrived ? `✓ ${agrName}` : agrName}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {(item.representativeName || item.notes) && (
                    <div className="mt-1.5 text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      {item.representativeName && (
                        <span>
                          Representante/Assessor:{' '}
                          <strong className="font-medium text-slate-800">
                            {item.representativeName}
                          </strong>
                        </span>
                      )}
                      {item.notes && <span className="text-slate-500">Obs.: {item.notes}</span>}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {item.checkedIn ? (
                    <>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007A33] mr-2 tabular-nums">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          Check-in às {formatTime(item.checkedInAt)} · {item.posto}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditModal('indicante', item)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Obs.</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUndo('indicante', item.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Desfazer</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal('indicante', item)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Assessor / Obs.</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickCheckin('indicante', item.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#0B4A3E] hover:bg-[#083B31] text-white rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{isBusy ? 'Confirmando...' : 'Confirmar Check-in'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Action Strip for Print & Spreadsheet */}
      <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500 tabular-nums">
          {state.agraciados.filter((g) => g.checkedIn).length} agraciado(s) com check-in confirmado
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenPrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#007A33]" />
            <span>
              Imprimir Agraciados Presentes ({state.agraciados.filter((g) => g.checkedIn).length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => onDownloadCsv('presentes')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#007A33]" />
            <span>Baixar Planilha (.csv)</span>
          </button>
        </div>
      </div>

      {/* Representative / Notes Edit Modal */}
      {editTarget && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">
                  {editTarget.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{editTarget.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editTarget.guestType === 'agraciado'
                    ? 'Representante / Quem recebe a medalha'
                    : 'Assessor / Acompanhante'}
                </label>
                <input
                  type="text"
                  value={repInput}
                  onChange={(e) => setRepInput(e.target.value)}
                  placeholder="Deixe vazio se o próprio titular comparecer"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#007A33]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações para o Cerimonial
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Ex.: Acompanhado de 1 convidado, acessibilidade, etc."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#007A33]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                {!editTarget.checkedIn ? (
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(true)}
                    disabled={busyId === editTarget.id}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold bg-[#007A33] hover:bg-[#006128] text-white rounded-lg cursor-pointer"
                  >
                    Salvar e Confirmar Check-in
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(false)}
                    disabled={busyId === editTarget.id}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold bg-[#007A33] hover:bg-[#006128] text-white rounded-lg cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
