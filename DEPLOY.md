# Deploy the CompTIA Study Library on GitHub Pages

A one-time, ~10-minute setup. After this, students just need the URL.

---

## What you'll end up with

A public link like:
`https://YOUR-USERNAME.github.io/CompTIA-Study-Library/`

You paste that link into Google Classroom. Students click it and start studying. Done.

---

## The easy path — using GitHub Desktop (recommended if you don't love the terminal)

### 1. Create the repo on GitHub
1. Go to **https://github.com/new**
2. Repository name: `CompTIA-Study-Library`
3. Choose **Public** (Pages requires this on free accounts)
4. **Don't** check "Initialize with a README" — we already have one
5. Click **Create repository**

### 2. Push the files
1. Install **GitHub Desktop** if you don't have it: https://desktop.github.com/
2. In GitHub Desktop: **File → Clone repository → URL tab** → paste your new repo URL → choose where to save (anywhere is fine; or pick the Desktop folder itself).
3. Copy the contents of `C:\Users\Admin\Desktop\CompTIA-Study-Library` into the cloned folder. (If you cloned into the Desktop folder directly, GitHub Desktop will already see all the files.)
4. Back in GitHub Desktop, you'll see all the files listed as changes.
5. Bottom-left: summary "**Initial commit**" → click **Commit to main**.
6. Top-right: click **Push origin**.

### 3. Turn on GitHub Pages
1. On the repo page on github.com, click **Settings** (top-right of the repo).
2. Left sidebar: click **Pages**.
3. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `/ (root)` → click **Save**
4. Wait 1–2 minutes. Refresh the Pages settings page. You'll see:
   > Your site is live at `https://YOUR-USERNAME.github.io/CompTIA-Study-Library/`

That URL is what you share with students.

---

## The terminal path — if you have Git installed already

Open a terminal in `C:\Users\Admin\Desktop\CompTIA-Study-Library`:

```bash
git init
git add .
git commit -m "Initial commit — CompTIA Study Library"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/CompTIA-Study-Library.git
git push -u origin main
```

Then do **step 3** above to enable Pages.

---

## Test it before sharing with students

Once the green "Your site is live at..." appears:

1. Open the URL in an **incognito/private window** (so your own browser cache doesn't lie to you).
2. Click into Tech+ → confirm tabs switch, flashcards flip, quiz scores correctly.
3. Try it on your phone too — students will.

---

## Sharing with students

Easiest flow for Google Classroom:

1. Create an Assignment titled **"CompTIA Certification — Week of [date]"**.
2. Paste the GitHub Pages URL as the link.
3. Description (copy/paste):

   > This week you'll work through one CompTIA exam at your own pace. Open the link and follow the Day 1 → Day 5 plan on the landing page. On **Thursday**, take the practice quiz and **screenshot your score card** (with your name in the browser tab visible) — submit that screenshot here. Target: **72% or higher**. If you score below 72%, retake Friday and submit your best score.

4. Set the due date to Friday end-of-day.
5. Attach the screenshot upload field.

---

## Updating later

When you want to fix typos or add more quiz questions:

- **GitHub Desktop:** edit the files locally → GitHub Desktop sees the change → commit → push. The live site updates in 30–60 seconds.
- **Terminal:** `git add . && git commit -m "Update X" && git push`

---

## Troubleshooting

**"404 — File not found" when I hit the URL**
→ Wait 2 more minutes. First deploy can be slow. Then hard-refresh (Ctrl+Shift+R).

**Pages settings shows "Source: None"**
→ You didn't push anything yet. Go back to step 2.

**The page loads but tabs/quiz don't work**
→ Hard-refresh once. If still broken, check the browser console (F12). Ping me.

**Student says they lost their progress**
→ Progress is saved per-browser via localStorage. If they switched devices or cleared cookies, it resets. The quiz and flashcards still work fine — they just start fresh.
