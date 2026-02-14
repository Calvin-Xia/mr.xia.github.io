# Repository Guidelines

## Project Structure & Module Organization
This repository is a static website with page files at the root and shared assets in dedicated folders.
- Root pages: `index.html`, `about.html`, `Works.html`, `timetable.html`, `statement.html`, `404.html`.
- Styles: `css/style.css`.
- Scripts: `js/main.js`, `js/navigation.js`.
- Blog content and metadata: `blog/` (including `blog-files.json` and `blog-metadata.json`).
- Other assets: `storage/`, `UpdateLog/`, `.well-known/`.

When adding new files, keep them in the existing folder conventions and use relative links.

## Build, Test, and Development Commands
No build step is required; this is plain HTML/CSS/JS.
- `python -m http.server 8000`: Start a local static server.
- `npx http-server`: Alternative local server for Node users.
- Open `http://localhost:8000` and verify pages manually.

## Coding Style & Naming Conventions
- Languages: HTML5, CSS3, vanilla JavaScript (ES6+).
- Indentation: 4 spaces across HTML, CSS, and JS.
- Naming: prefer `kebab-case` for asset files; keep existing page naming patterns (for example `Works.html`).
- Reuse CSS variables in `:root` before introducing one-off colors/spacings.
- Keep JS organized by feature modules, matching `js/main.js` style.

## Testing Guidelines
There is no automated test framework configured in this repository.
Before submitting changes:
- Check layout and behavior on desktop and mobile widths.
- Validate navigation and interactive components (for example timer/tool interactions).
- Confirm browser console has no new errors.
- For blog updates, ensure both `blog/blog-files.json` and `blog/blog-metadata.json` are updated consistently.

## Commit & Pull Request Guidelines
Recent history shows short, task-focused commit subjects (English or Chinese). Follow that style:
- Use concise, imperative commit messages.
- Keep one logical change per commit.
- In PRs, include: summary of changes, affected files/pages, manual test notes, and screenshots for UI changes.
- Link related issues when applicable.

## Security & Configuration Tips
- Do not commit secrets or private credentials.
- Modify `.well-known/` files only when domain/certificate verification requires it.
