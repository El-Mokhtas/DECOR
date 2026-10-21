/* ---------- Blog (demo articles) ----------
   Topic + page live in the URL (?topic=styling&page=2).
   Temporary content: to be replaced by articles from the backend. */
(function () {
    const IMG = "assets/imgs/products/";
    const TOPICS = {
        styling: { label: "Styling", icon: "fa-wand-magic-sparkles" },
        living: { label: "Living room", icon: "fa-couch" },
        bedroom: { label: "Bedroom", icon: "fa-bed" },
        carpets: { label: "Carpets", icon: "fa-rug" },
        care: { label: "Care guides", icon: "fa-hand-sparkles" },
    };

    const POSTS = [
        { slug: "warm-neutral-living-room", topic: "living", date: "2026-10-14", read: 6, img: "sofa-set/grey/1.jpg",
          title: "How to build a warm, neutral living room around one statement sofa",
          excerpt: "Start with the sofa, then layer texture, metal accents and light so the room feels calm but never flat." },
        { slug: "choosing-carpet-size", topic: "carpets", date: "2026-10-06", read: 4, img: "carpet/navy/2.jpg",
          title: "Choosing the right carpet size for your room",
          excerpt: "A simple rule for each room, and why a carpet that is slightly too big almost always looks better than one too small." },
        { slug: "bedroom-storage-ideas", topic: "bedroom", date: "2026-09-28", read: 5, img: "queen-bed-white/2.jpg",
          title: "Storage beds: calm bedrooms with nothing on show",
          excerpt: "Why a bed with built-in storage is the easiest way to keep a bedroom feeling open and serene." },
        { slug: "gold-accents", topic: "styling", date: "2026-09-19", read: 3, img: "sofa-set/rust/2.jpg",
          title: "Gold accents without the glare",
          excerpt: "Brushed gold works best in small doses. Here's where to use it — and where to hold back." },
        { slug: "velvet-care", topic: "care", date: "2026-09-10", read: 4, img: "sofa-set/taupe/3.jpg",
          title: "Caring for upholstered and velvet pieces",
          excerpt: "Everyday habits that keep fabrics looking new: brushing, rotating cushions and dealing with spills fast." },
        { slug: "kids-room-beds", topic: "bedroom", date: "2026-08-30", read: 5, img: "single-bed/pink/1.jpg",
          title: "A kids' room that grows with them",
          excerpt: "Pick a single bed with a soft headboard and storage, then let colours and accessories change as they grow." },
        { slug: "tv-wall-fireplace", topic: "living", date: "2026-08-21", read: 4, img: "tv-fireplace/2.jpg",
          title: "Making the TV wall the cosiest spot in the house",
          excerpt: "An electric fireplace unit turns the TV wall into a warm focal point. Here's how to style around it." },
        { slug: "colour-palette-mocha", topic: "styling", date: "2026-08-12", read: 3, img: "sofa-set/mocha/1.jpg",
          title: "Mocha, taupe and cream: a palette that never dates",
          excerpt: "Three easy colour combinations built on warm browns, and the cushions and throws that finish them." },
        { slug: "carpet-cleaning", topic: "care", date: "2026-08-03", read: 5, img: "carpet/red/3.jpg",
          title: "Keeping an embroidered carpet looking its best",
          excerpt: "Vacuuming direction, rotating the carpet and what to do about everyday marks." },
        { slug: "queen-bed-styling", topic: "bedroom", date: "2026-07-25", read: 4, img: "queen-bed-yellow/2.jpg",
          title: "Dressing a queen bed like a boutique hotel",
          excerpt: "Layer pillows, a throw and a bench at the foot of the bed for a finished, hotel-style look." },
        { slug: "small-living-room", topic: "living", date: "2026-07-16", read: 6, img: "sofa-set/grey/3.jpg",
          title: "Big comfort in a smaller living room",
          excerpt: "How to plan around a sofa set when space is tight: walkways, proportions and light colours." },
        { slug: "sage-carpet", topic: "carpets", date: "2026-07-07", read: 3, img: "carpet/sage/2.jpg",
          title: "Why a sage carpet works in almost any room",
          excerpt: "Soft green sits happily with wood, cream and gold — a quiet way to bring nature indoors." },
        { slug: "first-home-checklist", topic: "styling", date: "2026-06-28", read: 7, img: "queen-bed-brown/1.jpg",
          title: "Furnishing your first home: a room-by-room checklist",
          excerpt: "What to buy first, what can wait, and how to make a new place feel like home quickly." },
        { slug: "rotate-cushions", topic: "care", date: "2026-06-19", read: 2, img: "single-bed/grey/1.jpg",
          title: "The two-minute habit that doubles a sofa's life",
          excerpt: "Flip and rotate your cushions every week. It sounds small — it makes a big difference." },
        { slug: "mixing-textures", topic: "styling", date: "2026-06-10", read: 4, img: "sofa-set/taupe/1.jpg",
          title: "Mixing textures: velvet, boucle and brass in one room",
          excerpt: "How to combine soft and shiny materials so a room feels rich and layered, not busy." },
    ];
    const PER_PAGE = 6;

    const $ = (id) => document.getElementById(id);
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const fmt = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
    const link = (p) => `#${p.slug}`; // TODO: article page

    /* ---------- featured: the newest post ---------- */
    const [featured, ...rest] = POSTS;
    $("blFeatured").innerHTML = `
        <a class="bl-feat" href="${link(featured)}">
            <span class="bl-feat-media"><img src="${IMG + featured.img}" alt=""></span>
            <span class="bl-feat-body">
                <span class="bl-feat-tag"><i class="fa-solid fa-star" aria-hidden="true"></i> Editor's pick</span>
                <span class="bl-meta"><b>${TOPICS[featured.topic].label}</b><span>${fmt(featured.date)}</span><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${featured.read} min read</span></span>
                <strong>${esc(featured.title)}</strong>
                <span class="bl-feat-text">${esc(featured.excerpt)}</span>
                <span class="bl-read">Read the article <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
            </span>
        </a>`;

    /* ---------- state <-> URL ---------- */
    const params = new URLSearchParams(location.search);
    const state = {
        topic: TOPICS[params.get("topic")] ? params.get("topic") : "all",
        page: Math.max(1, parseInt(params.get("page"), 10) || 1),
    };
    function syncUrl() {
        const q = new URLSearchParams();
        if (state.topic !== "all") q.set("topic", state.topic);
        if (state.page > 1) q.set("page", state.page);
        history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : ""));
    }

    /* ---------- topics ---------- */
    const count = (t) => rest.filter((p) => t === "all" || p.topic === t).length;
    $("blTopics").innerHTML =
        `<button type="button" role="tab" data-topic="all"><i class="fa-solid fa-border-all" aria-hidden="true"></i>All<small>${count("all")}</small></button>` +
        Object.entries(TOPICS).map(([k, t]) =>
            `<button type="button" role="tab" data-topic="${k}"><i class="fa-solid ${t.icon}" aria-hidden="true"></i>${t.label}<small>${count(k)}</small></button>`).join("");
    $("blTopics").addEventListener("click", (e) => {
        const b = e.target.closest("[data-topic]");
        if (!b || b.dataset.topic === state.topic) return;
        state.topic = b.dataset.topic;
        state.page = 1;
        render(true);
    });

    /* ---------- cards ---------- */
    function card(p, n) {
        const t = TOPICS[p.topic];
        return `
        <article class="bl-card${n === 0 ? " bl-card-wide" : ""}" style="--d:${n * 60}ms">
            <a href="${link(p)}" class="bl-card-media"><img src="${IMG + p.img}" alt="" loading="lazy">
                <span class="bl-card-topic"><i class="fa-solid ${t.icon}" aria-hidden="true"></i> ${t.label}</span></a>
            <div class="bl-card-body">
                <span class="bl-meta"><span>${fmt(p.date)}</span><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${p.read} min</span></span>
                <h2><a href="${link(p)}">${esc(p.title)}</a></h2>
                <p>${esc(p.excerpt)}</p>
                <a href="${link(p)}" class="bl-more" aria-label="Read: ${esc(p.title)}">Read more <span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></a>
            </div>
        </article>`;
    }

    /* ---------- pagination ----------
       numbered pills with a sliding olive indicator, ellipses for long runs,
       prev/next buttons and a "page x of y" progress line */
    function pageList(cur, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const out = [1];
        const from = Math.max(2, cur - 1), to = Math.min(total - 1, cur + 1);
        if (from > 2) out.push("…");
        for (let i = from; i <= to; i++) out.push(i);
        if (to < total - 1) out.push("…");
        out.push(total);
        return out;
    }
    function renderPager(total) {
        const pager = $("blPager");
        if (total <= 1) { pager.innerHTML = ""; pager.hidden = true; return; }
        pager.hidden = false;
        const cur = state.page;
        pager.innerHTML = `
            <button type="button" class="bl-step bl-prev" data-page="${cur - 1}" ${cur === 1 ? "disabled" : ""} aria-label="Previous page">
                <i class="fa-solid fa-arrow-left" aria-hidden="true"></i><span>Prev</span></button>
            <div class="bl-pages">
                <span class="bl-indicator" aria-hidden="true"></span>
                ${pageList(cur, total).map((n) => n === "…"
                    ? `<span class="bl-gap" aria-hidden="true">…</span>`
                    : `<button type="button" class="bl-num" data-page="${n}" ${n === cur ? 'aria-current="page"' : ""} aria-label="Page ${n}">${String(n).padStart(2, "0")}</button>`).join("")}
            </div>
            <button type="button" class="bl-step bl-next" data-page="${cur + 1}" ${cur === total ? "disabled" : ""} aria-label="Next page">
                <span>Next</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
            <div class="bl-progress" aria-hidden="true">
                <span>Page <b>${cur}</b> of ${total}</span>
                <span class="bl-progress-bar"><span style="width:${(cur / total) * 100}%"></span></span>
            </div>`;
        moveIndicator(false);
    }
    /* the indicator slides from the previous page number to the new one */
    let lastLeft = null;
    function moveIndicator(animate) {
        const wrap = document.querySelector(".bl-pages");
        const active = wrap && wrap.querySelector('[aria-current="page"]');
        if (!active) return;
        const ind = wrap.querySelector(".bl-indicator");
        const to = active.offsetLeft;
        if (animate && lastLeft !== null) {
            ind.style.transition = "none";
            ind.style.transform = `translateX(${lastLeft}px)`;
            ind.style.width = active.offsetWidth + "px";
            void ind.offsetWidth;
            ind.style.transition = "";
        }
        ind.style.transform = `translateX(${to}px)`;
        ind.style.width = active.offsetWidth + "px";
        lastLeft = to;
    }
    $("blPager").addEventListener("click", (e) => {
        const b = e.target.closest("[data-page]");
        if (!b || b.disabled) return;
        state.page = Number(b.dataset.page);
        render(true, true);
    });
    addEventListener("resize", () => moveIndicator(false));

    /* ---------- render ---------- */
    function render(fromUser, paging) {
        const list = rest.filter((p) => state.topic === "all" || p.topic === state.topic);
        const total = Math.max(1, Math.ceil(list.length / PER_PAGE));
        state.page = Math.min(state.page, total);
        const slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);

        $("blTopics").querySelectorAll("[data-topic]").forEach((b) => b.setAttribute("aria-selected", b.dataset.topic === state.topic));
        $("blTotal").innerHTML = `<b>${list.length}</b> ${list.length === 1 ? "article" : "articles"}`;
        $("blGrid").innerHTML = slice.map(card).join("");

        const keep = paging ? lastLeft : null;
        renderPager(total);
        if (paging && keep !== null) { lastLeft = keep; moveIndicator(true); }
        syncUrl();
        if (fromUser) {
            const top = document.querySelector(".bl-bar").getBoundingClientRect().top + scrollY - 110;
            if (scrollY > top) scrollTo({ top, behavior: "smooth" });
        }
    }
    render(false);
})();
