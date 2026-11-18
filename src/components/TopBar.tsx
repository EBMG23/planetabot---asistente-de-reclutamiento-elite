import { Plus } from "lucide-react";

export type WorkspaceView = "desk" | "presets" | "policies" | "history";

interface TopBarProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onNewConsultation: () => void;
  historyCount: number;
}

export function TopBar({
  activeView,
  onSelectView,
  onNewConsultation,
  historyCount,
}: TopBarProps) {
  const navItems: { id: WorkspaceView; label: string }[] = [
    { id: "desk", label: "Mesa de Respuestas" },
    { id: "presets", label: "Casos Rápidos" },
    { id: "policies", label: "Políticas Planeta" },
    {
      id: "history",
      label: historyCount > 0 ? `Historial (${historyCount})` : "Historial",
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onSelectView("desk")}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md py-1"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-blue-600 shrink-0"
          >
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <ellipse
              cx="12"
              cy="12"
              rx="10.5"
              ry="4.2"
              transform="rotate(-24 12 12)"
              stroke="#0F172A"
              strokeWidth="1.6"
            />
          </svg>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            PlanetaBot
          </span>
        </button>

        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-6 overflow-x-auto"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm cursor-pointer ${
                  isActive
                    ? "text-slate-950 font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className="tabular-nums">{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewConsultation}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Nueva Consulta</span>
          </button>
        </div>
      </div>

      <nav
        aria-label="Navegación móvil"
        className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-slate-100 px-4 py-2"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-slate-600"
              }`}
            >
              <span className="tabular-nums">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
