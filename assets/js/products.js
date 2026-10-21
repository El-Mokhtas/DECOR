/* ---------- Homepage collection slider (data in catalog.js) ---------- */
(function () {
    const PRODUCTS = window.HCG_PRODUCTS || [];
    const addToCart = window.hcgAddToCart;

    const section = document.getElementById("featured");
    if (!section) return;
    const track = section.querySelector(".pc-track");
    const money = (n) => "$" + n.toLocaleString("en-CA");
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    const photos = (o, name) =>
        `<img class="pc-img" src="${o.img}" alt="${esc(name)}" loading="lazy">` +
        (o.alt ? `<img class="pc-img pc-img-alt" src="${o.alt}" alt="" loading="lazy">` : "");

    /* first slide: an editorial card, then one card per product */
    const intro = `
        <article class="pc-intro" data-cat="all">
            <span class="pc-intro-tag"><i class="fa-solid fa-award" aria-hidden="true"></i> Made in Turkey</span>
            <h3>Pieces built to last, styled to stay</h3>
            <p>${PRODUCTS.length} pieces in stock now in Hamilton, ready for delivery and assembly.</p>
            <a href="shop.html" class="pc-intro-btn">Explore all <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
        </article>`;

    track.innerHTML = intro + PRODUCTS.map((p, i) => {
        const o = p.options[0];
        const saved = window.hcgWish.has(p.code);
        const swatches = p.options.length > 1
            ? `<div class="pc-swatches" role="radiogroup" aria-label="Colour">${p.options.map((op, k) =>
                `<button type="button" class="pc-swatch" role="radio" aria-checked="${k === 0}" aria-label="${op.name}" title="${op.name}" data-k="${k}" style="--c:${op.color}"></button>`).join("")}
                <span class="pc-colour-name">${p.options[0].name}</span></div>`
            : `<div class="pc-swatches" aria-hidden="true"></div>`;
        return `
        <article class="pc-card" data-i="${i}" data-cat="${p.cat.toLowerCase()}">
            <div class="pc-media">
                <a href="shop.html?p=${p.code}" class="pc-link" aria-label="${esc(p.name)}">${photos(o, p.name)}</a>
                <span class="pc-tag">${p.cat}</span>
                <button type="button" class="pc-wish${saved ? " is-on" : ""}" aria-pressed="${saved}" aria-label="Save ${esc(p.name)}">
                    <i class="fa-${saved ? "solid" : "regular"} fa-heart" aria-hidden="true"></i></button>
            </div>
            <div class="pc-body">
                ${swatches}
                <h3 class="pc-name"><a href="shop.html?p=${p.code}">${esc(p.name)}</a></h3>
                <p class="pc-meta">${esc(p.meta)}</p>
                <div class="pc-foot">
                    <span class="pc-price">${p.from ? "<small>From</small>" : ""}${money(p.price)}<small>CAD</small></span>
                    <button type="button" class="pc-add" aria-label="Add ${esc(p.name)} to cart">
                        <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i><i class="fa-solid fa-check" aria-hidden="true"></i></button>
                </div>
            </div>
        </article>`;
    }).join("");

    track.addEventListener("click", (e) => {
        const card = e.target.closest(".pc-card");
        if (!card) return;
        const p = PRODUCTS[card.dataset.i];

        /* colour swatch: swap photos and colour name */
        const sw = e.target.closest(".pc-swatch");
        if (sw) {
            const o = p.options[sw.dataset.k];
            card.querySelectorAll(".pc-swatch").forEach((b) => b.setAttribute("aria-checked", b === sw));
            card.querySelector(".pc-link").innerHTML = photos(o, `${p.name} — ${o.name}`);
            card.querySelector(".pc-colour-name").textContent = o.name;
            return;
        }

        /* wishlist heart */
        const heart = e.target.closest(".pc-wish");
        if (heart) {
            const on = window.hcgWish.toggle(p.code);
            heart.classList.toggle("is-on", on);
            heart.setAttribute("aria-pressed", on);
            heart.querySelector("i").className = `fa-${on ? "solid" : "regular"} fa-heart`;
            return;
        }

        /* add to cart */
        const add = e.target.closest(".pc-add");
        if (add) {
            const checked = card.querySelector('.pc-swatch[aria-checked="true"]');
            const option = checked ? p.options[checked.dataset.k].name : "";
            addToCart([{ code: p.code, name: p.name, option, price: p.price }]);
            add.classList.add("done");
            clearTimeout(add._t);
            add._t = setTimeout(() => add.classList.remove("done"), 1600);
        }
    });

    /* room tabs */
    const tabs = section.querySelectorAll(".pc-tab");
    tabs.forEach((tab) => tab.addEventListener("click", () => {
        tabs.forEach((t) => t.setAttribute("aria-selected", t === tab));
        const cat = tab.dataset.cat;
        track.querySelectorAll(".pc-card").forEach((c) => { c.hidden = cat !== "all" && c.dataset.cat !== cat; });
        track.scrollTo({ left: 0, behavior: "smooth" });
        update();
    }));

    /* arrows + progress */
    const prev = section.querySelector(".pc-prev");
    const next = section.querySelector(".pc-next");
    const bar = section.querySelector(".pc-progress span");
    const step = () => (track.querySelector(".pc-card:not([hidden])")?.offsetWidth || 300) + 24;
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    function update() {
        const max = track.scrollWidth - track.clientWidth;
        const visible = Math.min(1, track.clientWidth / track.scrollWidth);
        bar.style.width = visible * 100 + "%";
        bar.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * ((1 - visible) / visible) * 100 : 0}%)`;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max - 2;
    }
    track.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
})();
