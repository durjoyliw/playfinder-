import { validateRequest } from "@/auth";
import { getSportDisplay } from "@/lib/onboarding-sports";
import prisma from "@/lib/prisma";

export interface TrendingTopic {
  sport: string;
  label: string;
  emoji: string;
  word: string;
  mentions: number;
}

// How far back "right now" reaches, and how far back the baseline (what's
// normal) reaches. The baseline window is a superset of the trending
// window, fetched in a single query and then split in memory.
const TRENDING_WINDOW_DAYS = 7;
const BASELINE_WINDOW_DAYS = 30;
// A word needs at least this many distinct posts behind it in the trending
// window before it can qualify -- one throwaway post shouldn't crown a
// "trend".
const MIN_MENTIONS = 2;

// Grammar words plus PlayFinder-specific filler that carries no topical
// signal on its own (every post says some version of "looking to play" --
// that's not a trend, it's the whole app).
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "so", "of", "in", "on", "at",
  "to", "for", "with", "from", "by", "up", "out", "as", "is", "are", "be",
  "been", "was", "were", "am", "im", "i'm", "it", "its", "it's", "this",
  "that", "these", "those", "we", "you", "your", "our", "us", "my", "me",
  "who", "what", "when", "where", "why", "how", "not", "no", "yes", "just",
  "still", "yet", "more", "any", "all", "some", "one", "two", "three",
  "get", "got", "go", "going", "come", "here", "there", "near", "around",
  "today", "tonight", "tomorrow", "week", "weekend", "now", "later", "soon",
  "need", "needs", "needed", "want", "wants", "wanted", "looking", "look",
  "anyone", "someone", "everybody", "everyone", "guys", "folks", "people",
  "play", "playing", "played", "player", "players", "game", "games",
  "match", "matches", "team", "teams", "spot", "spots", "join", "joining",
  "hit", "let", "lets", "let's", "will", "can", "could", "would", "should",
  "have", "has", "had", "do", "does", "did", "don't", "dont", "please",
  "thanks", "thank", "new", "good", "great", "free", "time",
]);

function tokenize(content: string): Set<string> {
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(
      (w) =>
        w.length >= 3 &&
        !STOPWORDS.has(w) &&
        !/^\d+$/.test(w),
    );
  return new Set(words);
}

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baselineSince = new Date(
      Date.now() - BASELINE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    const trendingSince = new Date(
      Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );

    const posts = await prisma.post.findMany({
      where: {
        createdAt: { gte: baselineSince },
        deletedAt: null,
        visibility: "PUBLIC",
        sport: { not: null },
      },
      select: { sport: true, content: true, createdAt: true },
    });

    // Baseline: how often each word shows up across ALL sports normally.
    const baselineFreq = new Map<string, number>();
    let baselineTotalDocs = 0;

    // Per-sport: how often each word shows up in THIS sport's recent posts.
    const sportFreq = new Map<string, Map<string, number>>();
    const sportTotalDocs = new Map<string, number>();

    for (const post of posts) {
      if (!post.sport) continue;
      const tokens = tokenize(post.content);
      if (tokens.size === 0) continue;

      baselineTotalDocs += 1;
      for (const token of tokens) {
        baselineFreq.set(token, (baselineFreq.get(token) ?? 0) + 1);
      }

      if (post.createdAt >= trendingSince) {
        sportTotalDocs.set(post.sport, (sportTotalDocs.get(post.sport) ?? 0) + 1);
        let freq = sportFreq.get(post.sport);
        if (!freq) {
          freq = new Map();
          sportFreq.set(post.sport, freq);
        }
        for (const token of tokens) {
          freq.set(token, (freq.get(token) ?? 0) + 1);
        }
      }
    }

    const trending: TrendingTopic[] = [];

    for (const [sport, freq] of sportFreq.entries()) {
      const totalDocsForSport = sportTotalDocs.get(sport) ?? 0;
      if (totalDocsForSport === 0) continue;

      const display = getSportDisplay(sport);
      const excluded = new Set([
        ...sport.toLowerCase().split("_"),
        ...display.name.toLowerCase().split(/\s+/),
      ]);

      let bestWord: string | null = null;
      let bestScore = 0;
      let bestMentions = 0;

      for (const [word, mentions] of freq.entries()) {
        if (mentions < MIN_MENTIONS) continue;
        if (excluded.has(word)) continue;

        const sportRate = mentions / totalDocsForSport;
        const baselineRate =
          ((baselineFreq.get(word) ?? 0) + 1) / (baselineTotalDocs + 1);
        const score = sportRate / baselineRate;

        if (score > bestScore) {
          bestScore = score;
          bestWord = word;
          bestMentions = mentions;
        }
      }

      if (bestWord) {
        trending.push({
          sport,
          label: display.name,
          emoji: display.emoji,
          word: bestWord,
          mentions: bestMentions,
        });
      }
    }

    trending.sort((a, b) => b.mentions - a.mentions);

    return Response.json({ trending });
  } catch (error) {
    console.error("GET /api/discover/trending error:", error);
    return Response.json(
      { error: "Failed to load trending topics" },
      { status: 500 },
    );
  }
}
