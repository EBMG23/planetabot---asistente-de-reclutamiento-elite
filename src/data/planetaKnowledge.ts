import type { PolicyRule, QuickObjectionPreset } from "../types/planeta";

export const POLICY_RULES: PolicyRule[] = [
  {
    id: "commissions",
    number: "01",
    title: "Ganancias y Comisiones",
    headline: "0% de comisión al creador. El 100% de tus diamantes es tuyo.",
    summary:
      "Agencia Planeta no retiene ni descuenta ningún porcentaje de los regalos, diamantes o ingresos que genera el creador.",
    bulletPoints: [
      "El 100% de lo generado entra directo al balance del creador.",
      "La plataforma (ej. TikTok) paga directamente a la agencia mediante bonos de rendimiento y metas de equipo.",
      "Unirse y formar parte de Agencia Planeta es 100% gratis, sin cuotas ni pagos ocultos.",
    ],
    samplePrompt:
      "El creador me dijo: 'No me convence, seguro me van a quitar el 20% de lo que gane como hacen otras agencias'",
  },
  {
    id: "freedom",
    number: "02",
    title: "Horarios y Libertad",
    headline: "Sin jefes ni horarios fijos. Tú decides cuándo transmitir.",
    summary:
      "El creador mantiene control total sobre su agenda y su contenido sin obligaciones contractuales rígidas.",
    bulletPoints: [
      "No existen horarios obligatorios ni penalizaciones por días libres.",
      "Recomendamos constancia de 10 a 15 horas al mes para acelerar resultados en el algoritmo.",
      "La decisión final sobre ritmo y formato siempre pertenece al creador.",
    ],
    samplePrompt:
      "Me dice que trabaja y estudia, así que no quiere meterse en una agencia porque le da miedo que le exijan horarios diarios.",
  },
  {
    id: "ownership",
    number: "03",
    title: "Propiedad de la Cuenta",
    headline: "Tu perfil es 100% tuyo. Nunca pedimos contraseñas.",
    summary:
      "La privacidad, seguridad y titularidad del perfil permanecen intactas bajo control exclusivo del creador.",
    bulletPoints: [
      "La agencia jamás solicita contraseñas, códigos privados ni acceso directo a la cuenta.",
      "El creador conserva plena propiedad intelectual y comercial de su perfil.",
      "Si decide salir en el futuro, se lleva su cuenta intacta y sin penalizaciones.",
    ],
    samplePrompt:
      "Pregunta si al aceptar la invitación de la agencia le pueden robar la cuenta o si tiene que pasarnos su contraseña.",
  },
  {
    id: "benefits",
    number: "04",
    title: "Beneficios y Soporte",
    headline: "Respaldo real 24/7, capacitación y eventos oficiales.",
    summary:
      "Herramientas de crecimiento diseñadas para proteger la cuenta y multiplicar el alcance en transmisiones y contenido.",
    bulletPoints: [
      "Soporte Técnico 24/7 ante baneos injustos, shadowban o incidencias de cobro.",
      "Academia y Capacitación con asesoría personalizada en iluminación, contenido y retención.",
      "Eventos y Retos de Graduación con acceso a batallas oficiales y bonos extra de tráfico o dinero.",
    ],
    samplePrompt:
      "Me dice: 'Ya hago lives por mi cuenta y me va normal, ¿para qué necesitaría entrar a una agencia?'",
  },
];

export const QUICK_OBJECTION_PRESETS: QuickObjectionPreset[] = [
  {
    id: "preset-commission",
    title: "Miedo a que le quiten porcentaje",
    pillar: "Ganancias y Comisiones",
    channel: "WhatsApp",
    quote:
      "El creador me dijo: 'No me convence, seguro me van a quitar el 20% de lo que gane como hacen otras agencias'",
  },
  {
    id: "preset-schedule",
    title: "Falta de tiempo y horarios fijos",
    pillar: "Horarios y Libertad",
    channel: "Instagram DM",
    quote:
      "Tengo universidad y trabajo, no puedo cumplir con horarios obligatorios ni tener a alguien encima diciéndome cuándo hacer live.",
  },
  {
    id: "preset-password",
    title: "Temor a perder su cuenta",
    pillar: "Propiedad de la Cuenta",
    channel: "TikTok",
    quote:
      "Me da miedo aceptar la invitación porque me han dicho que las agencias se quedan con la cuenta o te piden la contraseña.",
  },
  {
    id: "preset-value",
    title: "No ve necesidad de una agencia",
    pillar: "Beneficios y Soporte",
    channel: "WhatsApp",
    quote:
      "Yo ya transmito solo y sé cómo funciona TikTok, ¿qué me van a dar ustedes que yo no pueda hacer por mi cuenta?",
  },
  {
    id: "preset-ban",
    title: "Historial de bloqueos o shadowban",
    pillar: "Beneficios y Soporte",
    channel: "WhatsApp",
    quote:
      "Hace semanas me bajaron las vistas de golpe y me suspendieron un live sin motivo, siento que la plataforma ya no me muestra.",
  },
  {
    id: "preset-exit",
    title: "Duda sobre permanencia o salida",
    pillar: "Propiedad de la Cuenta",
    channel: "Instagram DM",
    quote:
      "Si entro ahora y dentro de dos meses no me siento cómodo, ¿me cobran multa por salirme o pierdo mis seguidores?",
  },
];
