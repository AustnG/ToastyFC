# ToastyFC.com Publishing Setup (Option B — \$0/month Private Sheets + GitHub Pages)

`ToastyFC.com` is powered by a **build-time JSON snapshot** (`public/data/toasty-data.json`) compiled by GitHub Actions from your private Google Sheet (`Toasty FC Database`). Private fields (`perPlayerFee`, `teamFee`, `amountPaid`, and raw `dateOfBirth`) are stripped during the build and never reach the public website.

## One-Time Setup (Two Free Credentials)

### 1. Allow GitHub Actions to Read Your Private Google Sheet
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create or select a free project (e.g., `toasty-fc-site`).
2. Enable the **Google Sheets API** (*APIs & Services → Library → Google Sheets API → Enable*).
3. Create a Service Account (*IAM & Admin → Service Accounts → Create Service Account*, e.g., `toasty-sheets-reader`).
4. Open the service account → **Keys → Add Key → Create new key → JSON** (downloads a `.json` file).
5. Share `Toasty FC Database` in Google Sheets with the service account's `client_email` (`...@...iam.gserviceaccount.com`) as **Viewer**.
   - You can now lock `Toasty FC Database` to **Restricted (Private)** so no one on the internet can view the spreadsheet!
6. In GitHub (`AustnG/ToastyFC` → **Settings → Secrets and variables → Actions → New repository secret**):
   - Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Secret: paste the entire contents of the downloaded `.json` key file.

### 2. Enable the 1-Click "Publish to Website" Button Inside Google Sheets
1. Create a fine-grained GitHub Personal Access Token at [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new):
   - Repository access: **Only select repositories → `AustnG/ToastyFC`**
   - Repository permissions → **Actions: Read and write** (no other permissions needed).
2. Open `Toasty FC Database` → **Extensions → Apps Script**.
3. Copy the contents of [`scripts/apps-script-publish.gs`](../scripts/apps-script-publish.gs) into `Code.gs` and click **Save**.
4. Open **Project Settings (gear icon) → Script Properties → Add script property**:
   - Property: `GITHUB_PAT`
   - Value: your fine-grained token from step 1.
5. Reload your Google Sheet. You'll now see **Toasty FC → Publish to Website (ToastyFC.com)** in the top menu!

## Day-to-Day Workflow
- Edit your spreadsheet anytime (nothing half-finished appears on the live site).
- Click **Toasty FC → Publish to Website** whenever you want changes live (~45–60 seconds), or let the **automatic nightly sync** (2:00 AM Central) publish updates automatically.
