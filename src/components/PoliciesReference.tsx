import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { POLICY_RULES } from "../data/planetaKnowledge";
import type { ChannelType } from "../types/planeta";

interface PoliciesReferenceProps {
  onTestPolicyObjection: (quote: string, channel: ChannelType) => void;
}

export function PoliciesReference({
  onTestPolicyObjection,
}: PoliciesReferenceProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPolicy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 2000);
    } catch {
      // Ignore if clipboard blocked
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Base de Conocimiento Central: Agencia Planeta
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          Políticas oficiales utilizadas por PlanetaBot en cada respuesta para
          transmitir transparencia, eliminar miedos y cerrar el registro sin
          fricción.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {POLICY_RULES.map((rule) => {
          const copyContent = `${rule.title}: ${rule.headline}\n${rule.bulletPoints
            .map((b) => `- ${b}`)
            .join("\n")}`;

          return (
            <section
              key={rule.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="font-mono text-xs font-medium text-blue-600 tabular-nums">
                    {rule.number}. {rule.title}
                  </p>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    {rule.headline}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {rule.summary}
                  </p>
                </div>

                <ul className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
                  {rule.bulletPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPolicy(rule.id, copyContent)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedId === rule.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span>Copiar puntos clave</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onTestPolicyObjection(rule.samplePrompt, "WhatsApp")
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Simular objeción</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
