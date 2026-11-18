import {
  AlertCircle,
  Check,
  Copy,
  Lightbulb,
  MessageSquare,
  Mic,
  Pin,
  Play,
  RotateCcw,
  Send,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ChannelType, PlanetaResponse } from "../types/planeta";

interface ResponseOutputProps {
  response: PlanetaResponse | null;
  channel: ChannelType;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onRefine: (instruction: string) => void;
  onSelectExample: (quote: string, channel: ChannelType) => void;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function estimateAudioSeconds(text: string): number {
  const words = countWords(text);
  // Natural conversational Spanish voice note pace ~2.6 words/sec
  return Math.max(12, Math.round(words / 2.6));
}

export function ResponseOutput({
  response,
  channel,
  isLoading,
  error,
  onRetry,
  onRefine,
  onSelectExample,
}: ResponseOutputProps) {
  const [copiedKey, setCopiedKey] = useState<"text" | "voice" | "all" | null>(
    null
  );
  const [followUpText, setFollowUpText] = useState("");
  const [isRecordingTimerRunning, setIsRecordingTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    setIsRecordingTimerRunning(false);
    setElapsedSeconds(0);
  }, [response]);

  useEffect(() => {
    if (!isRecordingTimerRunning) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= 30) {
          setIsRecordingTimerRunning(false);
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRecordingTimerRunning]);

