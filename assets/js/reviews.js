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

    /* link for "Write a review" (your Google review link); null falls back to the contact section */
    const REVIEW_URL = null; // "https://g.page/r/.../review"

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
        { name: "Sample A.", location: "Hamilton, ON", rating: 5, product: "Turkish Sofa Set",
          text: "The sofa set looks even better in our living room than in the photos. Really comfortable, and the gold details are beautiful." },
        { name: "Sample B.", location: "Burlington, ON", rating: 5, product: "White Queen Bed",
          text: "Delivered and assembled on the day we agreed. The storage under the bed is so useful in a smaller bedroom." },
        { name: "Sample C.", location: "Stoney Creek, ON", rating: 5, product: "Turkish Embroidered Carpet",
          text: "Rich colours and very soft underfoot. It pulled the whole dining room together." },
        { name: "Sample D.", location: "Ancaster, ON", rating: 5, product: "Upholstered Single Bed",
          text: "Bought this for our daughter's room. Solid build, soft headboard, and she loves the colour." },
        { name: "Sample E.", location: "Dundas, ON", rating: 4, product: "Fireplace & TV Unit",
          text: "Looks very elegant and the fireplace effect is lovely in the evenings. Easy to set up." },
    ];

    const section = document.getElementById("reviews");
    if (!section) return;

    const preview = new URLSearchParams(location.search).get("preview") === "reviews";
    const list = REVIEWS.length ? REVIEWS : preview ? SAMPLE_REVIEWS : [];

    const stars = (n) => `<span class="rv-stars" role="img" aria-label="${n} out of 5 stars">${[1, 2, 3, 4, 5]
        .map((i) => `<i class="fa-${i <= n ? "solid" : "regular"} fa-star" aria-hidden="true"></i>`).join("")}</span>`;
    const initials = (name) => name.replace(/\./g, "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const ACCENTS = ["#4E4C33", "#A8844A", "#3C3024"]; // olive, gold, brown — cycles per card

    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const track = section.querySelector(".rv-track");

    /* no real reviews yet: show an invitation instead of cards */
    if (!list.length) {
        const url = REVIEW_URL || "#contact";
        track.outerHTML = `
        <div class="rv-empty">
            <figure class="rv-card" style="--accent:#4E4C33">
                <span class="rv-photo" aria-hidden="true"><img src="${P}sofa-set/grey/1.jpg" alt="" loading="lazy"></span>
                <div class="rv-panel rv-panel-empty">
                    <i class="fa-solid fa-quote-left rv-quote" aria-hidden="true"></i>
                    <p class="rv-empty-title">Bought from Home Centre Green?</p>
                    <p class="rv-empty-text">We'd love to hear how your new piece looks at home. Your review helps other families in Hamilton choose with confidence.</p>
                    <a class="rv-empty-btn" href="${esc(url)}"${REVIEW_URL ? ' target="_blank" rel="noopener"' : ""}><i class="fa-regular fa-pen-to-square" aria-hidden="true"></i> Write a review</a>
                </div>
            </figure>
        </div>`;
        section.querySelector(".rv-arrows").hidden = true;
        section.hidden = false;
        return;
    }

    /* cards: a slanted photo strip peeks out above each card */
    track.innerHTML = list.map((r, k) => {
        const info = PRODUCT_INFO[r.product] || {};
        return `
        <figure class="rv-card" style="--accent:${ACCENTS[k % ACCENTS.length]}">
            <a class="rv-photo" href="${info.url || "shop.html"}" tabindex="-1" aria-hidden="true">${info.img ? `<img src="${info.img}" alt="" loading="lazy">` : ""}</a>
            <div class="rv-panel">
                <div class="rv-panel-top">
                    <i class="fa-solid fa-quote-left rv-quote" aria-hidden="true"></i>
                    ${stars(r.rating)}
                </div>
                <blockquote>${esc(r.text)}</blockquote>
                <figcaption>
                    <span class="rv-avatar" aria-hidden="true">${esc(initials(r.name))}</span>
                    <span class="rv-who"><b>${esc(r.name)}</b><small>${esc(r.location)}${r.product ? ` · <a href="${info.url || "shop.html"}">${esc(r.product)}</a>` : ""}</small></span>
                    <span class="rv-source" title="Google review"><i class="fa-brands fa-google" aria-hidden="true"></i><span class="sr-only">Google review</span></span>
                </figcaption>
            </div>
        </figure>`;
    }).join("");

    if (preview && !REVIEWS.length) section.classList.add("is-preview");
    section.hidden = false;

    /* arrows */
    const prev = section.querySelector(".rv-prev");
    const next = section.querySelector(".rv-next");
    const step = () => (track.querySelector(".rv-card")?.offsetWidth || 320) + 28;
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    const update = () => {
        const max = track.scrollWidth - track.clientWidth;
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
