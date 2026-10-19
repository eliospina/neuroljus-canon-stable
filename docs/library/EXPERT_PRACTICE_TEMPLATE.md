# Expert practice notes — template

Expert practice notes bring practice knowledge from books into the library (Hejlskov Elvén, Greene, Durand, Prizant…). They sit next to the studies, labelled as **expert practice**, never as science.

## Rules

- **Your own words only.** Write the idea as you understood it. Never copy sentences from the book. The validator rejects any quoted passage longer than 12 words.
- **Always the source:** author, book, year, and chapter or page.
- **Three languages:** es, en and sv for `practice`, `when` and `limits`.
- **No diagnosis, no medication, no supplements, no diets.** The validator rejects these words in `practice` and `when`.
- **No real cases.** Describe the idea, not a person you have met (tystnadsplikt).
- `limits` says what the idea does not claim and who it may not fit.

## How to add one

1. Copy the example below into the list in `data/library/expert_practice.json` (the file starts as `[]`).
2. Fill in every field.
3. Run `npm run library:expert`. It validates every entry, merges the notes into the library and rebuilds the index. If an entry is wrong, nothing is merged and the error says which field to fix.
4. Run `npm test`.

## Fields

| Field | What goes in it |
| --- | --- |
| `slug` | Lower-case words joined by `-`, unique. Becomes the id `EXPERT:<slug>`. |
| `title` | A short title for the idea, in English. |
| `topics` | One or more of: `sensory`, `communication_aac`, `crisis_regulation`, `challenging_behavior`, `sleep`, `anxiety`, `feeding`, `school`, `adult_life`, `family_caregivers`, `transitions`, `women_girls`, `pain_health`. |
| `citation.author` | Author(s) of the book. |
| `citation.book` | Book title. |
| `citation.year` | Year of the edition you read. |
| `citation.locator` | Chapter or page, e.g. `ch. 3` or `pp. 45-52`. |
| `practice` | The idea, in your words (es / en / sv). |
| `when` | When it helps (es / en / sv). |
| `limits` | What it does not claim, who it may not fit (es / en / sv). |
| `writtenBy` | Your name. |
| `addedAt` | Date, `YYYY-MM-DD`. |

## Empty entry

```json
{
  "slug": "",
  "title": "",
  "topics": [],
  "citation": { "author": "", "book": "", "year": 0, "locator": "" },
  "practice": { "es": "", "en": "", "sv": "" },
  "when": { "es": "", "en": "", "sv": "" },
  "limits": { "es": "", "en": "", "sv": "" },
  "writtenBy": "",
  "addedAt": ""
}
```
