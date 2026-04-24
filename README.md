# Khetane — band website

Static website for **Khetane**, a gipsy funk band.

Plain HTML, CSS and a tiny bit of JavaScript — no build step, no framework.
Everything the browser serves lives under [`public/`](public/). The site
itself has no Python dependency.

Python (managed with [uv](https://docs.astral.sh/uv/)) is used only for
dev tooling: [`pre-commit`](.pre-commit-config.yaml) and a smoke test at
[`scripts/smoketest.py`](scripts/smoketest.py).

## Pages

| Page                                    | Purpose                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| [`index.html`](public/index.html)       | Home / hero                                                                   |
| [`about.html`](public/about.html)       | Band story and members                                                        |
| [`music.html`](public/music.html)       | Spotify embed + songs with collapsible lyrics                                 |
| [`media.html`](public/media.html)       | YouTube videos and photos                                                     |
| [`concerts.html`](public/concerts.html) | Upcoming shows, loaded from [`data/concerts.json`](public/data/concerts.json) |

Social links (Facebook, Instagram) live in the footer of every page.

## Run it locally

The site is plain static files. Any static file server will do. The
simplest option is Python's stdlib server (requires only Python 3 — no
virtualenv, no dependencies):

```bash
python3 -m http.server 8000 --directory public
```

Then open <http://localhost:8000>.

If you get `OSError: [Errno 98] Address already in use`, something else is
on port 8000 — either pick another port (`python3 -m http.server 8765 …`)
or find the culprit with `ss -tlnp | grep :8000`.

## Smoke test

There's a smoke test that boots the server and checks every page and
asset actually serves:

```bash
uv sync                                # first time only
uv run python scripts/smoketest.py
```

The smoke test is the canonical "is the site broken?" check — run it
before pushing changes.

## Editing content

- **Shows** — edit [`public/data/concerts.json`](public/data/concerts.json).
  Past dates are filtered out automatically.
- **Songs & lyrics** — edit [`public/music.html`](public/music.html). Each
  song is a `<div class="song">` block with a `<details>` for lyrics.
  The lyrics `<div>` is wrapped in `<!-- prettier-ignore -->` so its line
  breaks survive formatting — keep that comment when adding new songs.
- **Spotify embed** — on Spotify, click Share → Embed, and drop the URL
  into the `<iframe src="…">` on the music page.
- **Videos** — on a YouTube video, use Share → Embed, and replace
  `VIDEO_ID` in [`public/media.html`](public/media.html).
- **Photos** — drop JPEGs into [`public/assets/`](public/assets/) and
  reference them via `background-image: url('/assets/your-photo.jpg')` on
  the `.thumb` divs in `media.html`.

## Dev tooling (pre-commit)

We use [uv](https://docs.astral.sh/uv/) to manage Python tooling.

```bash
# one-time setup
uv sync
uv run pre-commit install

# run against all files
uv run pre-commit run --all-files
```

Hooks configured in [`.pre-commit-config.yaml`](.pre-commit-config.yaml):

- whitespace / end-of-file / line-ending fixes
- YAML / JSON syntax checks
- Prettier formatting for HTML, CSS, JS, JSON, Markdown, YAML

## Deploying

Since the whole site is just the contents of [`public/`](public/), you can
host it on anything that serves static files.

### AWS (S3 + CloudFront)

1. Create an S3 bucket (e.g. `khetane-web`) with public access blocked.
2. Upload the contents of `public/` to the bucket root.
3. Put a CloudFront distribution in front of it (origin = the S3 bucket).
   - Default root object: `index.html`
   - A small CloudFront Function can rewrite `/about` → `/about.html` so
     extensionless URLs work the same as in local dev.
4. Point your domain's DNS at the CloudFront distribution.

### Azure (Storage Account static website)

1. Create a Storage Account and enable **Static website** in its settings.
2. Set the index document to `index.html`.
3. Upload the contents of `public/` to the `$web` container.
4. Point your domain at the Storage Account's static web endpoint (or
   front it with Azure Front Door for a custom domain + TLS).

## Project layout

```
khetane-web/
├── public/              # the website — deploy this folder
│   ├── index.html
│   ├── about.html
│   ├── music.html
│   ├── media.html
│   ├── concerts.html
│   ├── css/styles.css
│   ├── js/main.js
│   ├── data/concerts.json
│   └── assets/
├── scripts/smoketest.py # boots the server and checks every page
├── pyproject.toml       # Python tooling (pre-commit) via uv
├── .pre-commit-config.yaml
├── .gitignore
└── README.md
```
