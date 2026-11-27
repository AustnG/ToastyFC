# Toasty FC Film Room (`video-pipeline/`)

Local Windows 10 (**RTX 3070 NVENC + 980 PRO NVMe + Synology DS720+ `V:` drive**) AI video review, human verification UI, calibration loop, **1080p highlight renderer (Option A)**, and **DaVinci Resolve Free `.fcpxml` backup exporter (Option B)**.

## One-Time Setup on Your Windows PC

1. **Install FFmpeg (with NVIDIA NVENC):**
   ```powershell
   winget install Gyan.FFmpeg
   ```
   Verify `ffmpeg -encoders | findstr nvenc` shows `h264_nvenc`.
2. **Install Python 3.11+ & `toasty-film`:**
   ```powershell
   cd video-pipeline
   python -m venv .venv
   .venv\Scripts\activate
   pip install -e ".[dev]"
   ```
3. **Configure `.env`:**
   Copy `.env.example` → `.env` and fill in:
   - `GEMINI_API_KEY` (free key from [Google AI Studio](https://aistudio.google.com/apikey))
   - `GOOGLE_SERVICE_ACCOUNT_JSON_PATH` (same Google Cloud Service Account JSON from `docs/PUBLISHING_SETUP.md` — grant **Editor** permission on `Toasty FC Database` so **Approve & Push** can write verified stats)
   - `NAS_ROOT=V:\ToastyFC` and `NVME_SCRATCH=C:\ToastyScratch`

## Overnight / While-at-Work Workflow

1. **Drop raw Veo 4K or Mevo 1080p files into a match folder on `V:\`:**
   ```text
   V:\ToastyFC\2026_Winter\2026-11-29_m95_Semline\raw\veo.mp4
   ```
   *(For multi-angle Mevo games, edit the auto-generated `match_config.json` to pick `primary_videos` and park extra angles under `bonus_angles`.)*

2. **Run unattended overnight (one game or an entire season folder):**
   ```powershell
   toasty-film analyze V:\ToastyFC\2026_Winter
   ```
   Creates tiny 720p/2fps NVENC proxies on your NVMe scratch drive, analyzes both teams' stats + Toasty FC player attribution with your `#cabba2` (`TOA`) kit & attendance list, and saves `draft_review.json` locally (**never writes unreviewed stats to Google Sheets**).

3. **5-Minute Review the Next Morning:**
   ```powershell
   toasty-film review
   ```
   Opens `http://127.0.0.1:8765` in your browser:
   - Confirm every goal (scorer, assist, and 5 on-court checkboxes → auto-computes exact `plusMinus`)
   - Verify any `<100%` confidence AI clips & nudge clip trims (`±2s`)
   - Every correction automatically updates `calibration/calibration_log.json` so future matches get smarter
   - Click **Dry-Run Sheets Diff** → **Approve & Push to Sheets** → **Render 1080p + DaVinci FCPXML**

4. **Upload & Publish:**
   - Upload `output\<matchId>_highlights_1080p.mp4` + `output\youtube_chapters.txt` to YouTube (or open `output\<matchId>_davinci.fcpxml` in **DaVinci Resolve Free** for optional manual tweaks).
   - Paste the YouTube URL in `Matches` and click **Toasty FC → Publish to Website** in Google Sheets!

## Ground-Truth Benchmarking (Mevo & Veo)
Compare AI draft stats against a match you've already tracked by hand in Google Sheets:
```powershell
toasty-film benchmark V:\ToastyFC\2023_Winter\2023-11-04_m21_Semline
```
