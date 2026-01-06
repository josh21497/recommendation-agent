import { z } from "zod";

export type Book = {
  title: string | null;
  author: string | null;
  first_publish_year: number | null;
  subject: string;
};

export const recommendBookParams = z.object({
  genre: z.string(),
});

export type RecommendBookArgs = z.infer<typeof recommendBookParams>;

function normalizeGenre(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export function recommendBookFromDataset(
  books: Book[],
  genreRaw: string
): Book | null {
  const genre = normalizeGenre(genreRaw);

  const matches = books.filter((b) => normalizeGenre(b.subject) === genre);

  if (matches.length === 0) return null;

  return matches[0];
}
