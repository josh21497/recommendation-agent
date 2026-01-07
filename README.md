# AI Book Recommendation CLI

## Overview
This is a small CLI app that recommends books by genre using an **AI agent + tool** pattern.  
The user provides a natural-language request (e.g. “I want a mystery book”), the agent interprets intent, calls a recommendation tool, and returns a short explanation of the result.

---

## How It Works
1. **User Input**  
   The user enters a free-form request in the CLI.

2. **Agent Interpretation**  
   An AI agent receives the request along with strict system instructions that require it to:
   - Select a book via a tool
   - Only describe results returned by the tool

3. **Tool Invocation (Structured Data)**  
   The agent calls a recommendation tool with structured parameters validated at runtime using Zod.

4. **Explanation Step**  
   A second AI pass converts the tool’s structured output into a concise, user-friendly response.

---

## Data Handling
- Books are loaded from a local `books.json` file
- The file is parsed and validated at runtime
- Genre input is normalized to ensure consistent matching
- If no matching book is found, the tool returns a safe fallback (`found: false`)

---

## Why This Design
- **Separation of concerns**  
  - AI decides *what* to ask for  
  - Tools decide *what data is valid*  
  - App logic decides *how to handle results*

- **Deterministic behavior**  
  Tool execution and explanation are intentionally split to improve reliability, debuggability, and streaming control.

- **Defensive by default**  
  Runtime validation prevents malformed AI inputs or bad data from crashing the app.

---

## Tech Stack
- Node.js
- TypeScript
- Python (data ingestion)
- Zod (runtime schema validation)
- OpenAI API (agent + tool calling)
