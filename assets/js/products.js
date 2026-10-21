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

    const grid = document.getElementById("fpGrid");
    if (!grid) return;

    const money = (n) => "$" + n.toLocaleString("en-CA");
    const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>';
    const bag = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>';

    const media = (o, name) =>
        `<img class="fp-img" src="${o.img}" alt="${name}" loading="lazy">` +
        (o.alt ? `<img class="fp-img fp-img-alt" src="${o.alt}" alt="" loading="lazy">` : "");

    grid.innerHTML = PRODUCTS.map((p, i) => {
        const first = p.options[0];
        const swatches = p.options.length > 1
            ? `<div class="fp-swatches" role="radiogroup" aria-label="Colour">${p.options.map((o, k) =>
                `<button type="button" class="fp-swatch" role="radio" aria-checked="${k === 0}" aria-label="${o.name}" title="${o.name}" data-k="${k}" style="--c:${o.color}"></button>`).join("")}</div>`
            : "";
        return `
        <article class="fp-card${p.wide ? " fp-wide" : ""} reveal" data-i="${i}">
            <div class="fp-media">
                <a href="shop.html?p=${p.code}" class="fp-link" aria-label="${p.name}">${media(first, p.name)}</a>
                <span class="fp-tag">${p.cat}</span>
                <button type="button" class="fp-add">${bag}<span>Add to cart</span></button>
            </div>
            <div class="fp-info">
                <div class="fp-row">
                    <h3 class="fp-name"><a href="shop.html?p=${p.code}">${p.name}</a></h3>
                    <span class="fp-price">${p.from ? "<small>From</small>" : ""}${money(p.price)}</span>
                </div>
                <div class="fp-row fp-row-sub">
                    <span class="fp-meta">${p.meta}</span>${swatches}
                </div>
            </div>
        </article>`;
    }).join("");

    /* colour swatches swap the photos */
    grid.addEventListener("click", (e) => {
        const sw = e.target.closest(".fp-swatch");
        if (sw) {
            const card = sw.closest(".fp-card");
            const p = PRODUCTS[card.dataset.i];
            const o = p.options[sw.dataset.k];
            card.querySelectorAll(".fp-swatch").forEach((b) => b.setAttribute("aria-checked", b === sw));
            card.querySelector(".fp-link").innerHTML = media(o, `${p.name} — ${o.name}`);
            return;
        }

        /* add to cart */
        const add = e.target.closest(".fp-add");
        if (!add) return;
        const card = add.closest(".fp-card");
        const p = PRODUCTS[card.dataset.i];
        const checked = card.querySelector('.fp-swatch[aria-checked="true"]');
        const option = checked ? p.options[checked.dataset.k].name : "";
        addToCart([{ code: p.code, name: p.name, option, price: p.price }], add);
    });
})();
