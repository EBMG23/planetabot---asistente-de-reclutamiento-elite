export type ChannelType = "WhatsApp" | "Instagram DM" | "TikTok";

export type PolicyPillar =
  | "Ganancias y Comisiones"
  | "Horarios y Libertad"
  | "Propiedad de la Cuenta"
  | "Beneficios y Soporte"
  | "Consulta General";

export interface PlanetaResponse {
  detectedObjection: string;
  policyPillar: PolicyPillar;
  textMessage: string;
  voiceScript: string;
  recruiterTip: string;
}

export interface SessionHistoryItem {
  id: string;
  createdAt: string;
  creatorName: string;
  channel: ChannelType;
  objectionInput: string;
  response: PlanetaResponse;
}

export interface QuickObjectionPreset {
  id: string;
  title: string;
  pillar: PolicyPillar;
  channel: ChannelType;
  quote: string;
}

export interface PolicyRule {
  id: string;
  number: string;
  title: PolicyPillar;
  headline: string;
  summary: string;
  bulletPoints: string[];
  samplePrompt: string;
}
