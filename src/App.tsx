/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminView } from './components/AdminView.tsx';
import { CheckinWorkspace } from './components/CheckinWorkspace.tsx';
import { DashboardPanel } from './components/DashboardPanel.tsx';
import { HeaderBar } from './components/HeaderBar.tsx';
import { PrintModal } from './components/PrintModal.tsx';
import { PrintSheet } from './components/PrintSheet.tsx';
import { SelectionScreen } from './components/SelectionScreen.tsx';
import type { CredenciamentoState, GuestType, ScreenMode } from './types.ts';

export default function App() {
  const [state, setState] = useState<CredenciamentoState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [screen, setScreen] = useState<ScreenMode>('select');
  const [activeRole, setActiveRole] = useState<GuestType>('agraciado');
  const [activePosto, setActivePosto] = useState<string>('Plenário Ulisses Guimarães');

  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const [printSortBy, setPrintSortBy] = useState<'name' | 'arrival'>('arrival');

  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Falha ao carregar dados do servidor.');
      const data = (await res.json()) as CredenciamentoState;
      setState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleSelectRole = (role: GuestType) => {
    setActiveRole(role);
    setScreen('checkin');
  };

  const handleCheckin = async (
    guestType: GuestType,
    id: string,
    representativeName?: string,
    notes?: string
  ) => {
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestType,
        id,
        posto: activePosto,
        representativeName,
        notes,
      }),
    });
    if (!res.ok) throw new Error('Erro ao registrar check-in');
    const updated = (await res.json()) as CredenciamentoState;
    setState(updated);
    showToast('Check-in confirmado e salvo na planilha.');
  };

  const handleUndoCheckin = async (guestType: GuestType, id: string) => {
    const res = await fetch('/api/undo-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestType, id }),
    });
    if (!res.ok) throw new Error('Erro ao desfazer check-in');
    const updated = (await res.json()) as CredenciamentoState;
    setState(updated);
    showToast('Check-in desfeito e planilha atualizada.');
  };

  const handleUpdateGuest = async (
    guestType: GuestType,
    id: string,
    representativeName: string,
    notes: string
  ) => {
    const res = await fetch('/api/update-guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestType, id, representativeName, notes }),
    });
    if (!res.ok) throw new Error('Erro ao atualizar registro');
    const updated = (await res.json()) as CredenciamentoState;
    setState(updated);
    showToast('Dados atualizados na planilha.');
  };

  const handleDeleteExtra = async (guestType: GuestType, id: string) => {
    const res = await fetch('/api/delete-extra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestType, id }),
    });
    if (!res.ok) throw new Error('Erro ao remover inclusão extra');
    const updated = (await res.json()) as CredenciamentoState;
    setState(updated);
    showToast('Registro extra removido.');
  };

  const handleResetAll = async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Erro ao zerar credenciamento');
    const updated = (await res.json()) as CredenciamentoState;
    setState(updated);
    showToast('Credenciamento reiniciado.');
  };

  const handleDownloadCsv = (
    scope: 'presentes' | 'todos',
    type: 'agraciados' | 'indicantes' | 'todos' = 'todos'
  ) => {
    const link = document.createElement('a');
    link.href = `/api/export/csv?scope=${scope}&type=${type}`;
    link.download =
      scope === 'presentes'
        ? `planilha_presentes_medalha_2026_${type}.csv`
        : `planilha_completa_medalha_2026_${type}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download da planilha iniciado.');
  };

  if (loading && !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F5] text-slate-600 text-sm">
        Carregando sistema de credenciamento...
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F5] p-6 text-center">
        <p className="text-sm font-semibold text-red-700">{error}</p>
        <button
          type="button"
          onClick={fetchState}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-[#007A33] text-white rounded-lg cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!state) return null;

  const agraciadosCheckedIn = state.agraciados.filter((g) => g.checkedIn).length;
  const indicantesCheckedIn = state.indicantes.filter((i) => i.checkedIn).length;

  const activeCheckedCount =
    activeRole === 'agraciado' ? agraciadosCheckedIn : indicantesCheckedIn;
  const activeTotalCount =
    activeRole === 'agraciado' ? state.agraciados.length : state.indicantes.length;

  return (
    <>
      <div className="no-print min-h-screen flex flex-col bg-[#F4F6F5]">
        <HeaderBar
          screen={screen}
          activeRole={activeRole}
          activePosto={activePosto}
          checkedInCount={activeCheckedCount}
          totalCount={activeTotalCount}
          onNavigate={setScreen}
          onDownloadCsv={(scope) => handleDownloadCsv(scope, 'todos')}
        />

        <div className="flex-1">
          {screen === 'select' && (
            <SelectionScreen
              state={state}
              activePosto={activePosto}
              onSelectPosto={setActivePosto}
              onSelectRole={handleSelectRole}
              onNavigate={setScreen}
              onOpenPrint={() => setIsPrintOpen(true)}
              onDownloadCsv={(scope) => handleDownloadCsv(scope, 'todos')}
            />
          )}

          {screen === 'checkin' && (
            <CheckinWorkspace
              state={state}
              activeRole={activeRole}
              activePosto={activePosto}
              onChangePosto={setActivePosto}
              onCheckin={handleCheckin}
              onUndoCheckin={handleUndoCheckin}
              onUpdateGuest={handleUpdateGuest}
              onOpenPrint={() => setIsPrintOpen(true)}
              onDownloadCsv={(scope) => handleDownloadCsv(scope, 'todos')}
            />
          )}

          {screen === 'painel' && (
            <DashboardPanel
              state={state}
              onOpenPrint={() => setIsPrintOpen(true)}
              onDownloadCsv={handleDownloadCsv}
            />
          )}

          {screen === 'admin' && (
            <AdminView
              state={state}
              onUndoCheckin={handleUndoCheckin}
              onCheckin={(guestType, id) => handleCheckin(guestType, id)}
              onDeleteExtra={handleDeleteExtra}
              onResetAll={handleResetAll}
              onOpenPrint={() => setIsPrintOpen(true)}
              onDownloadCsv={handleDownloadCsv}
            />
          )}
        </div>

        <PrintModal
          isOpen={isPrintOpen}
          state={state}
          sortBy={printSortBy}
          onChangeSortBy={setPrintSortBy}
          onClose={() => setIsPrintOpen(false)}
          onDownloadCsv={handleDownloadCsv}
        />

        {toast && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Print-only A4 layout rendered cleanly when window.print() is triggered */}
      <div className="hidden print-only">
        <PrintSheet
          event={state.event}
          agraciados={state.agraciados}
          sortBy={printSortBy}
          generatedAt={new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
      </div>
    </>
  );
}
