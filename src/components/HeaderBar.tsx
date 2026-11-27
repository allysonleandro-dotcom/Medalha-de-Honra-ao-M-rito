import { Award, FileSpreadsheet, LayoutDashboard, Settings, ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import type { GuestType, ScreenMode } from '../types.ts';

interface HeaderBarProps {
  screen: ScreenMode;
  activeRole: GuestType;
  activePosto: string;
  checkedInCount: number;
  totalCount: number;
  onNavigate: (screen: ScreenMode) => void;
  onDownloadCsv: (scope: 'presentes' | 'todos') => void;
}

export function HeaderBar({
  screen,
  activeRole,
  activePosto,
  checkedInCount,
  totalCount,
  onNavigate,
  onDownloadCsv,
}: HeaderBarProps) {
  const [imgError, setImgError] = useState(false);

  const contextLabel =
    screen === 'painel'
      ? 'Painel em Tempo Real'
      : screen === 'admin'
        ? 'Administração'
        : screen === 'checkin'
          ? `${activeRole === 'agraciado' ? 'Agraciados' : 'Indicantes'} · ${activePosto}`
          : 'Credenciamento Oficial';

  return (
    <header className="no-print bg-[#007A33] text-white border-b border-[#006128] sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Crest + Event Identity */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onNavigate('select')}
            className="flex items-center gap-3 text-left min-w-0 max-w-full focus-visible:outline-2 focus-visible:outline-white rounded-lg p-1 -ml-1 hover:bg-white/10 transition-colors cursor-pointer"
            title="Voltar para seleção de público"
          >
            <div className="w-11 h-9 rounded-md overflow-hidden bg-white/95 flex items-center justify-center shrink-0 border border-white/20">
              {!imgError ? (
                <img
                  src="/assets/aistudio/bni-624x351px-medalha-m_6a073a95.jpg"
                  alt="Medalha Mérito Legislativo"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Award className="w-5 h-5 text-[#007A33]" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-sm sm:text-base leading-tight tracking-tight truncate">
                Medalha Mérito Legislativo 2026
              </div>
              <div className="text-xs text-emerald-100/90 leading-tight truncate">
                {contextLabel}
              </div>
            </div>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto">
          {screen === 'checkin' && (
            <span className="hidden lg:inline-flex items-center px-3 py-1.5 text-xs font-medium text-emerald-50 bg-[#006128] rounded-md tabular-nums whitespace-nowrap shrink-0">
              {checkedInCount} / {totalCount} credenciados
            </span>
          )}

          <button
            type="button"
            onClick={() => onDownloadCsv('presentes')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#006128] hover:bg-[#004E20] text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Baixar planilha CSV com os convidados presentes"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Planilha</span>
          </button>

          {screen !== 'painel' ? (
            <button
              type="button"
              onClick={() => onNavigate('painel')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/15 hover:bg-white/25 text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('checkin')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/15 hover:bg-white/25 text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Voltar ao Check-in</span>
            </button>
          )}

          {screen !== 'admin' && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/15 hover:bg-white/25 text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          {screen !== 'select' && (
            <button
              type="button"
              onClick={() => onNavigate('select')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/15 hover:bg-white/25 text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Trocar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
