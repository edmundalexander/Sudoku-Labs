Sudoku-Labs — Deploy Guide
===========================

Quick overview
- Frontend: static site (index.html + code.js) — can be hosted on GitHub Pages.
- Backend: Google Apps Script (uses Google Sheets as a simple DB).

Steps to deploy
1. Create Apps Script project
	- Open https://script.google.com and create a new project.
	- Create a file named `Code.gs` and paste the contents of `apps_script/Code.gs` from this repo.
	- In the Apps Script editor: Deploy → New deployment → select **Web app**.
	  - Execute as: **Me**
	  - Who has access: **Anyone** (or **Anyone, even anonymous** for public access)
	- Click Deploy and copy the `exec` URL (it looks like `https://script.google.com/macros/s/XXXXX/exec`).

2. Configure your spreadsheet
	- Open the spreadsheet with the `SHEET_ID` (the ID in `apps_script/Code.gs`).
	- Ensure the account that deploys the Apps Script can edit the spreadsheet.
	- (Optional) Run `setupSheets_()` from the Apps Script editor to create `Leaderboard`, `Chat`, and `Logs` sheets.

3. Update the frontend
	- In `index.html`, set the `GAS_URL` constant to the Apps Script `exec` URL you copied.

4. Host the frontend on GitHub Pages
	- Push this repo to GitHub.
	- In repository Settings → Pages, enable Pages for the `main` branch and root folder `/`.
	- After Pages is published, open the site and verify functionality (leaderboard/chat) — calls will go to the Apps Script web app.

Notes & troubleshooting
- If calls return CORS or blocked errors, confirm the Apps Script is deployed with access set to allow anonymous requests.
- Apps Script quotas apply; for heavy traffic consider moving the backend to Cloud Run / Cloud Functions using the Sheets API and a service account.
- Do NOT put any private keys in the frontend.

If you want, I can:
- Deploy the Apps Script for you (I can prepare the final `Code.gs` and a checklist), or
- Patch `index.html` to embed the `GAS_URL` automatically once you provide the `exec` URL.


