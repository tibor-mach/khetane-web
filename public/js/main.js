// Mark the current nav link as active based on the URL.
(function () {
  const here = location.pathname === "/" ? "/index.html" : location.pathname;
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href =
      link.getAttribute("href") === "/"
        ? "/index.html"
        : link.getAttribute("href");
    if (here === href) link.classList.add("active");
  });
})();

// Render upcoming concerts from /data/concerts.json on the concerts page.
(function () {
  const list = document.getElementById("concert-list");
  if (!list) return;

  fetch("/data/concerts.json")
    .then((r) => r.json())
    .then((concerts) => {
      const now = new Date();
      const upcoming = concerts
        .filter((c) => new Date(c.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (upcoming.length === 0) {
        list.innerHTML =
          '<li class="concert"><div class="date">—</div><div><div class="venue">No shows scheduled right now</div><div class="city">Check back soon, or follow us on social.</div></div></li>';
        return;
      }

      list.innerHTML = upcoming
        .map((c) => {
          const d = new Date(c.date);
          const date = d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const ticket = c.ticket_url
            ? `<a class="ticket" href="${c.ticket_url}" target="_blank" rel="noopener">Tickets</a>`
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
        '<li class="concert"><div class="date">!</div><div><div class="venue">Could not load shows</div></div></li>';
    });
})();
