# Project rules for Claude

## Always verify the site works before claiming a task done

This is a website. "The code looks right" is not the same as "it works." Before telling the user a change is complete:

1. Run the smoke test: `uv run python scripts/smoketest.py` — it boots a server, fetches every page and asset, and checks that each page contains its expected title. It must exit 0.
2. If you changed anything visual (CSS, layout, colours), say so explicitly — the smoke test does not render the page, it only checks that HTML/CSS/JS/JSON are served correctly with the right titles. Visual review is on the user unless they ask you to do more.
3. If you add a new page or rename one, update [scripts/smoketest.py](scripts/smoketest.py)'s `PAGES` list in the same change.

Do not rely on `curl` status codes alone — a 200 with broken HTML is still broken. The smoke test's substring assertions exist because of this.

## Python via uv only

The project uses `uv` for every Python tool. Do not:

- run bare `python` / `python3` against project scripts (use `uv run python ...`)
- create a separate `venv/`, call `pip`, or install anything globally
- add Python deps outside `pyproject.toml`

Setup: `uv sync` once. Run anything via `uv run <cmd>`.

Python is **only** for dev tooling (pre-commit, smoke test). The site itself is static HTML/CSS/JS and has no Python runtime dependency. To serve it locally, `python3 -m http.server 8000 --directory public` is enough (stdlib only, no venv needed) — but prefer `uv run python scripts/smoketest.py` when you want to verify behaviour.

## Keep it simple

The user wants readable code over cleverness. Specifically:

- No build step, no bundlers, no frameworks. Plain HTML/CSS/JS.
- Duplication across the 5 HTML pages (shared nav/footer) is fine — easier to read than a template engine.
- Content lives in obvious places: concerts in `public/data/concerts.json`, lyrics inline in `public/music.html`, etc.
