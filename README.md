# Quiz App — Google Sheets Powered

A self-contained HTML quiz app that reads questions from a Google Sheet and writes every response — name, score, grade, and per-question answers — back to the same sheet. No server required. Powered by Google Apps Script.

---

## Table of Contents

1. [How It Works](#1-how-it-works)
2. [User Flow](#2-user-flow)
3. [Question Types (11 Total)](#3-question-types-11-total)
4. [Sheet Structure](#4-sheet-structure)
5. [Setup Guide](#5-setup-guide)
6. [Apps Script Code](#6-apps-script-code)
7. [Reading Responses](#7-reading-responses)
8. [Making Changes](#8-making-changes)
9. [Troubleshooting](#9-troubleshooting)
10. [Quick Reference](#10-quick-reference)

---

## 1. How It Works

```
quiz-app.html   <-->   Apps Script (Web App)   <-->   Google Sheet
  (Browser)              (Free Google API)          (Questions + Responses)
```

| Part | Role |
|------|------|
| `quiz-app.html` | The quiz UI — open in any web browser, no install needed |
| Apps Script | The bridge — a free Google service deployed as a REST API |
| Google Sheet | Stores all questions; receives all submitted responses |

---

## 2. User Flow

| Step | Screen | What happens |
|------|--------|--------------|
| 1 | **Config URL** | Paste your Apps Script URL and click Load Tests |
| 2 | **Test Selector** | User picks a test from the card grid |
| 3 | **Name Entry** | User types their name (saved with their responses) |
| 4 | **Quiz** | Questions one-by-one with Previous / Next navigation |
| 5 | **Result** | Animated score ring, grade badge, full answer review |

> **Demo mode:** Leave the URL blank and click Load Tests to run with 4 built-in sample tests covering all 11 question types.

---

## 3. Question Types (11 Total)

Every type uses the same column names in the Google Sheet. The `options` and `correct` column formats differ per type — details below.

---

### 🔘 `radio` — Single Choice

User picks exactly one option from a list.

| Column | Value |
|--------|-------|
| `options` | `A\|B\|C\|D` |
| `correct` | `B` |

```
id  question              type   options              correct  required
1   What color is the sky? radio  Red|Blue|Green|Yellow  Blue     TRUE
```

---

### ☑️ `checkbox` — Multi Select

User ticks all that apply. Pipe-separate multiple correct answers.

| Column | Value |
|--------|-------|
| `options` | `A\|B\|C\|D` |
| `correct` | `A\|C` (pipe-separated) |

```
id  question       type      options                    correct       required
2   Pick mammals   checkbox  Dog|Eagle|Whale|Snake|Cat  Dog|Whale|Cat  TRUE
```

---

### ✏️ `text` — Free Text

Open-ended typed response. Not auto-scored.

| Column | Value |
|--------|-------|
| `options` | *(leave blank)* |
| `correct` | *(leave blank)* |

---

### ⭐ `rating` — Rating Scale

Numbered scale (e.g. 1–5). Uses three extra columns. Not scored.

| Column | Value |
|--------|-------|
| `options` | *(leave blank)* |
| `correct` | *(leave blank)* |
| `ratingMin` | `Poor` |
| `ratingMax` | `Excellent` |
| `ratingScale` | `5` |

---

### ▼ `dropdown` — Dropdown Select

Single select from a dropdown list. Correct answer is optional.

| Column | Value |
|--------|-------|
| `options` | `A\|B\|C` |
| `correct` | `A` *(optional)* |

---

### ⚡ `truefalse` — True / False

Binary True or False answer. `correct` must be exactly `TRUE` or `FALSE`.

| Column | Value |
|--------|-------|
| `options` | *(leave blank)* |
| `correct` | `TRUE` or `FALSE` |

---

### ✅ `mtf` — Multiple True/False

A list of statements — user marks each one **True or False independently**. All must match to score the question.

| Column | Value |
|--------|-------|
| `options` | `Stmt1\|Stmt2\|Stmt3` |
| `correct` | `TRUE\|FALSE\|TRUE` — one per statement, same order, pipe-separated |

```
id  question                   type  options                                              correct
3   Are these true or false?   mtf   Sun is a star|Water boils at 50C|DNA is double helix  TRUE|FALSE|TRUE
```

> **Scoring:** All statements must match exactly — all-or-nothing per question.

> **Stored as:** `TRUE|FALSE|TRUE` (pipe-separated, one value per statement)

---

### 🔀 `ordering` — Drag to Order

User drags items into the correct sequence. Items are displayed in a **shuffled random order** — write `options` in the correct order.

| Column | Value |
|--------|-------|
| `options` | `Item1\|Item2\|Item3` *(in correct order)* |
| `correct` | `Item1\|Item2\|Item3` *(same as options)* |

```
id  question                      type      options                    correct
4   Order smallest to largest     ordering  Ant|Mouse|Cat|Horse         Ant|Mouse|Cat|Horse
```

> **Note:** The app shuffles display automatically. Write both `options` and `correct` with the same value — the correct sequence.

> **Stored as:** The order the user placed items in, pipe-separated.

---

### 🔗 `matching` — Drag to Match

User drags answer chips onto matching prompts. Use `::` (double colon) to pair each prompt with its answer.

| Column | Value |
|--------|-------|
| `options` | `Prompt1::Answer1\|Prompt2::Answer2` |
| `correct` | same as `options` |

```
id  question          type      options                                   correct
5   Match capitals    matching  France::Paris|Japan::Tokyo|Brazil::Brasilia  France::Paris|Japan::Tokyo|Brazil::Brasilia
```

> **Note:** Write the same value in both `options` and `correct`.

> **Stored as:** `Prompt1::Answer1|Prompt2::Answer2` — the user's pairings.

---

### 🔲 `matrix` — Grid / Likert Scale

A table grid — rows are items/statements, columns are options. User picks **one column per row**. Requires the extra `matrixCols` column.

| Column | Value |
|--------|-------|
| `options` | `Row1\|Row2\|Row3` *(row labels)* |
| `matrixCols` | `Col1\|Col2\|Col3` *(column headers — required new column)* |
| `correct` | `Row1::ColX\|Row2::ColY` *(optional — leave blank for survey)* |

```
id  question          type    options               matrixCols                   correct
6   Rate each subject matrix  Math|Science|History  Poor|OK|Good|Excellent       (blank = survey)
7   Classify animals  matrix  Dog|Eagle|Whale        Mammal|Bird|Fish|Reptile    Dog::Mammal|Eagle::Bird|Whale::Mammal
```

> **Survey mode:** Leave `correct` blank — the question is not scored, just recorded.

> **Scored mode:** Fill `correct` with `Row::Column` pairs for each row.

> **Scoring:** All rows must match their correct column — all-or-nothing per question.

> **Stored as:** `Row1::ColX|Row2::ColY` — the user's selections.

---

### 📍 `hotspot` — Click the Image

User clicks a defined zone on an image. Zones use **percentage coordinates** so they scale correctly on any screen size. Requires the `imageUrl` column.

| Column | Value |
|--------|-------|
| `imageUrl` | `https://example.com/image.jpg` *(required for hotspot)* |
| `options` | `Label:left%,top%,width%,height%\|Label2:…` |
| `correct` | `Label` *(the zone label to click)* |

```
id  question            type     imageUrl                        options                                                       correct
8   Click on Europe     hotspot  https://…/world-map.png         Europe:28%,15%,20%,25%|Asia:50%,12%,35%,38%|Africa:30%,38%,20%,30%  Europe
```

**Zone format:** `Label:left%,top%,width%,height%`
- All four values are percentages relative to the image container
- Users see invisible clickable zones; hovering shows the zone label
- Multiple zones can be defined — only one is correct

> **Stored as:** The label of the zone the user clicked (e.g. `Europe`).

---

## 4. Sheet Structure

Your Google Sheet needs three types of tabs:

| Tab name | Purpose | Notes |
|----------|---------|-------|
| `Tests` | Lists all tests as selector cards | One row per test |
| `Questions_XYZ` | Questions for a specific test | Tab name must match the `sheet` column in Tests |
| `Responses` | All submitted answers with scores | Auto-created on first submission |

> **Important:** Tab names are case-sensitive. `Questions_Math` ≠ `questions_math`.

---

### Tests tab — column reference

| Column | Description | Example |
|--------|-------------|---------|
| `id` | Unique row number | `1` |
| `title` | Test name shown on selector card | `Math Quiz` |
| `description` | Short description on card | `Test your arithmetic skills` |
| `icon` | Emoji icon for the card | `🧮` |
| `sheet` | Exact name of the Questions tab | `Questions_Math` |
| `duration` | Duration pill shown on card | `10 min` |
| `difficulty` | Difficulty pill (Easy / Medium / Hard) | `Medium` |
| `color` | Card accent colour (hex) | `#7c6af7` |

---

### Questions tab — full column reference

| Column | Used by | Format / Notes |
|--------|---------|----------------|
| `id` | all | Unique row number: 1, 2, 3… |
| `question` | all | Question text shown to the user |
| `type` | all | `radio` `checkbox` `text` `rating` `dropdown` `truefalse` `mtf` `ordering` `matching` `matrix` `hotspot` |
| `imageUrl` | all *(optional)* | Public image URL — shown above the input for **any** type. Required for `hotspot`. |
| `options` | most types | Pipe-separated. Format varies by type — see Section 3. |
| `correct` | most types | Answer key. Format varies by type — see Section 3. |
| `required` | all | `TRUE` or `FALSE` |
| `ratingMin` | `rating` only | Left/low label e.g. `Poor` |
| `ratingMax` | `rating` only | Right/high label e.g. `Excellent` |
| `ratingScale` | `rating` only | Number of steps e.g. `5` |
| `matrixCols` | `matrix` only | Pipe-separated column headers e.g. `Poor\|OK\|Good\|Excellent` |

---

### imageUrl column — works with all types

Any question can show an image above its input by filling the `imageUrl` column with a public image URL.

```
Works with:   radio  checkbox  text  ordering  hotspot  mtf  matrix  ... all 11 types
```

Use direct image URLs ending in `.jpg`, `.png`, `.webp`, or `.svg`.
- ✅ Wikimedia Commons, Imgur, Unsplash — all provide direct URLs
- ❌ Google Drive links won't work unless the file is published publicly

---

## 5. Setup Guide

### Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a blank spreadsheet.
2. Rename the first tab to **`Tests`** and fill in the columns from the Tests tab reference above.
3. For each test, create a new tab named exactly to match its `sheet` column value.
4. In each Questions tab, add Row 1 as headers and your questions from Row 2 onwards.

---

### Step 2 — Add the Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete all existing code in `Code.gs`.
3. Paste the code from [Section 6](#6-apps-script-code) below.
4. Click the **Save** icon (💾 or `Ctrl+S`).

---

### Step 3 — Deploy as Web App

1. Click **Deploy** (top right) → **New deployment**.
2. Click the **⚙️ gear** next to "Select type" → choose **Web app**.
3. Set these options:

   | Setting | Required value |
   |---------|---------------|
   | Execute as | **Me** |
   | Who has access | **Anyone** ← required so the HTML app can call it |

4. Click **Deploy** and authorize when Google prompts you.
5. Copy the URL that appears — it looks like:

   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

> **Keep this URL private.** Anyone with it can read your questions and write responses.

---

### Step 4 — Open the Quiz App

1. Open `quiz-app.html` in any browser (double-click the file, or host it on any web server).
2. Paste the Apps Script URL into the config box.
3. Click **Load Tests** — your test cards appear.
4. Select a test, enter a name, and start!

---

## 6. Apps Script Code

Paste this entire block into `Code.gs`, replacing all existing content:

```javascript
const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action || 'getTests';
  if (action === 'getTests')     return respond(getTests());
  if (action === 'getQuestions') return respond(getQuestions(e.parameter.sheet));
  return respond({ error: 'Unknown action' });
}

function doPost(e) {
  return respond(saveResponse(JSON.parse(e.postData.contents)));
}

function getTests() {
  const sheet = SS.getSheetByName('Tests');
  if (!sheet) return { tests: [] };
  const rows = sheet.getDataRange().getValues();
  const h = rows[0];
  return {
    tests: rows.slice(1)
      .filter(r => r[0] !== '')
      .map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
  };
}

function getQuestions(name) {
  const sheet = SS.getSheetByName(name);
  if (!sheet) return { questions: [], error: 'Sheet not found: ' + name };
  const rows = sheet.getDataRange().getValues();
  const h = rows[0];
  return {
    questions: rows.slice(1)
      .filter(r => r[0] !== '')
      .map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
  };
}

function saveResponse(data) {
  let sheet = SS.getSheetByName('Responses');
  if (!sheet) sheet = SS.insertSheet('Responses');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'timestamp', 'name', 'test', 'score', 'grade',
      'correct', 'wrong', 'total',
      ...Object.keys(data.answers)
    ]);
  }

  sheet.appendRow([
    new Date().toISOString(),
    data.name     || '',
    data.testTitle || '',
    data.score    || '',
    data.grade    || '',
    data.correct  ?? '',
    data.wrong    ?? '',
    data.total    ?? '',
    ...Object.values(data.answers)
  ]);

  return { success: true };
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Re-deploying after script changes

If you edit the script code, you must re-deploy for changes to take effect:

1. Click **Deploy → Manage deployments**.
2. Click the **✏️ pencil icon** on your deployment.
3. Change **Version** to **New version**.
4. Click **Deploy**. The URL stays the same.

---

## 7. Reading Responses

The `Responses` tab is auto-created on first submission. Each row is one person's completed test.

### Columns in the Responses tab

| Column | What it contains |
|--------|-----------------|
| `timestamp` | ISO date-time e.g. `2025-03-15T10:32:00Z` |
| `name` | Name the user typed on the name screen |
| `test` | Title of the test taken |
| `score` | Percentage score e.g. `75%` — `N/A` for surveys |
| `grade` | `A` / `B` / `C` / `D` — `N/A` for surveys |
| `correct` | Number of correct answers |
| `wrong` | Number of wrong answers |
| `total` | Total number of scoreable questions |
| `q1_...` | Answer to question 1 (column named from question text) |
| `q2_...` | Answer to question 2 … and so on |

### Grade thresholds

| Grade | Score range | Label |
|-------|-------------|-------|
| 🏆 A | 90 – 100% | Excellent! |
| ⭐ B | 75 – 89% | Good Job! |
| 📚 C | 60 – 74% | Keep Practising |
| 💡 D | 0 – 59% | Try Again |

### How answers are stored per type

| Type | Stored as |
|------|-----------|
| `radio` | Selected option text e.g. `Blue` |
| `checkbox` | Pipe-separated selected options e.g. `Dog\|Whale\|Cat` |
| `text` | Typed text as-is |
| `rating` | Selected number e.g. `4` |
| `dropdown` | Selected option text |
| `truefalse` | `TRUE` or `FALSE` |
| `mtf` | Pipe-separated per-statement answers e.g. `TRUE\|FALSE\|TRUE` |
| `ordering` | Items in the order the user placed them e.g. `Ant\|Mouse\|Cat` |
| `matching` | Pipe-separated Prompt::Answer pairs e.g. `France::Paris\|Japan::Tokyo` |
| `matrix` | Pipe-separated Row::Column pairs e.g. `Math::Good\|Science::Excellent` |
| `hotspot` | Label of the zone clicked e.g. `Europe` |

---

## 8. Making Changes

### Adding a new test

1. Add a new row to the `Tests` tab with a unique `id`, `title`, `icon`, and `sheet` name.
2. Create a new tab in the spreadsheet with that exact `sheet` name.
3. Add your questions with the required column headers in Row 1.
4. No code changes needed — the app reads the `Tests` tab dynamically on every load.

### Editing existing questions

Just edit the cell values in your Questions tab directly. Changes are live on the next load.

### Changing the question order

Reorder the rows in your Questions tab. The `id` column doesn't need to be sequential — it's just a unique identifier.

---

## 9. Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Questions don't load | URL wrong or not deployed | URL must end in `/exec`, not `/dev` |
| CORS error in browser console | "Who has access" is not Anyone | Redeploy with Anyone access |
| Tests tab shows 0 results | Tab not named exactly `Tests` | Check capitalisation — case-sensitive |
| "Sheet not found" error | Questions tab name mismatch | Copy-paste the tab name into the `sheet` column exactly |
| Responses not saving | Script not authorized | Redeploy and re-authorize, then copy the new URL |
| `matrix` question broken | `matrixCols` column missing | Add a `matrixCols` column with pipe-separated column headers |
| `hotspot` zones not clickable | `imageUrl` column blank | `hotspot` type requires `imageUrl` — add a public image URL |
| `mtf` validation always fails | `correct` column wrong format | Must be `TRUE\|FALSE\|TRUE` — one per statement, pipe-separated |
| Ordering shows same order every time | Browser cached the saved answer | Hard-refresh the page (`Ctrl+Shift+R`) |
| Image not loading | Non-public image URL | Use a direct URL — Google Drive requires the file to be published publicly |
| Script changes not reflected | Old deployment still active | Re-deploy: Deploy → Manage → edit → New version → Deploy |

---

## 10. Quick Reference

### All 11 question types at a glance

| Type | `options` column | `correct` column | Extra columns | Notes |
|------|-----------------|-----------------|---------------|-------|
| `radio` | `A\|B\|C\|D` | `B` | — | One correct answer |
| `checkbox` | `A\|B\|C\|D` | `A\|C` | — | Pipe-separate correct answers |
| `text` | *(blank)* | *(blank)* | — | Not scored |
| `rating` | *(blank)* | *(blank)* | `ratingMin` `ratingMax` `ratingScale` | Not scored |
| `dropdown` | `A\|B\|C` | `A` *(optional)* | — | Single select |
| `truefalse` | *(blank)* | `TRUE` or `FALSE` | — | Binary answer |
| `mtf` | `Stmt1\|Stmt2\|Stmt3` | `TRUE\|FALSE\|TRUE` | — | One TRUE/FALSE per statement |
| `ordering` | `Item1\|Item2\|Item3` | `Item1\|Item2\|Item3` | — | Same in both — app shuffles display |
| `matching` | `P1::A1\|P2::A2` | `P1::A1\|P2::A2` | — | Same in both — `::` separates pairs |
| `matrix` | `Row1\|Row2\|Row3` | `Row1::Col\|Row2::Col` *(optional)* | `matrixCols` | Leave `correct` blank for survey |
| `hotspot` | `Label:x%,y%,w%,h%\|…` | `Label` | `imageUrl` *(required)* | Percentage zone coordinates |

### imageUrl — universal image support

```
imageUrl column = any public image URL
Works with ALL 11 question types
Shows image above the question input area
Required for hotspot, optional for all others
```

### Data format cheat sheet

```
Pipe separator:     |     used in options, correct (most types)
Pair separator:     ::    used in matching and matrix correct answers
Zone format:              Label:left%,top%,width%,height%

radio/dropdown:     correct = "Answer"
checkbox:           correct = "A|B|C"
truefalse:          correct = "TRUE" or "FALSE"
mtf:                correct = "TRUE|FALSE|TRUE"  (one per statement)
ordering:           correct = "Item1|Item2|Item3"  (correct sequence)
matching:           correct = "Prompt1::Answer1|Prompt2::Answer2"
matrix:             correct = "Row1::ColX|Row2::ColY"  (or blank)
hotspot:            correct = "ZoneLabel"
```

---

*Quiz App · Google Sheets Powered · 11 question types · scoring · grade badges · answer review*
