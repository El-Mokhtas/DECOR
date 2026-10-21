/* ---------- Header: announcement strip, Shop mega menu, live search ---------- */
(function () {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    const scrim = document.getElementById("hhScrim");

    /* announcement messages fade from one to the next */
    const msgs = header.querySelectorAll(".hh-msg");
    let m = 0;
    if (msgs.length > 1) {
        setInterval(() => {
            msgs[m].classList.remove("is-active");
            m = (m + 1) % msgs.length;
            msgs[m].classList.add("is-active");
        }, 4500);
    }

    /* panels (mega menu + search): only one open at a time */
    const mega = document.getElementById("hhMega");
    const megaBtn = header.querySelector(".hh-shop-btn");
    const search = document.getElementById("hhSearch");
    const searchBtn = document.getElementById("hhSearchBtn");
    const input = document.getElementById("hhSearchInput");

    function setPanel(panel, btn, open) {
        if (open) closeAll(panel);
        panel.hidden = !open;
        btn.setAttribute("aria-expanded", open);
        header.classList.toggle("has-panel", !mega.hidden || !search.hidden);
        scrim.hidden = mega.hidden && search.hidden;
    }
    function closeAll(except) {
        if (except !== mega) setPanel(mega, megaBtn, false);
        if (except !== search) setPanel(search, searchBtn, false);
    }

    /* mega menu: opens on hover (with a small delay) and on click */
    let t;
    const hoverable = matchMedia("(hover: hover) and (min-width: 1025px)");
    const openMega = () => { clearTimeout(t); t = setTimeout(() => setPanel(mega, megaBtn, true), 90); };
    const closeMega = () => { clearTimeout(t); t = setTimeout(() => setPanel(mega, megaBtn, false), 160); };
    megaBtn.addEventListener("click", () => setPanel(mega, megaBtn, mega.hidden));
    [megaBtn, mega].forEach((el) => {
        el.addEventListener("mouseenter", () => hoverable.matches && openMega());
        el.addEventListener("mouseleave", () => hoverable.matches && closeMega());
    });
    mega.addEventListener("click", (e) => { if (e.target.closest("a")) setPanel(mega, megaBtn, false); });

    /* search: live results from the product list */
    const results = search.querySelector(".hh-results");
    const products = window.HCG_PRODUCTS || [];
    const money = (n) => "$" + n.toLocaleString("en-CA");
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    function render() {
        const term = input.value.trim().toLowerCase();
        if (!term) { results.innerHTML = ""; return; }
        const hits = products.filter((p) =>
            [p.name, p.cat, p.meta, ...p.options.map((o) => o.name || "")].join(" ").toLowerCase().includes(term));
        results.innerHTML = hits.length
            ? hits.map((p) => `
                <a class="hh-result" role="listitem" href="#featured">
                    <img src="${p.options[0].img}" alt="" loading="lazy">
                    <span><strong>${esc(p.name)}</strong><small>${esc(p.cat)} · ${esc(p.meta)}</small></span>
                    <em>${p.from ? "From " : ""}${money(p.price)}</em>
                </a>`).join("")
            : `<p class="hh-noresult"><i class="fa-regular fa-face-meh" aria-hidden="true"></i> No products match “${esc(input.value.trim())}”.</p>`;
    }
    input.addEventListener("input", render);
    searchBtn.addEventListener("click", () => {
        setPanel(search, searchBtn, search.hidden);
        if (!search.hidden) setTimeout(() => input.focus(), 50);
    });
    search.querySelector(".hh-search-close").addEventListener("click", () => setPanel(search, searchBtn, false));
    search.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => {
        input.value = b.dataset.q;
        render();
        input.focus();
    }));
    results.addEventListener("click", (e) => { if (e.target.closest("a")) setPanel(search, searchBtn, false); });

    scrim.addEventListener("click", () => closeAll());
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
})();
