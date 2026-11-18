import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { QUICK_OBJECTION_PRESETS } from "../data/planetaKnowledge";
import type {
  ChannelType,
  PolicyPillar,
  QuickObjectionPreset,
} from "../types/planeta";

interface PresetsLibraryProps {
  onUsePreset: (quote: string, channel: ChannelType) => void;
}

const PILLAR_FILTERS: ("Todas" | PolicyPillar)[] = [
  "Todas",
  "Ganancias y Comisiones",
  "Horarios y Libertad",
  "Propiedad de la Cuenta",
  "Beneficios y Soporte",
];

export function PresetsLibrary({ onUsePreset }: PresetsLibraryProps) {
  const [search, setSearch] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<"Todas" | PolicyPillar>(
    "Todas"
  );

  const filtered = useMemo(() => {
    return QUICK_OBJECTION_PRESETS.filter((preset) => {
      const matchesPillar =
        selectedPillar === "Todas" || preset.pillar === selectedPillar;
      const q = search.trim().toLowerCase();
      const matchesQuery =
        !q ||
        preset.title.toLowerCase().includes(q) ||
        preset.quote.toLowerCase().includes(q) ||
        preset.pillar.toLowerCase().includes(q);
      return matchesPillar && matchesQuery;
    });
  }, [search, selectedPillar]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Biblioteca de objeciones frecuentes
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Selecciona cualquier escenario real de creador para generar al
            instante el mensaje de texto y guion de audio.
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por duda o palabra clave..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filtrar objeciones por política"
        className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit"
      >
        {PILLAR_FILTERS.map((pillar) => {
          const active = selectedPillar === pillar;
          return (
            <button
              key={pillar}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedPillar(pillar)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {pillar}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            No encontramos objeciones con ese filtro
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Prueba limpiar la búsqueda o seleccionar otra categoría.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedPillar("Todas");
            }}
            className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Mostrar todas
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((preset: QuickObjectionPreset) => (
            <article
              key={preset.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{preset.pillar}</span>
                  <span aria-hidden="true">·</span>
                  <span>{preset.channel}</span>
                </div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  {preset.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  “{preset.quote}”
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => onUsePreset(preset.quote, preset.channel)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Generar respuesta</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
