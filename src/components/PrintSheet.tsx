import type { AgraciadoRecord, EventMeta } from '../types.ts';
import { formatTime } from '../utils/formatters.ts';

interface PrintSheetProps {
  event: EventMeta;
  agraciados: AgraciadoRecord[];
  sortBy: 'name' | 'arrival';
  generatedAt: string;
}

export function PrintSheet({
  event,
  agraciados,
  sortBy,
  generatedAt,
}: PrintSheetProps) {
  const checkedInList = agraciados
    .filter((g) => g.checkedIn)
    .sort((a, b) => {
      if (sortBy === 'arrival') {
        return (a.checkedInAt ?? '').localeCompare(b.checkedInAt ?? '');
      }
      return a.name.localeCompare(b.name, 'pt-BR');
    });

  return (
    <div className="bg-white text-slate-900">
      {/* Official Header */}
      <div className="border-b-2 border-[#007A33] pb-4 mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#007A33]">
            {event.organ}
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900 mt-0.5">
            {event.title} — Agraciados Presentes (Check-in Realizado)
          </h1>
          <div className="mt-1 text-xs text-slate-600">
            {event.subtitle} · {event.date} · {event.timeRange} · {event.location}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-2xl font-bold text-[#007A33] tabular-nums">
            {checkedInList.length}
          </div>
          <div className="text-[11px] text-slate-500">
            agraciado{checkedInList.length === 1 ? '' : 's'} presente{checkedInList.length === 1 ? '' : 's'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 tabular-nums">
            Emitido em {generatedAt}
          </div>
        </div>
      </div>

      {checkedInList.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-300 rounded-lg">
          <p className="text-sm font-medium text-slate-600">
            Nenhum agraciado realizou check-in até o momento.
          </p>
        </div>
      ) : (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-300 text-slate-700">
              <th className="py-2 px-2 text-left font-semibold w-8">#</th>
              <th className="py-2 px-2 text-left font-semibold">Agraciado(a)</th>
              <th className="py-2 px-2 text-left font-semibold">Indicante</th>
              <th className="py-2 px-2 text-left font-semibold w-20">Posto</th>
              <th className="py-2 px-2 text-left font-semibold w-16">Horário</th>
              <th className="py-2 px-2 text-left font-semibold">Representante / Obs.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {checkedInList.map((item, idx) => (
              <tr key={item.id} className="print-row">
                <td className="py-2 px-2 text-slate-500 font-mono tabular-nums align-top">
                  {String(idx + 1).padStart(2, '0')}
                </td>
                <td className="py-2 px-2 font-semibold text-slate-900 align-top">
                  {item.name}
                  {item.isExtra && (
                    <span className="ml-1.5 text-[10px] font-medium text-amber-700">
                      (Extra)
                    </span>
                  )}
                </td>
                <td className="py-2 px-2 text-slate-700 align-top">
                  <div>{item.indicanteName}</div>
                  <div className="text-[11px] text-slate-500">
                    {item.indicanteRole}
                    {item.indicantePartyState ? ` (${item.indicantePartyState})` : ''}
                  </div>
                </td>
                <td className="py-2 px-2 text-slate-700 align-top">{item.posto ?? '—'}</td>
                <td className="py-2 px-2 font-mono tabular-nums text-slate-700 align-top">
                  {formatTime(item.checkedInAt)}
                </td>
                <td className="py-2 px-2 text-slate-600 align-top">
                  {item.representativeName && (
                    <div className="font-medium text-slate-800">
                      Rep.: {item.representativeName}
                    </div>
                  )}
                  {item.notes && <div className="text-[11px]">{item.notes}</div>}
                  {!item.representativeName && !item.notes && (
                    <span className="text-slate-400">Titular presente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
        <span>Supervisão: {event.supervision}</span>
        <span>Ordenação: {sortBy === 'name' ? 'Alfabética' : 'Ordem de chegada'}</span>
      </div>
    </div>
  );
}
