import { logger } from "../lib/logger.js";

const DID_API_KEY = process.env["DID_API_KEY"] ?? "";
const DID_BASE = "https://api.d-id.com";

export type VideoQuality = "standard" | "hd";

export const YUNA_AVATAR_URL =
  "https://image.pollinations.ai/prompt/" +
  encodeURIComponent(
    "beautiful sexy anime girl, very large expressive eyes with long lashes, " +
    "extremely long flowing purple-blue hair, large prominent breasts visible in elegant low-cut outfit, " +
    "seductive gentle smile, soft glowing skin, ecchi anime style, " +
    "detailed digital art, sensual warm pose, anime key visual, " +
    "face and upper body portrait, studio lighting, high quality render, " +
    "4k ultra detailed, perfect anatomy, alluring expression"
  ) +
  "?width=1024&height=1024&seed=9999&nologo=true&model=flux";

export const YUNA_VOICE_ID = "pt-BR-ThalitaMultilingualNeural";

// ─── Mapeamento de idioma para lang SSML ─────────────────────────────────────
const VOICE_LANG_MAP: Record<string, string> = {
  "pt-BR-ThalitaMultilingualNeural": "pt-BR",
  "pt-BR-AntonioNeural": "pt-BR",
  "en-US-AvaMultilingualNeural": "en-US",
  "es-ES-ElviraNeural": "es-ES",
  "ko-KR-SunHiNeural": "ko-KR",
  "ja-JP-NanamiNeural": "ja-JP",
  "fr-FR-DeniseNeural": "fr-FR",
  "it-IT-ElsaNeural": "it-IT",
  "de-DE-KatjaNeural": "de-DE",
  "zh-CN-XiaoxiaoNeural": "zh-CN",
};

function buildAuthKey(): string {
  const key = DID_API_KEY.trim();
  if (!key) return "";

  try {
    const decoded = Buffer.from(key, "base64").toString("utf8");
    if (decoded.includes(":") && decoded.includes("@")) {
      return key; // Ja e base64 valido de email:password
    }
  } catch {}

  if (key.includes(":")) {
    return Buffer.from(key).toString("base64");
  }

  return key;
}

/**
 * Gera video D-ID com voz ultra-sensual, ousada e atrevida.
 *
 * Configuracoes de voz — feminina fina, sexy, sem timidez:
 * - SSML com <mstts:express-as style="whispering"> = sussurro intimista
 * - Fallback style="chat" para vozes sem suporte a whispering
 * - <break> estrategicos = pausas dramaticas e sensuais entre frases
 * - Prosody rate 70-78% = fala lenta, provocante, como se estivesse no ouvido
 * - Prosody pitch +2% a +5% = tom mais fino, feminino, sedutor
 * - driver_url "bank://lively" = movimentos faciais expressivos e sensuais
 * - fluent: true = lip-sync suave e continuo
 * - stitch: true = mantem contexto visual da imagem original
 * - motion_factor 0.7 = movimentos corporais mais suaves e sensuais
 */
export async function generateDIDVideo(
  text: string,
  imageUrl: string,
  voiceId: string = YUNA_VOICE_ID,
  quality: VideoQuality = "standard",
  expression: string = "warm",
): Promise<Buffer | null> {
  if (!DID_API_KEY) {
    logger.warn("DID_API_KEY nao configurada — video D-ID desativado");
    return null;
  }

  const authKey = buildAuthKey();
  const isHD = quality === "hd";
  const ssmlText = buildSSML(text, isHD, voiceId);

  try {
    const body: Record<string, unknown> = {
      source_url: imageUrl,
      script: {
        type: "text",
        input: ssmlText,
        ssml: true,
        provider: {
          type: "microsoft",
          voice_id: voiceId,
          voice_config: {
            style: "whispering",
            rate: isHD ? "0.65" : "0.70",
            pitch: isHD ? "+5%" : "+3%",
          },
        },
      },
      config: {
        fluent: true,
        stitch: true,
        pad_audio: isHD ? 2.0 : 1.2,
        result_format: "mp4",
        driver_url: "bank://lively",
        motion_factor: isHD ? 0.65 : 0.7,
        ...(isHD ? { sharpen: true } : {}),
      },
    };

    logger.info({ voiceId, quality, textLen: text.length, imageUrl: imageUrl.slice(0, 80) }, "D-ID criando talk...");

    const createRes = await fetch(`${DID_BASE}/talks`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      logger.error({ status: createRes.status, errBody, voiceId }, "D-ID criacao falhou");
      return null;
    }

    const createData = (await createRes.json()) as { id?: string };
    const talkId = createData.id;
    if (!talkId) {
      logger.error({ createData }, "D-ID: nenhum talk ID retornado");
      return null;
    }

    logger.info({ talkId, quality }, "D-ID talk criado, aguardando resultado...");
    return pollResult(`${DID_BASE}/talks/${talkId}`, authKey);
  } catch (err) {
    logger.error({ err }, "D-ID excecao geral");
    return null;
  }
}

