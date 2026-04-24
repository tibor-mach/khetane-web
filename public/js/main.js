// Mark the current nav link as active based on the URL.
(function () {
  const hereFile = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    const linkFile =
      (href === "./" ? "index.html" : href.split("/").pop()) || "index.html";
    if (hereFile === linkFile) link.classList.add("active");
  });
})();

// Render upcoming concerts from data/concerts.json on the concerts page.
(function () {
  const list = document.getElementById("concert-list");
  if (!list) return;

  fetch("data/concerts.json")
    .then((r) => r.json())
    .then((concerts) => {
      const now = new Date();
      const upcoming = concerts
        .filter((c) => new Date(c.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (upcoming.length === 0) {
        list.innerHTML =
          '<li class="concert"><div class="date">—</div><div><div class="venue">Momentálně nemáme naplánované žádné koncerty</div><div class="city">Mrkněte sem za chvíli nebo nás sledujte na sociálních sítích.</div></div></li>';
        return;
      }

      list.innerHTML = upcoming
        .map((c) => {
          const d = new Date(c.date);
          const date = d.toLocaleDateString("cs-CZ", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const ticket = c.ticket_url
            ? `<a class="ticket" href="${c.ticket_url}" target="_blank" rel="noopener">Vstupenky</a>`
            : "";
          return `
            <li class="concert">
              <div class="date">${date}</div>
              <div>
                <div class="venue">${c.venue}</div>
                <div class="city">${c.city}</div>
              </div>
              ${ticket}
            </li>`;
        })
        .join("");
    })
    .catch(() => {
      list.innerHTML =
        '<li class="concert"><div class="date">!</div><div><div class="venue">Koncerty se nepodařilo načíst</div></div></li>';
    });
})();