  const handleCopy = async (
    value: string,
    key: "text" | "voice" | "all"
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 2000);
    } catch {
      // Fallback if clipboard API is unavailable
    }
  };

  const buildFullFormattedBrief = (data: PlanetaResponse) => {
    return [
      `💡 OBJECIÓN DETECTADA: ${data.detectedObjection}`,
      ``,
      `📱 OPCIÓN 1: MENSAJE DE TEXTO (Copiar y pegar)`,
      `"${data.textMessage}"`,
      ``,
      `🎙️ OPCIÓN 2: GUION PARA AUDIO DE WHATSAPP`,
      `"${data.voiceScript}"`,
      ``,
      `📌 CONSEJO RÁPIDO PARA EL RECLUTADOR: ${data.recruiterTip}`,
    ].join("\n");
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = followUpText.trim();
    if (!cleaned || isLoading) return;
    onRefine(cleaned);
    setFollowUpText("");
  };

  if (isLoading && !response) {
    return (
      <div
        aria-busy="true"
        aria-label="Generando respuestas estratégicas"
        className="space-y-5"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-2.5 h-3 w-64 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3.5 w-11/12 animate-pulse rounded bg-slate-100" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="pt-3 flex gap-3">
            <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="h-4 w-60 animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3.5 w-10/12 animate-pulse rounded bg-slate-100" />
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-white p-6"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-3">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                No pudimos procesar esta objeción
              </h3>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reintentar consulta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="max-w-xl space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Respuestas listas para enviar al creador
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Pega la duda o frase exacta del creador en el panel izquierdo.
              PlanetaBot aplicará las políticas oficiales de Agencia Planeta y
              redactará dos opciones en segundos:
            </p>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            <div className="py-3.5 flex items-start gap-3">
              <MessageSquare
                className="h-4 w-4 text-blue-600 mt-1 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Opción 1: Mensaje de Texto Corto
                </p>
                <p className="text-sm text-slate-600">
                  3 a 4 párrafos con empatía, aclaración transparente, beneficio
                  de agencia y pregunta de cierre para WhatsApp o IG DM.
                </p>
              </div>
            </div>
            <div className="py-3.5 flex items-start gap-3">
              <Mic
                className="h-4 w-4 text-blue-600 mt-1 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Opción 2: Guion para Nota de Voz
                </p>
                <p className="text-sm text-slate-600">
                  Lenguaje natural con pausas reales pensado para leerse en 20 a
                  30 segundos sin sonar robótico.
                </p>
              </div>
            </div>
            <div className="py-3.5 flex items-start gap-3">
              <Pin
                className="h-4 w-4 text-blue-600 mt-1 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Consejo de Seguimiento
                </p>
                <p className="text-sm text-slate-600">
                  Recomendación táctica de una línea para avanzar hacia el
                  registro del creador.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-medium text-slate-500">
              Prueba inmediata con objeciones reales:
            </p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() =>
                  onSelectExample(
                    "El creador me dijo: 'No me convence, seguro me van a quitar el 20% de lo que gane como hacen otras agencias'",
                    "WhatsApp"
                  )
                }
                className="text-left rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 transition-colors hover:border-blue-300 hover:bg-slate-50 cursor-pointer"
              >
                “No me convence, seguro me van a quitar el 20% de lo que gane
                como hacen otras agencias”
              </button>
              <button
                type="button"
                onClick={() =>
                  onSelectExample(
                    "Me da miedo aceptar la invitación porque me han dicho que te piden la contraseña o te quitan la cuenta.",
                    "Instagram DM"
                  )
                }
                className="text-left rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 transition-colors hover:border-blue-300 hover:bg-slate-50 cursor-pointer"
              >
                “Me da miedo aceptar la invitación porque me han dicho que te
                piden la contraseña o te quitan la cuenta.”
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const textParagraphs = response.textMessage
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const textWordCount = countWords(response.textMessage);
  const voiceWordCount = countWords(response.voiceScript);
  const estimatedSecs = estimateAudioSeconds(response.voiceScript);
  const timerProgress = Math.min(
    100,
    Math.round((elapsedSeconds / Math.max(estimatedSecs, 20)) * 100)
  );

  return (
    <div className="space-y-5">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900">
            <Lightbulb
              className="h-4 w-4 text-blue-600 shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Objeción detectada:
            </span>
            <h2 className="font-display text-base font-bold text-slate-950">
              {response.detectedObjection}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{response.policyPillar}</span>
            <span aria-hidden="true">·</span>
            <span>Canal: {channel}</span>
            <span aria-hidden="true">·</span>
            <span>Política oficial verificada</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleCopy(buildFullFormattedBrief(response), "all")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {copiedKey === "all" ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">Brief copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              <span>Copiar todo</span>
            </>
          )}
        </button>
      </div>

      {/* Option 1: Short Text Message */}
      <section
        aria-label="Opción 1: Mensaje de Texto"
        className={`rounded-xl border border-slate-200 bg-white transition-opacity ${
          isLoading ? "opacity-60" : "opacity-100"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <MessageSquare
              className="h-4 w-4 text-blue-600 shrink-0"
              aria-hidden="true"
            />
            <h3 className="font-display text-sm font-bold text-slate-900">
              Opción 1: Mensaje de texto (Copiar y pegar)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
            <span>{textParagraphs.length} párrafos</span>
            <span aria-hidden="true">·</span>
            <span>{textWordCount} palabras</span>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3 text-[15px] leading-relaxed text-slate-800">
          {textParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 bg-slate-50/60 rounded-b-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Ajuste rápido:</span>
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                onRefine("Haz el mensaje de texto un poco más breve y directo.")
              }
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Más corto
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                onRefine("Usa un tono aún más cálido y cercano de tú a tú.")
              }
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Más cercano
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                onRefine(
                  "Enfatiza especialmente el Soporte Técnico 24/7 y los bonos de eventos."
                )
              }
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Destacar beneficios
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(response.textMessage, "text")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              copiedKey === "text"
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {copiedKey === "text" ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Texto copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar mensaje</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Option 2: WhatsApp Voice Script */}
      <section
        aria-label="Opción 2: Guion para Audio de WhatsApp"
        className={`rounded-xl border border-slate-200 bg-white transition-opacity ${
          isLoading ? "opacity-60" : "opacity-100"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Mic
              className="h-4 w-4 text-blue-600 shrink-0"
              aria-hidden="true"
            />
            <h3 className="font-display text-sm font-bold text-slate-900">
              Opción 2: Guion para audio de WhatsApp
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
            <span>~{estimatedSecs} s lectura</span>
            <span aria-hidden="true">·</span>
            <span>{voiceWordCount} palabras</span>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-[15px] leading-relaxed text-slate-800 whitespace-pre-line">
            {response.voiceScript}
          </p>

          {isRecordingTimerRunning || elapsedSeconds > 0 ? (
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-600">
                <span>Ritmo de grabación sugerido (20–30 s)</span>
                <span>
                  00:{String(elapsedSeconds).padStart(2, "0")} / 00:
                  {String(Math.max(estimatedSecs, 20)).padStart(2, "0")}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${timerProgress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 bg-slate-50/60 rounded-b-xl">
          <button
            type="button"
            onClick={() => {
              if (isRecordingTimerRunning) {
                setIsRecordingTimerRunning(false);
              } else {
                setElapsedSeconds(0);
                setIsRecordingTimerRunning(true);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isRecordingTimerRunning ? (
              <>
                <Square className="h-3.5 w-3.5 text-red-600" />
                <span>Detener guía</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-blue-600" />
                <span>Practicar ritmo (25 s)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleCopy(response.voiceScript, "voice")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              copiedKey === "voice"
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
            }`}
          >
            {copiedKey === "voice" ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Guion copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar guion</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Recruiter Strategic Tip */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-start gap-2.5">
          <Pin
            className="h-4 w-4 text-blue-600 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900">
              Consejo rápido para el reclutador:{" "}
            </span>
            {response.recruiterTip}
          </p>
        </div>
      </div>

      {/* Follow-up refinement bar */}
      <form
        onSubmit={handleFollowUpSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3"
      >
        <input
          type="text"
          value={followUpText}
          onChange={(e) => setFollowUpText(e.target.value)}
          placeholder="¿El creador respondió otra duda o quieres ajustar algo? Escríbelo aquí..."
          className="flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!followUpText.trim() || isLoading}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-45 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isLoading ? "Ajustando..." : "Ajustar respuesta"}</span>
        </button>
      </form>
    </div>
  );
}
