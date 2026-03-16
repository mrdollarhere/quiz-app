# 🎯 Quiz App — Google Sheets Powered

> A zero-backend, self-contained quiz application. Drop in an HTML file, connect a Google Sheet, and you have a fully-featured quiz platform with 11 question types, scoring, grade badges, and response logging — all for free.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Questions Types](https://img.shields.io/badge/Question%20Types-11-blue)
![No Server Required](https://img.shields.io/badge/Backend-None%20Required-brightgreen)
![Google Sheets](https://img.shields.io/badge/Data-Google%20Sheets-orange)

---
## 🔗 Live Demo
Check out the application in action: **[https://quiz-app-dntrng.vercel.app/](https://quiz-app-dntrng.vercel.app/)**

*Note: You can click **"Load Tests"** without a URL to explore the built-in demo datasets.*

---


## ✨ Features

- **11 question types** — radio, checkbox, true/false, dropdown, rating, text, ordering (drag), matching (drag), multiple true/false, matrix/Likert, and hotspot (click-on-image)
- **3 quiz modes** — Train (ordered, relaxed), Test (randomised), and Race (wrong answer = restart)
- **Auto-scoring** with animated score ring, grade badge (A–D), and full answer review
- **Response logging** — every submission is written to a `Responses` tab in your Google Sheet
- **No server, no database, no build step** — one HTML file + Google Apps Script
- **Works offline after load** — quiz runs entirely in the browser
- **Demo mode built-in** — 4 sample tests load automatically when no URL is configured
- **Image support on all question types** — add any public image URL to any question
- **Mobile-friendly** — touch drag-and-drop works for ordering and matching questions

---

## 📸 Demo

Open `index.html` in any browser and click **Load Tests** without entering a URL. Four built-in sample tests covering all 11 question types will load instantly — no Google account required.

---

## 🏗️ Architecture

```
index.html  ←→  Google Apps Script (Web App)  ←→  Google Sheet
(Browser)        (Free Google API, acts as REST)    (Questions + Responses)
```

| Component | Role |
|---|---|
| `index.html` | The entire app — UI, quiz logic, scoring, drag-and-drop |
| Apps Script | A small bridge deployed as a web endpoint; reads questions, writes responses |
| Google Sheet | Your content source and response database |

Everything is read dynamically — no rebuild needed when you add or edit questions.

---

## 🚀 Getting Started

### Prerequisites

- A Google account (free)
- A web browser
- No npm, no Node.js, no CLI tools

### Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a blank spreadsheet.
2. Rename the first tab to **`Tests`** (case-sensitive).
3. Add the columns listed in the [Tests tab reference](#tests-tab) and populate at least one row.
4. For each test, create a new tab whose name matches the `sheet` column value exactly.
5. In each questions tab, add headers in Row 1 and questions from Row 2 onwards. See the [Questions tab reference](#questions-tab).

### Step 2 — Add the Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete any existing code in `Code.gs`.
3. Paste the full script from the [Apps Script](#apps-script) section below.
4. Save with `Ctrl+S` or the 💾 icon.

### Step 3 — Deploy as a Web App

1. Click **Deploy** (top-right) → **New deployment**.
2. Click the ⚙️ gear next to "Select type" → choose **Web app**.
3. Set these options:

   | Setting | Value |
   |---|---|
   | Execute as | **Me** |
   | Who has access | **Anyone** |

4. Click **Deploy**, then authorise when Google prompts you.
5. Copy the URL — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

> **Security note:** Anyone with this URL can read your questions and write responses. Treat it like a password. Do not commit it to a public repository.

### Step 4 — Open the App

1.  **Locate your Web App URL**: Ensure you have the URL copied from the Google Apps Script deployment in Step 3 (it should end in `/exec`).
2.  **Update `index.html`**:
    * Open `index.html` in your text editor.
    * Find the line that defines the script URL (typically within the `<script>` tag at the top or bottom):
    ```javascript
    const SCRIPT_URL = ''; // Paste your URL between the quotes
    ```
3.  **Update `js/main.js`**:
    * Open the `js/main.js` file.
    * Locate the same constant definition at the top of the file:
    ```javascript
    const SCRIPT_URL = ''; // Paste your URL here as well
    ```
4.  **Save and Deploy**: Save both files. If you are hosting on GitHub Pages or Vercel, commit and push these changes to make your quiz live.
---

## 📋 Sheet Structure

Your spreadsheet needs three types of tabs:

| Tab | Purpose | Notes |
|---|---|---|
| `Tests` | Lists all available tests as selector cards | One row per test |
| `Questions_XYZ` | Questions for a specific test | Tab name must exactly match the `sheet` column in Tests |
| `Responses` | Submitted answers with scores | Auto-created on first submission |

> Tab names are **case-sensitive**. `Questions_Math` ≠ `questions_math`.

### Tests tab

| Column | Description | Example |
|---|---|---|
| `id` | Unique row number | `1` |
| `title` | Test name shown on the card | `Math Quiz` |
| `description` | Short description | `Test your arithmetic` |
| `icon` | Emoji for the card | `🧮` |
| `sheet` | Exact name of the Questions tab | `Questions_Math` |
| `duration` | Duration pill | `10 min` |
| `difficulty` | Difficulty pill — `Easy`, `Medium`, or `Hard` | `Medium` |
| `color` | Card accent colour (hex) | `#7c6af7` |

### Questions tab

| Column | Used by | Format |
|---|---|---|
| `id` | all | Unique row number |
| `question` | all | Question text |
| `type` | all | See question types below |
| `imageUrl` | all (optional) | Public image URL — shown above any question type; required for `hotspot` |
| `options` | most types | Pipe-separated values e.g. `A\|B\|C` |
| `correct` | most types | Answer key — format varies by type |
| `required` | all | `TRUE` or `FALSE` |
| `ratingMin` | `rating` only | Low-end label e.g. `Poor` |
| `ratingMax` | `rating` only | High-end label e.g. `Excellent` |
| `ratingScale` | `rating` only | Number of steps e.g. `5` |
| `matrixCols` | `matrix` only | Pipe-separated column headers |

---

## ❓ Question Types

All 11 types share the same column names. Only the values in `options` and `correct` differ.

### `radio` — Single Choice
```
options:  Red|Blue|Green|Yellow
correct:  Blue
```

### `checkbox` — Multi Select
```
options:  Dog|Eagle|Whale|Snake|Cat
correct:  Dog|Whale|Cat
```

### `text` — Free Text
```
options:  (leave blank)
correct:  (leave blank — not scored)
```

### `rating` — Rating Scale
```
options:     (leave blank)
correct:     (leave blank — not scored)
ratingMin:   Poor
ratingMax:   Excellent
ratingScale: 5
```

### `dropdown` — Dropdown Select
```
options:  A|B|C
correct:  A  (optional)
```

### `truefalse` — True / False
```
options:  (leave blank)
correct:  TRUE  or  FALSE
```

### `mtf` — Multiple True/False
Each statement gets its own True/False toggle. All must match for full marks.
```
options:  Sun is a star|Water boils at 50°C|DNA is a double helix
correct:  TRUE|FALSE|TRUE
```

### `ordering` — Drag to Order
Write options in the **correct** order. The app shuffles them before displaying.
```
options:  Ant|Mouse|Cat|Horse
correct:  Ant|Mouse|Cat|Horse   (same as options)
```

### `matching` — Drag to Match
Use `::` to pair each prompt with its answer.
```
options:  France::Paris|Japan::Tokyo|Brazil::Brasília
correct:  France::Paris|Japan::Tokyo|Brazil::Brasília   (same as options)
```

### `matrix` — Grid / Likert Scale
Rows are items; columns are choices. Leave `correct` blank for a survey.
```
options:    Math|Science|History
matrixCols: Poor|OK|Good|Excellent
correct:    Math::Good|Science::Excellent|History::OK   (or blank)
```

### `hotspot` — Click the Image
Zones use **percentage coordinates** so they scale to any screen.
```
imageUrl: https://example.com/world-map.png
options:  Europe:28%,15%,20%,25%|Asia:50%,12%,35%,38%
correct:  Europe
```
Zone format: `Label:left%,top%,width%,height%`

---

## 📊 Responses & Scoring

The `Responses` tab is auto-created on first submission. Each row is one completed attempt.

| Column | Contents |
|---|---|
| `timestamp` | ISO date-time |
| `name` | Name entered by the user |
| `test` | Title of the test |
| `score` | Percentage e.g. `75%` — `N/A` for surveys |
| `grade` | `A` / `B` / `C` / `D` — `N/A` for surveys |
| `correct` | Count of correct answers |
| `wrong` | Count of wrong answers |
| `total` | Total scoreable questions |
| `q1_...` | User's answer to question 1 |
| `q2_...` | User's answer to question 2, and so on |

### Grade thresholds

| Grade | Range | Label |
|---|---|---|
| 🏆 A | 90–100% | Excellent! |
| ⭐ B | 75–89% | Good Job! |
| 📚 C | 60–74% | Keep Practising |
| 💡 D | 0–59% | Try Again |

---

## 🔧 Apps Script

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
  const body = JSON.parse(e.postData.contents);
  const action = e.parameter.action;
  if (action === 'saveResponse')      return respond(saveResponse(body));
  if (action === 'saveTest')          return respond(saveTest(body));
  if (action === 'deleteTest')        return respond(deleteTest(body));
  if (action === 'saveQuestion')      return respond(saveQuestion(body));
  if (action === 'deleteQuestion')    return respond(deleteQuestion(body));
  if (action === 'getResponses')      return respond(getResponses());
  if (action === 'exportResponsesCsv') return respond(exportResponsesCsv());
  return respond({ error: 'Unknown action: ' + action });
}

// ── READ ────────────────────────────────────────────
function getTests() {
  const sheet = SS.getSheetByName('Tests');
  if (!sheet) return { tests: [] };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  return { tests: rows.slice(1).filter(r => r[0] !== '').map(r => Object.fromEntries(h.map((k,i) => [k, r[i]]))) };
}

function getQuestions(name) {
  const sheet = SS.getSheetByName(name);
  if (!sheet) return { questions: [], error: 'Sheet not found: ' + name };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  return { questions: rows.slice(1).filter(r => r[0] !== '').map(r => Object.fromEntries(h.map((k,i) => [k, r[i]]))) };
}

function getResponses() {
  const sheet = SS.getSheetByName('Responses');
  if (!sheet) return { responses: [] };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  return { responses: rows.slice(1).filter(r => r[0] !== '').map(r => Object.fromEntries(h.map((k,i) => [k, r[i]]))).reverse() };
}

// ── SAVE QUIZ RESPONSE ───────────────────────────────
function saveResponse(data) {
  let sheet = SS.getSheetByName('Responses');
  if (!sheet) sheet = SS.insertSheet('Responses');
  if (sheet.getLastRow() === 0)
    sheet.appendRow(['timestamp','name','test','score','grade','correct','wrong','total',...Object.keys(data.answers)]);
  sheet.appendRow([new Date().toISOString(), data.name||'', data.testTitle||'', data.score||'', data.grade||'', data.correct??'', data.wrong??'', data.total??'', ...Object.values(data.answers)]);
  return { success: true };
}

// ── TESTS CRUD ───────────────────────────────────────
function saveTest(data) {
  let sheet = SS.getSheetByName('Tests');
  if (!sheet) {
    sheet = SS.insertSheet('Tests');
    sheet.appendRow(['id','title','description','icon','sheet','duration','difficulty','color']);
  }
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  const idCol = h.indexOf('id');
  const existingIdx = rows.findIndex((r, i) => i > 0 && String(r[idCol]) === String(data.id));
  const rowData = h.map(k => data[k] !== undefined ? data[k] : '');
  if (existingIdx > 0) {
    sheet.getRange(existingIdx + 1, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function deleteTest(data) {
  const sheet = SS.getSheetByName('Tests');
  if (!sheet) return { success: false, error: 'Tests sheet not found' };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  const idCol = h.indexOf('id');
  const sheetCol = h.indexOf('sheet');
  const idx = rows.findIndex((r, i) => i > 0 && String(r[idCol]) === String(data.id));
  if (idx < 0) return { success: false, error: 'Test not found' };
  // Delete the questions sheet too
  const sheetName = rows[idx][sheetCol];
  const qSheet = SS.getSheetByName(sheetName);
  if (qSheet) SS.deleteSheet(qSheet);
  sheet.deleteRow(idx + 1);
  return { success: true };
}

// ── QUESTIONS CRUD ───────────────────────────────────
function saveQuestion(data) {
  const sheetName = data.sheet;
  if (!sheetName) return { success: false, error: 'No sheet name provided' };
  let sheet = SS.getSheetByName(sheetName);
  if (!sheet) {
    sheet = SS.insertSheet(sheetName);
    sheet.appendRow(['id','question','type','imageUrl','options','correct','required','ratingMin','ratingMax','ratingScale','matrixCols']);
  }
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  const idCol = h.indexOf('id');
  const existingIdx = rows.findIndex((r, i) => i > 0 && String(r[idCol]) === String(data.id));
  const rowData = h.map(k => data[k] !== undefined ? data[k] : '');
  if (existingIdx > 0) {
    sheet.getRange(existingIdx + 1, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function deleteQuestion(data) {
  const sheet = SS.getSheetByName(data.sheet);
  if (!sheet) return { success: false, error: 'Sheet not found: ' + data.sheet };
  const rows = sheet.getDataRange().getValues(), h = rows[0];
  const idCol = h.indexOf('id');
  const idx = rows.findIndex((r, i) => i > 0 && String(r[idCol]) === String(data.id));
  if (idx < 0) return { success: false, error: 'Question not found' };
  sheet.deleteRow(idx + 1);
  return { success: true };
}

// ── EXPORT ───────────────────────────────────────────
function exportResponsesCsv() {
  const sheet = SS.getSheetByName('Responses');
  if (!sheet) return { csv: '' };
  const rows = sheet.getDataRange().getValues();
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  return { csv };
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
```

### Re-deploying after script changes

If you edit the script, changes only take effect after a re-deploy:

1. Click **Deploy → Manage deployments**.
2. Click the ✏️ pencil icon on your deployment.
3. Change **Version** to **New version**.
4. Click **Deploy**. The URL stays the same.

---

## 🛠️ Customisation

### Adding a new test
1. Add a row to the `Tests` tab with a unique `id`, `title`, `icon`, and `sheet` name.
2. Create a new tab with that exact `sheet` name.
3. Add column headers in Row 1, then your questions from Row 2.
4. No code changes needed — the app reads the `Tests` tab dynamically on every load.

### Editing questions
Edit cells in your Questions tab directly. Changes take effect on the next page load.

### Changing question order
Reorder rows in your Questions tab. The `id` column only needs to be unique, not sequential.

### Changing the colour scheme
All colours are defined at the top of `index.html` in the `tailwind.config` block:
```javascript
colors: {
  bg:       '#0a0a0f',   // page background
  surface:  '#13131a',   // card background
  accent:   '#7c6af7',   // primary purple
  accent2:  '#f76a8a',   // pink
  accent3:  '#6af7c4',   // teal / green
}
```
Change any hex value and save — no build step required.

### Self-hosting
`index.html` is a single file with no local dependencies. Host it anywhere:
- GitHub Pages (free) — commit the file and enable Pages
- Netlify / Vercel drop — drag and drop the file
- Any static web host or CDN
- Locally — just double-click the file

---

## 🐛 Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Questions don't load | URL wrong or script not deployed | URL must end in `/exec`, not `/dev` |
| CORS error in console | "Who has access" is not **Anyone** | Redeploy with **Anyone** access |
| Tests tab shows nothing | Tab not named `Tests` exactly | Check capitalisation — case-sensitive |
| "Sheet not found" error | Questions tab name mismatch | Copy-paste the tab name into the `sheet` column |
| Responses not saving | Script not authorised | Redeploy, re-authorise, then copy the new URL |
| `matrix` question broken | `matrixCols` column missing | Add a `matrixCols` column with pipe-separated headers |
| `hotspot` zones not working | `imageUrl` column blank | `hotspot` requires a public image URL |
| `mtf` always marked wrong | `correct` column format wrong | Must be `TRUE\|FALSE\|TRUE` — one per statement |
| Ordering shows same order | Browser cached the saved answer | Hard-refresh (`Ctrl+Shift+R`) |
| Image not loading | Non-public URL | Use a direct URL — Google Drive requires the file to be published publicly |
| Script changes not reflected | Old deployment still active | Re-deploy: Deploy → Manage → edit → New version → Deploy |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** this repository.
2. **Clone** your fork: `git clone https://github.com/your-username/quiz-app.git`
3. Make your changes to `index.html` (the entire app lives in this one file).
4. **Test** by opening the file in a browser. Use Demo Mode (no URL needed) to test all question types.
5. Open a **Pull Request** with a clear description of what you changed and why.

### Ideas for contributions

- New question types (e.g. fill-in-the-blank, code editor)
- Timer / countdown mode per test
- Question-level feedback / explanations shown after each answer
- Localisation / i18n support
- Light theme
- Import questions from CSV or JSON
- Export results to CSV

### Reporting bugs

Please open a GitHub Issue and include:
- What you expected to happen
- What actually happened
- Browser and OS
- Any console errors (open DevTools → Console)

---

## 📁 Project Structure

```
quiz-app/
├── index.html     # The entire application — UI, logic, styles, demo data
└── README.md      # This file
```

There is intentionally no build system, no `package.json`, and no dependencies to install. The app uses:

- [Tailwind CSS](https://tailwindcss.com) via Play CDN (no build step)
- [Google Fonts](https://fonts.google.com) — Syne + DM Sans
- Vanilla JavaScript (ES2020)
- Google Apps Script (server-side, in your own Google account)

---

## 📜 License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

Built with [Tailwind CSS](https://tailwindcss.com), hosted on your own Google account via [Google Apps Script](https://developers.google.com/apps-script). No third-party services, no tracking, no costs.

---

*Quiz App · Google Sheets Powered · 11 question types · 3 quiz modes · no server required*
