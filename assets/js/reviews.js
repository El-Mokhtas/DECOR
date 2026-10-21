/* ---------- Customer reviews ----------
   Put REAL reviews in REVIEWS (copied from Google or sent by customers).
   While REVIEWS is empty the section stays hidden from visitors.

   To preview the design with sample content, open the page with ?preview=reviews
   e.g. https://el-mokhtas.github.io/DECOR/?preview=reviews
   The samples below are never shown to normal visitors. */
(function () {
    const REVIEWS = [
        // { name: "First L.", location: "Hamilton, ON", rating: 5, date: "March 2026",
        //   text: "…", product: "Turkish Sofa Set" },
    ];

    /* overall rating from your Google Business profile; leave null to hide */
    const SUMMARY = null; // { rating: 4.9, count: 120, url: "https://g.page/..." }

    /* product name -> photo + link shown on each review card */
    const P = "assets/imgs/products/";
    const PRODUCT_INFO = {
        "Turkish Sofa Set": { img: P + "sofa-set/taupe/1.jpg", url: "shop.html?p=D0-0002" },
        "Turkish Embroidered Carpet": { img: P + "carpet/red/2.jpg", url: "shop.html?p=DB-0001" },
        "White Queen Bed": { img: P + "queen-bed-white/2.jpg", url: "shop.html?p=BR-0002" },
        "Yellow Queen Bed": { img: P + "queen-bed-yellow/1.jpg", url: "shop.html?p=BR-0003" },
        "Brown Queen Bed": { img: P + "queen-bed-brown/1.jpg", url: "shop.html?p=BR-0001" },
        "Upholstered Single Bed": { img: P + "single-bed/cream/2.jpg", url: "shop.html?p=BR-0006" },
        "Fireplace & TV Unit": { img: P + "tv-fireplace/1.jpg", url: "shop.html?p=D0-0004" },
    };

    /* PREVIEW ONLY: placeholder content so the layout can be judged */
    const SAMPLE_REVIEWS = [
        { name: "Sample A.", location: "Hamilton, ON", rating: 5, date: "Sample", product: "Turkish Sofa Set",
          text: "The sofa set looks even better in our living room than in the photos. Really comfortable, and the gold details are beautiful." },
        { name: "Sample B.", location: "Burlington, ON", rating: 5, date: "Sample", product: "White Queen Bed",
          text: "Delivered and assembled on the day we agreed. The storage under the bed is so useful in a smaller bedroom." },
        { name: "Sample C.", location: "Stoney Creek, ON", rating: 5, date: "Sample", product: "Turkish Embroidered Carpet",
          text: "Rich colours and very soft underfoot. It pulled the whole dining room together." },
        { name: "Sample D.", location: "Ancaster, ON", rating: 5, date: "Sample", product: "Upholstered Single Bed",
          text: "Bought this for our daughter's room. Solid build, soft headboard, and she loves the colour." },
        { name: "Sample E.", location: "Dundas, ON", rating: 4, date: "Sample", product: "Fireplace & TV Unit",
          text: "Looks very elegant and the fireplace effect is lovely in the evenings. Easy to set up." },
    ];
    const SAMPLE_SUMMARY = { rating: 4.9, count: 0, url: "#" };

    const section = document.getElementById("reviews");
    if (!section) return;

    const preview = new URLSearchParams(location.search).get("preview") === "reviews";
    const list = REVIEWS.length ? REVIEWS : preview ? SAMPLE_REVIEWS : [];
    const summary = REVIEWS.length ? SUMMARY : preview ? SAMPLE_SUMMARY : null;
    if (!list.length) return; // nothing real to show yet: keep the section hidden

    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 3 1.1-6.1-4.5-4.3 6.1-.8z" /></svg>';
    const stars = (n) => `<span class="rv-stars" role="img" aria-label="${n} out of 5 stars">${[1, 2, 3, 4, 5]
        .map((i) => `<i class="${i <= n ? "on" : ""}">${star}</i>`).join("")}</span>`;
    const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>';

    /* rating summary */
    if (summary) {
        const box = section.querySelector(".rv-summary");
        box.innerHTML = `
            <span class="rv-score">${summary.rating.toFixed(1)}</span>
            <span class="rv-summary-text">${stars(Math.round(summary.rating))}
                <small>${summary.count ? `${summary.count} reviews on Google` : "Average rating on Google"}</small>
                ${summary.url ? `<a href="${esc(summary.url)}" class="rv-google" target="_blank" rel="noopener">Read all reviews</a>` : ""}</span>`;
        box.hidden = false;
    }

    /* cards */
    const track = section.querySelector(".rv-track");
    track.innerHTML = list.map((r) => {
        const info = PRODUCT_INFO[r.product] || {};
        return `
        <figure class="rv-card">
            ${info.img ? `<img class="rv-bg" src="${info.img}" alt="" loading="lazy">` : ""}
            ${r.product ? `<a class="rv-product" href="${info.url || "shop.html"}">${esc(r.product)}${arrow}</a>` : ""}
            <div class="rv-body">
                ${stars(r.rating)}
                <blockquote>“${esc(r.text)}”</blockquote>
                <figcaption><b>${esc(r.name)}</b><span>${esc(r.location)}${r.date ? " · " + esc(r.date) : ""}</span></figcaption>
            </div>
        </figure>`;
    }).join("");

    if (preview && !REVIEWS.length) section.classList.add("is-preview");
    section.hidden = false;

    /* arrows + progress bar */
    const prev = section.querySelector(".rv-prev");
    const next = section.querySelector(".rv-next");
    const bar = section.querySelector(".rv-progress span");
    const step = () => (track.querySelector(".rv-card")?.offsetWidth || 320) + 20;
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    const update = () => {
        const max = track.scrollWidth - track.clientWidth;
        const visible = track.clientWidth / track.scrollWidth;
        bar.style.width = Math.max(visible, 0.08) * 100 + "%";
        bar.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * ((1 - visible) / visible) * 100 : 0}%)`;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max - 2;
    };
    track.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();

    /* drag to scroll with a mouse */
    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse") return;
        down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
        track.classList.add("is-dragging");
    });
    addEventListener("pointermove", (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        track.scrollLeft = startLeft - dx;
    });
    addEventListener("pointerup", () => {
        if (!down) return;
        down = false;
        track.classList.remove("is-dragging");
    });
    track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
})();
