import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";

import {
  type Book,
  recommendBookParams,
  recommendBookFromDataset,
  RecommendBookArgs,
} from "./tool/recommendBook";

type BooksFile = { books: Book[] };

function loadBooks(): Book[] {
  const booksPath = path.resolve(
    process.cwd(),
    "..",
    "data-ingestion/data",
    "books.json"
  );

  if (!fs.existsSync(booksPath)) {
    throw new Error(
      `books.json not found at ${booksPath}. Run: python data-ingestion/fetch_books.py`
    );
  }

  const raw = fs.readFileSync(booksPath, "utf-8");
  const parsed = JSON.parse(raw) as BooksFile;

  if (!parsed.books || !Array.isArray(parsed.books)) {
    throw new Error(`Invalid books.json format. Expected { "books": [...] }`);
  }

  return parsed.books;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in your environment.");
  }

  const books = loadBooks();
  console.log("Book Recommendation Agent");
  console.log(`Loaded ${books.length} books.\n`);
  console.log('Type something like: "Recommend a fantasy book"');
  console.log('Type "exit" to quit.\n');

  const rl = readline.createInterface({ input, output });

  const recommendBookTool = tool({
    description:
      "Recommend a book from the local dataset for the requested genre. Only return books from the dataset.",
    parameters: recommendBookParams,
    execute: (async ({ genre }: RecommendBookArgs) => {
      const book = recommendBookFromDataset(books, genre);

      if (!book) {
        return {
          found: false,
          message: `No books found for genre "${genre}". Try one of: science_fiction, mystery, fantasy, thriller.`,
        };
      }

      return {
        found: true,
        book,
      };
    }) as any,
  } as any);

  while (true) {
    const userText = await rl.question("You: ");
    if (userText.trim().toLowerCase() === "exit") break;

    const result = await streamText({
      model: openai("gpt-5"),
      system: [
        "You are a Book Recommendation Agent.",
        "You MUST call the recommendBook tool to select a book.",
        "Only recommend books returned by the tool.",
        "If the tool returns found=false, politely explain available genres.",
        "Keep the response short and helpful.",
      ].join(" "),
      messages: [{ role: "user", content: userText }],
      tools: {
        recommendBook: recommendBookTool,
      },
    });

    process.stdout.write("\nAgent: ");
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    process.stdout.write("\n\n");
  }

  rl.close();
  console.log("Later");
}

main().catch((err) => {
  console.error("\nError:", err?.message ?? err);
  process.exit(1);
});
