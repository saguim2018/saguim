export type VerseData = { v: number; text: string };

export type CommentaryItem = { verse: number; title: string; note: string };

export type Wesley = {
  background: string[];
  commentary: CommentaryItem[];
};

export type YouTubeData = {
  url: string;
  embed_url: string;
  title: string | null;
  channel: string | null;
  found_preferred: boolean;
  note?: string;
};

export type SongData = {
  number: number;
  title: string;
  first_line: string;
  key: string;
  tempo: string;
  tempo_category: string;
  lyrics: Record<string, string>;
  primary_theme: string;
  secondary_themes: string[];
  youtube: YouTubeData | null;
  sheet_images: string[];
};

export type DailyData = {
  date: string;
  passage: { ref: string; theme: string };
  bible: {
    ref: string;
    revised: VerseData[];
    modern: VerseData[];
  };
  wesley: Wesley;
  praise_thanks: SongData;
  praise_response: SongData;
  built_at: string;
};
