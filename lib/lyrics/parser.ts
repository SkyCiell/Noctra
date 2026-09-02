import { LyricLine, ParsedLyrics } from '@/types';

/**
 * Parses raw LRC text or plain text into a structured ParsedLyrics object
 */
export function parseLrcLyrics(rawText: string): ParsedLyrics {
  if (!rawText || !rawText.trim()) {
    return {
      isLrc: false,
      lines: [],
      plainText: '',
    };
  }

  const lines = rawText.split('\n');
  const parsedLines: LyricLine[] = [];
  let isLrc = false;
  let artist = '';
  let title = '';

  // Regex matching [01:23.45] or [01:23] or [01:23:45]
  const timeRegex = /\[(\d{2}):(\d{2})(?:[.:](\d{2,3}))?\]/g;
  const metaRegex = /\[(ti|ar|al|by|offset):([^\]]+)\]/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check metadata tags
    const metaMatch = trimmed.match(metaRegex);
    if (metaMatch) {
      isLrc = true;
      const key = metaMatch[1].toLowerCase();
      const val = metaMatch[2].trim();
      if (key === 'ti') title = val;
      if (key === 'ar') artist = val;
      continue;
    }

    // Check timestamp tags
    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length > 0) {
      isLrc = true;
      const textContent = trimmed.replace(timeRegex, '').trim();

      for (const m of matches) {
        const minutes = parseInt(m[1], 10);
        const seconds = parseInt(m[2], 10);
        let millis = 0;
        if (m[3]) {
          millis = m[3].length === 2 ? parseInt(m[3], 10) * 10 : parseInt(m[3], 10);
        }
        const totalTime = minutes * 60 + seconds + millis / 1000;

        parsedLines.push({
          time: Math.round(totalTime * 100) / 100,
          formattedTime: m[0],
          text: textContent || '♪ ♪ ♪',
        });
      }
    }
  }

  // Sort chronologically
  parsedLines.sort((a, b) => a.time - b.time);

  // If not LRC, treat as plain text lines spaced by arbitrary timing or just line list
  if (!isLrc || parsedLines.length === 0) {
    const plainLines = lines
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((text, idx) => ({
        time: idx * 5, // fallback 5s interval
        formattedTime: `[00:${String(idx * 5).padStart(2, '0')}]`,
        text,
      }));

    return {
      isLrc: false,
      lines: plainLines,
      plainText: rawText,
      artist,
      title,
    };
  }

  return {
    isLrc: true,
    lines: parsedLines,
    artist,
    title,
  };
}

/**
 * Finds the currently active lyric line index for a given playback time in seconds
 */
export function getActiveLyricIndex(lines: LyricLine[], currentTime: number): number {
  if (!lines || lines.length === 0) return -1;
  if (currentTime < lines[0].time) return 0;

  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) {
      return i;
    }
  }

  return 0;
}
