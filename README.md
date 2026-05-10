# CompTIA Study Library

Interactive web-based study materials for CompTIA certification exams. Built for students — no logins, no setup, runs in any browser (desktop, tablet, or phone).

## Live site

Once GitHub Pages is enabled, the library will be at:
**`https://<your-github-username>.github.io/CompTIA-Study-Library/`**

That's the single link to share with students.

## What's included

| Exam | Code | Study Guide | Flashcards | Quiz Questions | Activities |
|---|---|---|---|---|---|
| **Tech+** | FC0-U71 | ✅ | 24 cards | 25 Qs | ✅ |
| **A+** | 220-1101 / 220-1102 | ✅ | 174 cards | 60 Qs | ✅ |
| **Network+** | N10-009 | ✅ | 174 cards | 60 Qs | ✅ |
| **Security+** | SY0-701 | ✅ | 178 cards | 60 Qs | ✅ |

Every exam page also includes a cheat sheet, vocabulary glossary, and a results screen students can screenshot for submission.

## How students use it

The landing page (`index.html`) lays out a 5-day weekly assignment plan:

- **Monday** — Study Guide: read 3 domain sections
- **Tuesday** — Flashcards: drill to 75%+ Got It
- **Wednesday** — Vocabulary + Cheat Sheet
- **Thursday** — Practice Quiz: target 72% (CompTIA passing score) → **screenshot result and submit to Google Classroom**
- **Friday** — Activities + retake quiz if needed

Progress saves automatically in each student's browser, so they can pick up where they left off.

## Deploying on GitHub Pages

See `DEPLOY.md` for the 5-minute setup guide.

## File structure

```
CompTIA-Study-Library/
├── index.html            ← landing page + weekly assignment plan
├── techplus.html         ← Tech+ study hub
├── aplus.html            ← A+ study hub
├── network_plus.html     ← Network+ study hub
├── security_plus.html    ← Security+ study hub
├── README.md             ← this file
└── DEPLOY.md             ← step-by-step GitHub Pages setup
```

All pages are standalone HTML — no build step, no dependencies, no external assets required.
