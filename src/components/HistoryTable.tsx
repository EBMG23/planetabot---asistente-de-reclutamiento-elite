import { ArrowUpRight, Check, Copy, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SessionHistoryItem } from "../types/planeta";

interface HistoryTableProps {
  items: SessionHistoryItem[];
  onLoadItem: (item: SessionHistoryItem) => void;
  onClearHistory: () => void;
  onGoToDesk: () => void;
}

export function HistoryTable({
  items,
  onLoadItem,
  onClearHistory,
  onGoToDesk,
}: HistoryTableProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.objectionInput.toLowerCase().includes(q) ||
        item.response.detectedObjection.toLowerCase().includes(q) ||
        item.creatorName.toLowerCase().includes(q) ||
        item.response.policyPillar.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <h1 className="font-display text-lg font-bold text-slate-900">
          Aún no hay consultas guardadas en esta sesión
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
          Cada respuesta que generes en la Mesa de Respuestas se guardará aquí
          automáticamente para que puedas reutilizarla o copiarla de nuevo.
        </p>
        <button
          type="button"
          onClick={onGoToDesk}
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
        >
          Ir a Mesa de Respuestas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Historial de consultas
          </h1>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            {items.length}{" "}
            {items.length === 1
              ? "respuesta generada guardada"
              : "respuestas generadas guardadas"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar historial..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setConfirmClear(false);
                }}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Confirmar borrado
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Limpiar historial</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="px-4 py-3">Hora</th>
              <th className="px-4 py-3">Objeción detectada</th>
              <th className="px-4 py-3">Creador / Canal</th>
              <th className="px-4 py-3">Política aplicada</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((item) => {
              const formattedTime = new Date(item.createdAt).toLocaleTimeString(
                "es-ES",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                    {formattedTime}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-semibold text-slate-900">
                      {item.response.detectedObjection}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {item.objectionInput}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                    {item.creatorName ? `${item.creatorName} · ` : ""}
                    {item.channel}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                    {item.response.policyPillar}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(item.id, item.response.textMessage)
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                            <span>Copiar texto</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onLoadItem(item)}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer"
                      >
                        <span>Abrir</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
