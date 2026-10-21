/* ---------- Customer reviews ----------
   Put REAL reviews in REVIEWS (copied from Google or sent by customers).
   While REVIEWS is empty the section stays hidden from visitors.

   To preview the design with sample text, open the page with ?preview=reviews
   e.g. https://el-mokhtas.github.io/DECOR/?preview=reviews
   The samples below are never shown to normal visitors. */
(function () {
    const REVIEWS = [
        // { name: "First L.", location: "Hamilton, ON", rating: 5, text: "…", product: "Turkish Sofa Set", source: "Google" },
    ];

    /* overall rating, e.g. from your Google Business profile; leave null to hide */
    const SUMMARY = null; // { rating: 4.9, count: 120, url: "https://g.page/..." }

    const SAMPLE_REVIEWS = [
        { name: "Sample Customer", location: "Hamilton, ON", rating: 5, product: "Turkish Sofa Set", source: "Google",
          text: "Sample review text. Replace this with a real review from one of your customers before publishing." },
        { name: "Sample Customer", location: "Burlington, ON", rating: 5, product: "White Queen Bed", source: "Google",
          text: "Sample review text. A real review usually mentions the product, delivery and how it looks at home." },
        { name: "Sample Customer", location: "Stoney Creek, ON", rating: 5, product: "Turkish Embroidered Carpet", source: "Google",
          text: "Sample review text. Keep each review short — two to four sentences reads best on the page." },
        { name: "Sample Customer", location: "Ancaster, ON", rating: 4, product: "Upholstered Single Bed", source: "Google",
          text: "Sample review text. Use the customer's first name and last initial, with their permission." },
    ];
    const SAMPLE_SUMMARY = { rating: 4.9, count: 0, url: "#" };

    const section = document.getElementById("reviews");
    if (!section) return;

    const preview = new URLSearchParams(location.search).get("preview") === "reviews";
    const list = REVIEWS.length ? REVIEWS : preview ? SAMPLE_REVIEWS : [];
    const summary = REVIEWS.length ? SUMMARY : preview ? SAMPLE_SUMMARY : null;
    if (!list.length) return; // nothing real to show yet: keep the section hidden

    const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" /></svg>';
    const stars = (n) => `<span class="rv-stars" aria-label="${n} out of 5 stars">${[1, 2, 3, 4, 5].map((i) =>
        `<i class="${i <= n ? "on" : ""}">${star}</i>`).join("")}</span>`;
    const initials = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    if (summary) {
        const box = section.querySelector(".rv-summary");
        box.innerHTML = `
            <strong class="rv-score">${summary.rating.toFixed(1)}</strong>
            <span class="rv-summary-text">${stars(Math.round(summary.rating))}
                <small>${summary.count ? `Based on ${summary.count} reviews` : "Average rating"}</small></span>
            ${summary.url ? `<a href="${esc(summary.url)}" class="rv-google" target="_blank" rel="noopener">See all on Google</a>` : ""}`;
        box.hidden = false;
    }

    section.querySelector(".rv-track").innerHTML = list.map((r) => `
        <figure class="rv-card">
            ${stars(r.rating)}
            <blockquote>${esc(r.text)}</blockquote>
            <figcaption>
                <span class="rv-avatar" aria-hidden="true">${esc(initials(r.name))}</span>
                <span class="rv-who"><b>${esc(r.name)}</b><small>${esc(r.location)}${r.product ? " · " + esc(r.product) : ""}</small></span>
                ${r.source ? `<span class="rv-source">${esc(r.source)}</span>` : ""}
            </figcaption>
        </figure>`).join("");

    if (preview && !REVIEWS.length) section.classList.add("is-preview");
    section.hidden = false;

    /* arrows scroll the track one card at a time */
    const track = section.querySelector(".rv-track");
    const step = () => (track.querySelector(".rv-card")?.offsetWidth || 300) + 20;
    section.querySelector(".rv-prev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    section.querySelector(".rv-next").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
})();
