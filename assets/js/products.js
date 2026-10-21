/* ---------- Featured products: data + rendering ----------
   Prices are CAD, from the Home Centre Green inventory list.
   Each option is a colour: `img` is the main photo, `alt` shows on hover. */
(function () {
    const P = "assets/imgs/products/";
    const PRODUCTS = [
        {
            code: "D0-0002", name: "Turkish Sofa Set", cat: "Living", price: 4000, wide: true,
            meta: "220 × 90 × 80 cm",
            options: [
                { name: "Grey", color: "#C9C6BE", img: P + "sofa-set/grey/1.jpg", alt: P + "sofa-set/grey/5.jpg" },
                { name: "Rust", color: "#B5653A", img: P + "sofa-set/rust/1.jpg", alt: P + "sofa-set/rust/2.jpg" },
                { name: "Taupe", color: "#8E8178", img: P + "sofa-set/taupe/1.jpg", alt: P + "sofa-set/taupe/2.jpg" },
                { name: "Mocha", color: "#7A6458", img: P + "sofa-set/mocha/1.jpg", alt: P + "sofa-set/mocha/3.jpg" },
            ],
        },
        {
            code: "DB-0001", name: "Turkish Embroidered Carpet", cat: "Carpets", price: 100, from: true,
            meta: "3 sizes, up to 500 × 400 cm",
            options: [
                { name: "Navy", color: "#1F2A44", img: P + "carpet/navy/1.jpg", alt: P + "carpet/navy/2.jpg" },
                { name: "Red", color: "#8E1F24", img: P + "carpet/red/1.jpg", alt: P + "carpet/red/2.jpg" },
                { name: "Sage", color: "#7F8B7A", img: P + "carpet/sage/1.jpg", alt: P + "carpet/sage/2.jpg" },
            ],
        },
        {
            code: "BR-0002", name: "White Queen Bed", cat: "Bedroom", price: 2500,
            meta: "Queen size, with storage",
            options: [{ img: P + "queen-bed-white/1.jpg", alt: P + "queen-bed-white/2.jpg" }],
        },
        {
            code: "BR-0003", name: "Yellow Queen Bed", cat: "Bedroom", price: 3000,
            meta: "Queen size, with storage",
            options: [{ img: P + "queen-bed-yellow/1.jpg", alt: P + "queen-bed-yellow/2.jpg" }],
        },
        {
            code: "BR-0001", name: "Brown Queen Bed", cat: "Bedroom", price: 3000,
            meta: "Queen size, with storage",
            options: [{ img: P + "queen-bed-brown/1.jpg" }],
        },
        {
            code: "BR-0006", name: "Upholstered Single Bed", cat: "Bedroom", price: 700, from: true,
            meta: "90 or 120 cm wide, with storage",
            options: [
                { name: "Grey", color: "#A9A7A2", img: P + "single-bed/grey/1.jpg", alt: P + "single-bed/grey/3.jpg" },
                { name: "Cream", color: "#EDE3D3", img: P + "single-bed/cream/2.jpg", alt: P + "single-bed/cream/1.jpg" },
                { name: "Pink", color: "#D4878F", img: P + "single-bed/pink/1.jpg" },
            ],
        },
        {
            code: "D0-0004", name: "Fireplace & TV Unit", cat: "Living", price: 500,
            meta: "180 × 40 × 50 cm",
            options: [{ img: P + "tv-fireplace/1.jpg", alt: P + "tv-fireplace/2.jpg" }],
        },
    ];

    /* shared demo cart in localStorage + header count; `btn` gets an "Added" state */
    function addToCart(items, btn) {
        let cart = [];
        try { cart = JSON.parse(localStorage.getItem("ssdesign_cart")) || []; } catch (err) { }
        items.forEach((item) => {
            const line = cart.find((it) => it.code === item.code && it.option === item.option);
            if (line) line.qty = (line.qty || 1) + 1;
            else cart.push(Object.assign({ qty: 1 }, item));
        });
        try { localStorage.setItem("ssdesign_cart", JSON.stringify(cart)); } catch (err) { }

        const count = document.getElementById("cartCount");
        if (count) {
            count.textContent = cart.reduce((s, it) => s + (it.qty || 1), 0);
            count.classList.remove("bump");
            void count.offsetWidth;
            count.classList.add("bump");
        }
        if (!btn) return;
        const label = btn.querySelector("span") || btn;
        if (!btn.dataset.label) btn.dataset.label = label.textContent;
        btn.classList.add("done");
        label.textContent = "Added";
        clearTimeout(btn._t);
        btn._t = setTimeout(() => {
            btn.classList.remove("done");
            label.textContent = btn.dataset.label;
        }, 1600);
    }

    /* any button with data-add='[{code,name,option,price}, ...]' adds those items */
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-add]");
        if (btn) addToCart(JSON.parse(btn.dataset.add), btn);
    });

    window.HCG_PRODUCTS = PRODUCTS; // shared with the header search

    const section = document.getElementById("featured");
    if (!section) return;
    const track = section.querySelector(".pc-track");
    const money = (n) => "$" + n.toLocaleString("en-CA");
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* wishlist kept in this browser only (demo) */
    let wish = [];
    try { wish = JSON.parse(localStorage.getItem("hcg_wishlist")) || []; } catch (err) { }
    const saveWish = () => { try { localStorage.setItem("hcg_wishlist", JSON.stringify(wish)); } catch (err) { } };

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
        const saved = wish.includes(p.code);
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
            const on = !wish.includes(p.code);
            wish = on ? wish.concat(p.code) : wish.filter((c) => c !== p.code);
            saveWish();
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
