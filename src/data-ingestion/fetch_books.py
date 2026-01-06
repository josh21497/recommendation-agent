import json
import os
import requests

BASE_URL = "https://openlibrary.org/subjects"
SUBJECTS = ["science_fiction", "mystery", "fantasy", "thriller"]
OUTPUT_PATH = os.path.join("data", "books.json")

def fetch_books_for_subject(subject):
    url = f"{BASE_URL}/{subject}.json?limit=25"
    print(f"Fetching books for genre: {subject}")

    response = requests.get(url)
    response.raise_for_status()

    data = response.json()
    books = []

    for work in data.get("works", []):
        books.append({
            "title": work.get("title"),
            "authors": [author.get("name") for author in work.get("authors", [])],
            "first_publish_year": work.get("first_publish_year"),
            "subject": subject
        })

    return books

def main():
    all_books = []

    for subject in SUBJECTS:
        books = fetch_books_for_subject(subject)
        all_books.extend(books)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump({"books": all_books}, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(all_books)} books to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()