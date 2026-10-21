/* ---------- Article page: reading progress, table of contents, sharing ----------
   All article text is in the HTML so search engines and AI tools can read it
   without running JavaScript; this file only adds interaction. */
(function () {
    const body = document.querySelector(".ar-body");
    if (!body) return;
    const bar = document.getElementById("arProgress");
    const pct = document.getElementById("arTocPct");
    const links = [...document.querySelectorAll("#arToc a[href^='#']")];
    const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);

    /* reading progress (top bar + % in the table of contents) */
    function progress() {
        const r = body.getBoundingClientRect();
        const total = r.height - innerHeight * 0.6;
        const done = Math.min(1, Math.max(0, -r.top / Math.max(total, 1)));
        bar.style.transform = `scaleX(${done})`;
        pct.textContent = Math.round(done * 100) + "%";
    }

    /* highlight the section being read */
    function spy() {
        const line = 140;
        let current = targets[0];
        targets.forEach((t) => { if (t.getBoundingClientRect().top - line <= 0) current = t; });
        links.forEach((a) => {
            const on = a.hash === "#" + current.id;
            a.classList.toggle("is-active", on);
            if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
    }
    let ticking = false;
    addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { progress(); spy(); ticking = false; });
    }, { passive: true });
    progress();
    spy();

    /* table of contents: smooth scroll below the fixed header, close on mobile */
    const toc = document.querySelector("#arToc details");
    const mobile = matchMedia("(max-width: 1024px)");
    if (mobile.matches) toc.open = false;
    links.forEach((a) => a.addEventListener("click", (e) => {
        const t = document.getElementById(a.hash.slice(1));
        if (!t) return;
        e.preventDefault();
        scrollTo({ top: t.getBoundingClientRect().top + scrollY - 120, behavior: "smooth" });
        history.replaceState(null, "", a.hash);
        if (mobile.matches) toc.open = false;
    }));

    /* share buttons */
    const url = location.href.split("#")[0];
    const title = document.querySelector("h1").textContent.trim();
    const img = new URL(document.querySelector(".ar-hero img").getAttribute("src"), location.href).href;
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(img)}&description=${encodeURIComponent(title)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    };
    document.querySelectorAll("[data-share]").forEach((el) => {
        const kind = el.dataset.share;
        if (shareUrls[kind]) el.href = shareUrls[kind];
    });
    const toast = document.getElementById("arToast");
    document.querySelectorAll('[data-share="copy"]').forEach((b) => b.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.textContent = "Link copied";
        } catch (err) {
            toast.textContent = "Couldn't copy the link";
        }
        toast.classList.add("is-show");
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove("is-show"), 2200);
    }));
})();
