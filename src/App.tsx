import { Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { HistoryTable } from "./components/HistoryTable";
import { PoliciesReference } from "./components/PoliciesReference";
import { PresetsLibrary } from "./components/PresetsLibrary";
import { ResponseOutput } from "./components/ResponseOutput";
import { TopBar, type WorkspaceView } from "./components/TopBar";
import { QUICK_OBJECTION_PRESETS } from "./data/planetaKnowledge";
import type {
  ChannelType,
  PlanetaResponse,
  SessionHistoryItem,
} from "./types/planeta";

const STORAGE_KEY = "planetabot_session_history_v1";
const CHANNELS: ChannelType[] = ["WhatsApp", "Instagram DM", "TikTok"];

function loadStoredHistory(): SessionHistoryItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<WorkspaceView>("desk");
  const [objectionInput, setObjectionInput] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [channel, setChannel] = useState<ChannelType>("WhatsApp");
  const [response, setResponse] = useState<PlanetaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>(() =>
    loadStoredHistory()
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  const submitObjection = async (params: {
    text: string;
    targetChannel: ChannelType;
    name: string;
    refinement?: string;
    previous?: PlanetaResponse | null;
  }) => {
    const trimmed = params.text.trim();
    if (!trimmed) {
      setError("Pega o escribe la pregunta o objeción del creador para generar la respuesta.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/objections/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objection: trimmed,
          creatorName: params.name.trim(),
          channel: params.targetChannel,
          refinement: params.refinement,
          previousResponse: params.previous ?? undefined,
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(
          payload?.error ||
            "No pudimos generar la respuesta en este momento."
        );
      }

      const data = payload as PlanetaResponse;
      setResponse(data);

      const newEntry: SessionHistoryItem = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
        creatorName: params.name.trim(),
        channel: params.targetChannel,
        objectionInput: params.refinement
          ? `${trimmed} (Ajuste: ${params.refinement})`
          : trimmed,
        response: data,
      };

      setHistory((prev) => [newEntry, ...prev].slice(0, 50));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al conectar con el servidor.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitObjection({
      text: objectionInput,
      targetChannel: channel,
      name: creatorName,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isLoading && objectionInput.trim()) {
        void submitObjection({
          text: objectionInput,
          targetChannel: channel,
          name: creatorName,
        });
      }
    }
  };

  const handleRunPreset = (quote: string, targetChannel: ChannelType) => {
    setActiveView("desk");
    setObjectionInput(quote);
    setChannel(targetChannel);
    void submitObjection({
      text: quote,
      targetChannel,
      name: creatorName,
    });
  };

  const handleNewConsultation = () => {
    setActiveView("desk");
    setObjectionInput("");
    setCreatorName("");
    setResponse(null);
    setError(null);
  };

  const handleLoadHistoryItem = (item: SessionHistoryItem) => {
    setObjectionInput(item.objectionInput);
    setCreatorName(item.creatorName);
    setChannel(item.channel);
    setResponse(item.response);
    setError(null);
    setActiveView("desk");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onNewConsultation={handleNewConsultation}
        historyCount={history.length}
      />

      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {activeView === "desk" && (
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Input Column */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500">
                  Agencia Planeta · Asistente de Reclutamiento Elite
                </p>
                <h1 className="font-display text-xl font-bold text-slate-950">
                  ¿Qué objeción o duda tiene el creador?
                </h1>
                <p className="text-sm text-slate-600">
                  Pega su mensaje tal cual te respondió para generar un texto
                  corto y un guion natural de audio listos para cerrar el
                  registro.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="creator-objection"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Mensaje o objeción del creador
                  </label>
                  <textarea
                    id="creator-objection"
                    rows={5}
                    value={objectionInput}
                    onChange={(e) => setObjectionInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ej: 'No me convence, seguro me van a quitar el 20% de lo que gane como hacen otras agencias'"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/15 resize-y"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="creator-name"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Nombre del creador (opcional)
                    </label>
                    <input
                      id="creator-name"
                      type="text"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="Ej: Camila"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Canal de respuesta
                    </span>
                    <div
                      role="radiogroup"
                      aria-label="Canal de respuesta"
                      className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1"
                    >
                      {CHANNELS.map((ch) => {
                        const active = channel === ch;
                        const shortLabel =
                          ch === "Instagram DM" ? "IG DM" : ch;
                        return (
                          <button
                            key={ch}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setChannel(ch)}
                            className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap truncate cursor-pointer ${
                              active
                                ? "bg-white text-slate-950 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {shortLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="hidden sm:inline font-mono text-xs text-slate-400">
                    Ctrl + Enter para enviar
                  </span>
                  <button
                    type="submit"
                    disabled={isLoading || !objectionInput.trim()}
                    className="ml-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-45 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        <span>Redactando opciones...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden="true" />
                        <span>Generar respuestas</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Objection Triggers */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Atajos de objeciones comunes
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveView("presets")}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Ver todas
                  </button>
                </div>

                <div className="grid gap-2">
                  {QUICK_OBJECTION_PRESETS.slice(0, 4).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        handleRunPreset(preset.quote, preset.channel)
                      }
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5 text-left transition-colors hover:border-blue-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {preset.title}
                      </span>
                      <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                        {preset.pillar.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ground-Truth Policy Strip */}
              <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  0% comisión · Sin horarios fijos · Cuenta 100% del creador
                </span>
                <button
                  type="button"
                  onClick={() => setActiveView("policies")}
                  className="font-medium text-slate-700 hover:text-slate-950 underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Ver políticas
                </button>
              </div>
            </div>

            {/* Right Output Column */}
            <div className="lg:col-span-7">
              <ResponseOutput
                response={response}
                channel={channel}
                isLoading={isLoading}
                error={error}
                onRetry={() =>
                  void submitObjection({
                    text: objectionInput,
                    targetChannel: channel,
                    name: creatorName,
                  })
                }
                onRefine={(instruction) =>
                  void submitObjection({
                    text: objectionInput,
                    targetChannel: channel,
                    name: creatorName,
                    refinement: instruction,
                    previous: response,
                  })
                }
                onSelectExample={handleRunPreset}
              />
            </div>
          </div>
        )}

        {activeView === "presets" && (
          <PresetsLibrary onUsePreset={handleRunPreset} />
        )}

        {activeView === "policies" && (
          <PoliciesReference onTestPolicyObjection={handleRunPreset} />
        )}

        {activeView === "history" && (
          <HistoryTable
            items={history}
            onLoadItem={handleLoadHistoryItem}
            onClearHistory={() => setHistory([])}
            onGoToDesk={() => setActiveView("desk")}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          <span>
            Agencia Planeta · PlanetaBot Asistente de Reclutamiento Elite
          </span>
          <span>
            Políticas oficiales: 0% retención · Libertad de horario · Propiedad
            total de cuenta
          </span>
        </div>
      </footer>
    </div>
  );
}
