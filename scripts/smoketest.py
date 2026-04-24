"""Smoke test for the Khetane static site.

Boots `python3 -m http.server` against `public/` on a free port, fetches
every page and asset, and asserts that the responses look right. Run this
before claiming a change is done.

    uv run python scripts/smoketest.py
"""

from __future__ import annotations

import json
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

# (path, substring that must appear in the response body)
PAGES: list[tuple[str, str]] = [
    ("/", "<title>Khetane — Gipsy Funk</title>"),
    ("/index.html", "<title>Khetane — Gipsy Funk</title>"),
    ("/about.html", "<title>O kapele — Khetane</title>"),
    ("/music.html", "<title>Hudba — Khetane</title>"),
    ("/media.html", "<title>Fotky &amp; videa — Khetane</title>"),
    ("/concerts.html", "<title>Koncerty — Khetane</title>"),
]

ASSETS: list[str] = [
    "/css/styles.css",
    "/js/main.js",
    "/data/concerts.json",
]


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("", 0))
        return s.getsockname()[1]


def wait_until_up(url: str, timeout: float = 5.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=0.5)
            return
        except (urllib.error.URLError, ConnectionError):
            time.sleep(0.05)
    raise RuntimeError(f"server never came up at {url}")


def fetch(url: str) -> tuple[int, str]:
    with urllib.request.urlopen(url, timeout=2) as r:
        return r.status, r.read().decode("utf-8", errors="replace")


def main() -> int:
    port = free_port()
    base = f"http://127.0.0.1:{port}"

    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port), "--directory", str(PUBLIC)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    failures: list[str] = []
    try:
        wait_until_up(f"{base}/")

        for path, needle in PAGES:
            try:
                status, body = fetch(base + path)
            except Exception as e:  # noqa: BLE001
                failures.append(f"GET {path} raised {e!r}")
                continue
            if status != 200:
                failures.append(f"GET {path} → {status}")
                continue
            if needle not in body:
                failures.append(f"GET {path} missing expected substring: {needle!r}")

        for path in ASSETS:
            try:
                status, body = fetch(base + path)
            except Exception as e:  # noqa: BLE001
                failures.append(f"GET {path} raised {e!r}")
                continue
            if status != 200:
                failures.append(f"GET {path} → {status}")

        try:
            concerts = json.loads(fetch(f"{base}/data/concerts.json")[1])
            if not isinstance(concerts, list) or not concerts:
                failures.append("concerts.json is not a non-empty list")
            else:
                required = {"date", "venue", "city"}
                for i, c in enumerate(concerts):
                    missing = required - c.keys()
                    if missing:
                        failures.append(f"concerts[{i}] missing keys: {sorted(missing)}")
        except Exception as e:  # noqa: BLE001
            failures.append(f"concerts.json did not parse: {e!r}")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            proc.kill()

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1

    print(f"OK — {len(PAGES)} pages + {len(ASSETS)} assets served from {PUBLIC}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
