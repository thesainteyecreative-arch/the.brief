# THE BRIEF. 2.0

A mobile-first fictional corporate law firm workspace for **Harrington, Vale & Sterling LLP**, personalized for **Ilyana Pastranos, Rotational Legal Trainee**. Charcoal, oxblood, and ivory with an editorial luxury design.

## Included

- Firm inbox with AI-generated assignments, partner replies, saved drafts, and unread tracking.
- Corporate & Transactions, Entertainment & Sports, and White-Collar Defense & Investigations departments.
- Three matter files with exhibits, notes, and status tracking, including a healthcare acquisition.
- Open-ended interviews, negotiations, contract review, supervisor coaching, and saved transcripts.
- LSAT Academy: 12 original questions with explanations and four legal foundations lessons.
- Eastern Time weekly docket, completion checkboxes, and calendar export.
- Progress tracking, AI feedback rubrics, JSON backup/import, and original-version migration.

## Upload to a separate GitHub branch

1. Extract `THE-BRIEF-2.0-source.zip`.
2. In your existing GitHub repository, open the branch selector. Type `brief-2-preview` and choose **Create branch: brief-2-preview from main**.
3. Confirm the branch selector says **brief-2-preview**.
4. Choose **Add file → Upload files**. Upload the **contents of the extracted `the-brief-v2` folder**, including subfolders. `index.html`, `package.json`, and `vercel.json` must be at the repository root. Do not upload the ZIP itself or wrap everything in another folder.
5. Commit to **brief-2-preview**. Leave `main` unchanged and do not merge yet.

The original app is preserved in `legacy/v1.html`, which is excluded from the public build. Hidden files `.gitignore` and `.env.example` are also included; enable “show hidden files” if needed. Never upload a populated `.env` file.

## Test through Vercel Preview

1. Use the Vercel project connected to this repository. Its **Production Branch** should remain `main`.
2. The feature-branch commit normally creates a Preview automatically. If needed, choose **Create Deployment**, select `brief-2-preview`, and select **Preview**. Do not select Production or Promote to Production.
3. Settings: **Framework: Other**, **Root Directory: repository root**, **Build Command: `npm run build`**, **Output Directory: `dist`**. Build/output settings are included in `vercel.json`; `package.json` selects Node.js 24.
4. Use your existing server-side **`OPENAI_API_KEY`** variable. Confirm its Vercel scope includes **Preview**. Do not give it a `VITE_`, `NEXT_PUBLIC_`, or other public prefix. Redeploy the Preview after any environment-variable changes.
5. Open the Preview URL. Keep Vercel Deployment Protection enabled; sign in if required.

If the Vercel project is connected to another repository, use a separate test project for this repository and keep its Production Branch set to `main`. Variables are project-specific, so configure the key directly in Vercel for that test project. Keep your current production domains assigned to their existing project.

### Preview checklist

- On your phone, navigate all eight sections.
- Send an inbox response and confirm the supervisor addresses your actual analysis.
- Request a new assignment in each department.
- Read exhibits, save matter notes, change status, and refresh to check persistence.
- Start a simulation, exchange several free-text turns, ask for coaching, and export a transcript.
- Answer an LSAT question and complete a foundation lesson; check My progress.
- Complete a docket task and verify it survives refresh.
- Export a progress backup and test importing it. Import asks before replacing this browser's work.

This ZIP does not merge branches, promote deployments, or replace your website.

## Local development

Use Node.js 24. No dependency installation is required.

```sh
npm run dev
npm test
npm run build
```

Open the local URL printed by the server. Your Vercel key is available on Vercel; local AI needs a local environment variable. If needed, set it securely in your shell or an ignored `.env.local` and run `node --env-file=.env.local dev.mjs`. Never commit that file.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Website entry point |
| `styles.css` | Responsive design |
| `app.js` | Frontend views and interactions |
| `data.js` | Fictional matters, departments, questions, and lessons |
| `state.js` | Persistence, progress, backups, and migration |
| `api/firm.js` | Vercel server-side API route |
| `server/ai.js` | Validated OpenAI requests and safe error handling |
| `package.json` | Node version and dev/test/build commands |
| `vercel.json` | Build settings, functions, and security headers |
| `scripts/build.mjs` | Builds the six public assets into `dist/` |
| `tests/workspace.test.js` | API, persistence, migration, and docket tests |
| `legacy/v1.html` | Original app copy, excluded from deployment output |

## AI, data, and testing

The browser calls `/api/firm`; **only the server reads `OPENAI_API_KEY`**. The default model is `gpt-5.4-mini`, with an optional server-only `OPENAI_MODEL` override. The server uses the OpenAI Responses API, structured output, and `store: false`. Credentials are never bundled into public assets.

Requests include the fictional matter, your notes, the opening message, and up to 30 recent messages. Full transcripts remain in browser storage. The API validates input, checks supplied origins, limits payloads, and applies a best-effort instance-local throttle. Keep Vercel Deployment Protection enabled for this personal workspace; the throttle is not a globally durable abuse limit. Failed AI requests preserve your draft.

Progress is **browser-local**, with no account database or cross-device sync. Preview and production domains have separate storage. Use My progress → Export backup / Import backup to move your work. Calendar export is a study plan; the app does not send background email or change your ChatGPT reminders.

Tests cover the API contract using a mock provider, persistence, malformed backups, original-version migration, Eastern Time dates, and provider failures. The build checks JavaScript syntax and scans public assets for key patterns. Mobile browser checks cover navigation, LSAT explanations, and draft preservation. **Live AI must still be checked in your Vercel Preview using the configured key.**

This is fictional education, not legal advice or professional credentials. AI feedback may contain mistakes. LSAT questions are original, unofficial practice; accuracy is not a predicted LSAT score.

`scripts/mobile-qa.html` is a development-only 390px layout harness, excluded from the public build.