/**
 * Constroi SSML otimizado para narracao ousada, atrevida e provocante.
 *
 * Tecnicas para voz feminina fina, sexy, sem timidez:
 * 1. <mstts:express-as style="whispering"> = sussurro intimista e provocante
 * 2. <break> longos = pausas sensuais que criam tensao e antecipacao
 * 3. <prosody> rate lento + pitch alto = voz fina, feminina, sedutora
 * 4. Pausas dramaticas maiores em reticencias (como gemidos suaves)
 * 5. <emphasis> em palavras-chave para intensidade emocional
 */
function buildSSML(text: string, isHD: boolean, voiceId: string): string {
  const trimmed = text.slice(0, 1200);
  const lang = VOICE_LANG_MAP[voiceId] ?? "pt-BR";

  // Pausas sensuais e provocantes
  let processed = trimmed
    // Reticencias → pausa longa sensual (como suspiro)
    .replace(/\.\.\./g, '<break time="900ms"/>')
    // Travessao → pausa dramatica provocante
    .replace(/—/g, '<break time="650ms"/>')
    // Ponto final + espaco → pausa entre frases com respiracao
    .replace(/\.\s+/g, '.<break time="500ms"/> ')
    // Ponto de exclamacao → pausa enfatica ousada
    .replace(/!\s+/g, '!<break time="450ms"/> ')
    // Ponto de interrogacao → pausa reflexiva sedutora
    .replace(/\?\s+/g, '?<break time="450ms"/> ')
    // Virgula → micro-pausa natural com ritmo
    .replace(/,\s+/g, ',<break time="250ms"/> ')
    // Ponto e virgula → pausa media sensual
    .replace(/;\s+/g, ';<break time="400ms"/> ');

  // Escape caracteres XML
  processed = processed
    .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, "&amp;")
    .replace(/<(?!break|\/break|prosody|\/prosody|mstts:|\/mstts:|emphasis|\/emphasis)/g, "&lt;");

  // Voz fina, feminina, provocante — pitch ALTO (nao grave)
  const rate = isHD ? "72%" : "78%";
  const pitch = isHD ? "+5%" : "+3%";

  return [
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${lang}">`,
    `<mstts:express-as style="whispering">`,
    `<prosody rate="${rate}" pitch="${pitch}">`,
    processed,
    `</prosody>`,
    `</mstts:express-as>`,
    `</speak>`,
  ].join("");
}

async function pollResult(url: string, authKey: string): Promise<Buffer | null> {
  for (let i = 0; i < 90; i++) {
    await sleep(2000);
    try {
      const statusRes = await fetch(url, {
        headers: { Authorization: `Basic ${authKey}`, Accept: "application/json" },
      });
      if (!statusRes.ok) {
        logger.warn({ status: statusRes.status, attempt: i }, "D-ID poll status nao-OK");
        continue;
      }
      const data = (await statusRes.json()) as {
        status?: string;
        result_url?: string;
        error?: unknown;
      };

      if (i % 5 === 0) {
        logger.info({ status: data.status, attempt: i }, "D-ID poll...");
      }

      if (data.status === "done" && data.result_url) {
        const videoRes = await fetch(data.result_url);
        if (!videoRes.ok) {
          logger.error({ status: videoRes.status }, "D-ID download do video falhou");
          return null;
        }
        const buf = await videoRes.arrayBuffer();
        logger.info({ kb: Math.round(buf.byteLength / 1024) }, "D-ID video pronto!");
        return Buffer.from(buf);
      }

      if (data.status === "error" || data.status === "rejected") {
        logger.error({ data }, "D-ID erro de processamento");
        return null;
      }
    } catch (err) {
      logger.warn({ err, attempt: i }, "D-ID poll excecao");
    }
  }
  logger.error("D-ID timeout apos 180s de polling");
  return null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
