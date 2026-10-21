/* ---------- Showroom: highlight today's hours and show open / closed ---------- */
(function () {
    const rows = document.querySelectorAll("#showroom .vs-hours li");
    if (!rows.length) return;

    /* the showroom's local time (Hamilton, Ontario), whatever the visitor's timezone */
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Toronto", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const now = Number(get("hour")) * 60 + Number(get("minute"));
    const mins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

    rows.forEach((li) => {
        if (!li.dataset.days.split(",").map(Number).includes(day)) return;
        li.classList.add("is-today");
        const open = now >= mins(li.dataset.open) && now < mins(li.dataset.close);
        const status = document.querySelector("#showroom .vs-status");
        status.textContent = open ? "Open now" : "Closed now";
        status.classList.toggle("is-open", open);
        status.hidden = false;
    });
})();
