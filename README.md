# Engineering OS — 12-Month Top 1% Roadmap

A fully interactive personal study dashboard to track your journey from Computer Foundations to AI Systems Mastery.

## Features

- ✅ **Per-topic checkboxes** — mark each subtopic as complete, auto-saved to localStorage
- 📋 **Cheat Sheets** — write custom notes per topic section (supports **bold**, `code`, # headings, - bullets)
- 📚 **Resources** — add links (articles, videos, docs, courses) per month
- 📊 **Progress rings** — live SVG rings per month and per phase
- ⭐ **Bookmarks** — star months to revisit
- 🎯 **Weekly Focus** — write what you're studying this week
- 🏆 **Completion celebration** — animation when a month hits 100%
- ⏱ **Pomodoro timer** — floating 25/5 focus timer
- 📚 **Library tab** — browse all saved cheat sheets and resources
- 💾 **Fully offline** — everything saved in localStorage, no account needed

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev
```

## Deploy to GitHub Pages

### Step 1 — Update `vite.config.js`
Open `vite.config.js` and change `'my-roadmap'` to your actual GitHub repository name:
```js
base: '/your-actual-repo-name/',
```

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow at `.github/workflows/deploy.yml` will auto-deploy on every push to `main`
5. Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Tech Stack

- React 18 + Vite
- localStorage for persistence
- Zero external dependencies beyond React
- GitHub Actions for CI/CD

## Structure

```
src/
  App.jsx      # Full app — all data, components, and logic
  main.jsx     # React entry point
index.html
vite.config.js
.github/workflows/deploy.yml
```
