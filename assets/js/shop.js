/* ---------- Shop page: filters, sorting, grid and quick view ----------
   State lives in the URL (?cat=, ?colour=, ?min=, ?max=, ?sort=, ?p=) so filtered
   views can be shared and the homepage/search can link straight to a product. */
(function () {
    const PRODUCTS = window.HCG_PRODUCTS || [];
    const grid = document.getElementById("spGrid");
    if (!grid || !PRODUCTS.length) return;

    const $ = (id) => document.getElementById(id);
    const money = (n) => "$" + n.toLocaleString("en-CA");
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    const ROOMS = {
        living: { label: "Living", icon: "fa-couch", test: (p) => p.cat === "Living", img: "sofa-set/grey/1.jpg" },
        bedroom: { label: "Bedroom", icon: "fa-bed", test: (p) => p.cat === "Bedroom", img: "queen-bed-yellow/1.jpg" },
        carpets: { label: "Carpets", icon: "fa-rug", test: (p) => p.cat === "Carpets", img: "carpet/navy/2.jpg" },
        "tv-units": { label: "TV Units", icon: "fa-tv", test: (p) => /TV/.test(p.name), img: "tv-fireplace/1.jpg" },
    };
    const IMG = "assets/imgs/products/";

    /* every colour that exists, for the colour filter */
    const COLOURS = [];
    PRODUCTS.forEach((p) => p.options.forEach((o) => {
        if (!COLOURS.some((c) => c.name === o.name)) COLOURS.push({ name: o.name, color: o.color });
    }));
    const PRICE_MIN = Math.min(...PRODUCTS.map((p) => p.price));
    const PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price));

    /* ---------- state <-> URL ---------- */
    const params = new URLSearchParams(location.search);
    const state = {
        rooms: (params.get("cat") || "").split(",").filter((r) => ROOMS[r]),
        colours: (params.get("colour") || "").split(",").filter((c) => COLOURS.some((x) => x.name === c)),
        min: Number(params.get("min")) || PRICE_MIN,
        max: Number(params.get("max")) || PRICE_MAX,
        sort: params.get("sort") || "featured",
    };
    function syncUrl() {
        const q = new URLSearchParams();
        if (state.rooms.length) q.set("cat", state.rooms.join(","));
        if (state.colours.length) q.set("colour", state.colours.join(","));
        if (state.min > PRICE_MIN) q.set("min", state.min);
        if (state.max < PRICE_MAX) q.set("max", state.max);
        if (state.sort !== "featured") q.set("sort", state.sort);
        const qv = new URLSearchParams(location.search).get("p");
        if (qv) q.set("p", qv);
        history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : ""));
    }

    /* ---------- build filter controls ---------- */
    const count = (test) => PRODUCTS.filter(test).length;
    $("spRooms").innerHTML =
        `<button type="button" class="sp-room" data-room=""><span class="sp-room-img sp-room-all"><i class="fa-solid fa-border-all" aria-hidden="true"></i></span><span>All<small>${PRODUCTS.length} pieces</small></span></button>` +
        Object.entries(ROOMS).map(([key, r]) =>
            `<button type="button" class="sp-room" data-room="${key}"><span class="sp-room-img"><img src="${IMG + r.img}" alt="" loading="lazy"></span><span>${r.label}<small>${count(r.test)} ${count(r.test) === 1 ? "piece" : "pieces"}</small></span></button>`).join("");

    $("spRoomChecks").innerHTML = Object.entries(ROOMS).map(([key, r]) => `
        <label class="sp-check"><input type="checkbox" value="${key}"><span class="sp-box" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
            <i class="fa-solid ${r.icon} sp-check-icon" aria-hidden="true"></i>${r.label}<small>${count(r.test)}</small></label>`).join("");

    $("spColours").innerHTML = COLOURS.map((c) =>
        `<button type="button" class="sp-colour" data-colour="${c.name}" aria-pressed="false" title="${c.name}"><span style="--c:${c.color}"></span>${c.name}</button>`).join("");

    /* dual price slider */
    const minIn = $("spMin"), maxIn = $("spMax");
    [minIn, maxIn].forEach((el) => { el.min = PRICE_MIN; el.max = PRICE_MAX; el.step = 50; });
    minIn.value = state.min; maxIn.value = state.max;
    function paintRange() {
        const lo = ((state.min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
        const hi = ((state.max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
        $("spRange").style.setProperty("--lo", lo + "%");
        $("spRange").style.setProperty("--hi", hi + "%");
        $("spMinVal").textContent = money(state.min);
        $("spMaxVal").textContent = money(state.max);
    }
    minIn.addEventListener("input", () => { state.min = Math.min(Number(minIn.value), state.max - 50); minIn.value = state.min; render(); });
    maxIn.addEventListener("input", () => { state.max = Math.max(Number(maxIn.value), state.min + 50); maxIn.value = state.max; render(); });

    /* ---------- filtering + sorting ---------- */
    function matches(p) {
        if (state.rooms.length && !state.rooms.some((r) => ROOMS[r].test(p))) return false;
        if (state.colours.length && !p.options.some((o) => state.colours.includes(o.name))) return false;
        return p.price >= state.min && p.price <= state.max;
    }
    function sorted(list) {
        const l = list.slice();
        if (state.sort === "price-asc") l.sort((a, b) => a.price - b.price);
        if (state.sort === "price-desc") l.sort((a, b) => b.price - a.price);
        if (state.sort === "name") l.sort((a, b) => a.name.localeCompare(b.name));
        return l;
    }
    /* when filtering by colour, show that colour's photo first */
    const pickOption = (p) => Math.max(0, p.options.findIndex((o) => state.colours.includes(o.name)));

    /* ---------- cards ---------- */
    const photos = (o, name) =>
        `<img class="pc-img" src="${o.photos[0]}" alt="${esc(name)}" loading="lazy">` +
        (o.photos[1] ? `<img class="pc-img pc-img-alt" src="${o.photos[1]}" alt="" loading="lazy">` : "");

    function card(p) {
        const i = PRODUCTS.indexOf(p);
        const k = pickOption(p);
        const o = p.options[k];
        const saved = window.hcgWish.has(p.code);
        const swatches = p.options.length > 1
            ? `<div class="pc-swatches" role="radiogroup" aria-label="Colour">${p.options.map((op, n) =>
                `<button type="button" class="pc-swatch" role="radio" aria-checked="${n === k}" aria-label="${op.name}" title="${op.name}" data-k="${n}" style="--c:${op.color}"></button>`).join("")}
                <span class="pc-colour-name">${o.name}</span></div>`
            : `<div class="pc-swatches" aria-hidden="true"></div>`;
        return `
        <article class="pc-card" data-i="${i}">
            <div class="pc-media">
                <a href="product.html?p=${p.code}" class="pc-link" aria-label="${esc(p.name)}">${photos(o, p.name)}</a>
                <span class="pc-tag">${p.cat}</span>
                <button type="button" class="pc-wish${saved ? " is-on" : ""}" aria-pressed="${saved}" aria-label="Save ${esc(p.name)}">
                    <i class="fa-${saved ? "solid" : "regular"} fa-heart" aria-hidden="true"></i></button>
                <button type="button" class="sp-quick" data-qv="${i}"><i class="fa-regular fa-eye" aria-hidden="true"></i> Quick view</button>
            </div>
            <div class="pc-body">
                ${swatches}
                <h3 class="pc-name"><a href="product.html?p=${p.code}">${esc(p.name)}</a></h3>
                <p class="pc-meta">${esc(p.meta)}</p>
                <div class="pc-foot">
                    <span class="pc-price">${p.from ? "<small>From</small>" : ""}${money(p.price)}<small>CAD</small></span>
                    <button type="button" class="pc-add" aria-label="Add ${esc(p.name)} to cart">
                        <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i><i class="fa-solid fa-check" aria-hidden="true"></i></button>
                </div>
            </div>
        </article>`;
    }
    const promo = `
        <a href="index.html#showroom" class="sp-promo">
            <img src="${IMG}sofa-set/rust/1.jpg" alt="" loading="lazy">
            <span class="sp-promo-body">
                <span class="sp-promo-tag"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Hamilton showroom</span>
                <strong>See it, feel it, love it</strong>
                <span>Visit us to try the sofas and feel the fabrics in person.</span>
                <em>Get directions <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></em>
            </span>
        </a>`;

    /* ---------- render ---------- */
    function render() {
        const list = sorted(PRODUCTS.filter(matches));
        const cards = list.map(card);
        if (cards.length >= 3) cards.splice(3, 0, promo);
        grid.innerHTML = cards.join("");
        $("spEmpty").hidden = list.length > 0;
        grid.hidden = list.length === 0;
        $("spCount").innerHTML = `<b>${list.length}</b> ${list.length === 1 ? "piece" : "pieces"}`;
        $("spShow").textContent = `Show ${list.length} ${list.length === 1 ? "result" : "results"}`;

        /* page title + breadcrumb follow the room filter */
        const one = state.rooms.length === 1 ? ROOMS[state.rooms[0]] : null;
        $("spTitle").textContent = one ? one.label : "All products";
        $("spCrumbCat").hidden = !one;
        if (one) $("spCrumbCat").innerHTML = `<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>${one.label}`;
        document.title = `${one ? one.label : "Shop all"} | Home Centre Green Hamilton`;

        /* controls reflect state */
        document.querySelectorAll(".sp-room").forEach((b) => b.classList.toggle("is-active",
            b.dataset.room === "" ? !state.rooms.length : state.rooms.length === 1 && state.rooms[0] === b.dataset.room));
        document.querySelectorAll("#spRoomChecks input").forEach((c) => { c.checked = state.rooms.includes(c.value); });
        document.querySelectorAll(".sp-colour").forEach((b) => b.setAttribute("aria-pressed", state.colours.includes(b.dataset.colour)));
        $("spSort").value = state.sort;
        paintRange();

        /* active filter chips */
        const chips = [
            ...state.rooms.map((r) => ({ type: "room", value: r, label: ROOMS[r].label })),
            ...state.colours.map((c) => ({ type: "colour", value: c, label: c })),
            ...(state.min > PRICE_MIN || state.max < PRICE_MAX ? [{ type: "price", label: `${money(state.min)} – ${money(state.max)}` }] : []),
        ];
        $("spChips").innerHTML = chips.length
            ? chips.map((c) => `<button type="button" class="sp-chip" data-type="${c.type}" data-value="${c.value || ""}">${esc(c.label)} <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`).join("") +
              `<button type="button" class="sp-chip-clear" data-clear>Clear all</button>`
            : "";
        $("spFilterCount").hidden = !chips.length;
        $("spFilterCount").textContent = chips.length;
        syncUrl();
    }

    /* ---------- events ---------- */
    $("spRooms").addEventListener("click", (e) => {
        const b = e.target.closest(".sp-room");
        if (!b) return;
        state.rooms = b.dataset.room ? [b.dataset.room] : [];
        render();
    });
    $("spRoomChecks").addEventListener("change", () => {
        state.rooms = [...document.querySelectorAll("#spRoomChecks input:checked")].map((c) => c.value);
        render();
    });
    $("spColours").addEventListener("click", (e) => {
        const b = e.target.closest(".sp-colour");
        if (!b) return;
        const c = b.dataset.colour;
        state.colours = state.colours.includes(c) ? state.colours.filter((x) => x !== c) : state.colours.concat(c);
        render();
    });
    $("spSort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
    document.querySelectorAll(".sp-view button").forEach((b) => b.addEventListener("click", () => {
        document.querySelectorAll(".sp-view button").forEach((x) => x.setAttribute("aria-pressed", x === b));
        grid.dataset.view = b.dataset.view;
    }));
    function clearAll() {
        state.rooms = []; state.colours = []; state.min = PRICE_MIN; state.max = PRICE_MAX;
        minIn.value = PRICE_MIN; maxIn.value = PRICE_MAX;
        render();
    }
    document.addEventListener("click", (e) => {
        if (e.target.closest("[data-clear]")) { clearAll(); return; }
        const chip = e.target.closest(".sp-chip");
        if (!chip) return;
        const { type, value } = chip.dataset;
        if (type === "room") state.rooms = state.rooms.filter((r) => r !== value);
        if (type === "colour") state.colours = state.colours.filter((c) => c !== value);
        if (type === "price") { state.min = PRICE_MIN; state.max = PRICE_MAX; minIn.value = PRICE_MIN; maxIn.value = PRICE_MAX; }
        render();
    });

    /* mobile: filters open as a bottom sheet */
    const filters = $("spFilters"), scrim = $("spScrim");
    const sheet = (open) => {
        filters.classList.toggle("is-open", open);
        scrim.hidden = !open;
        document.body.classList.toggle("sp-lock", open);
    };
    $("spFilterBtn").addEventListener("click", () => sheet(true));
    filters.querySelector(".sp-filters-close").addEventListener("click", () => sheet(false));
    $("spShow").addEventListener("click", () => sheet(false));
    scrim.addEventListener("click", () => sheet(false));

    /* card actions: swatches, wishlist, add to cart */
    grid.addEventListener("click", (e) => {
        const cardEl = e.target.closest(".pc-card");
        if (!cardEl) return;
        const p = PRODUCTS[cardEl.dataset.i];

        const qv = e.target.closest("[data-qv]");
        if (qv) { e.preventDefault(); openQuick(Number(qv.dataset.qv)); return; }

        const sw = e.target.closest(".pc-swatch");
        if (sw) {
            const o = p.options[sw.dataset.k];
            cardEl.querySelectorAll(".pc-swatch").forEach((b) => b.setAttribute("aria-checked", b === sw));
            cardEl.querySelector(".pc-link").innerHTML = photos(o, `${p.name} — ${o.name}`);
            cardEl.querySelector(".pc-colour-name").textContent = o.name;
            return;
        }
        const heart = e.target.closest(".pc-wish");
        if (heart) {
            const on = window.hcgWish.toggle(p.code);
            heart.classList.toggle("is-on", on);
            heart.setAttribute("aria-pressed", on);
            heart.querySelector("i").className = `fa-${on ? "solid" : "regular"} fa-heart`;
            return;
        }
        const add = e.target.closest(".pc-add");
        if (add) {
            const checked = cardEl.querySelector('.pc-swatch[aria-checked="true"]');
            const option = (checked ? p.options[checked.dataset.k] : p.options[0]).name;
            window.hcgAddToCart([{ code: p.code, name: p.name, option, price: p.price }]);
            add.classList.add("done");
            clearTimeout(add._t);
            add._t = setTimeout(() => add.classList.remove("done"), 1600);
        }
    });

    /* ---------- quick view ---------- */
    const qv = $("qv");
    const q = { p: null, opt: 0, size: 0, photo: 0, qty: 1 };
    let lastFocus = null;

    function openQuick(i) {
        q.p = PRODUCTS[i];
        q.opt = pickOption(q.p);
        q.size = 0; q.photo = 0; q.qty = 1;
        lastFocus = document.activeElement;
        fillQuick();
        qv.hidden = false;
        document.body.classList.add("sp-lock");
        requestAnimationFrame(() => qv.classList.add("is-open"));
        qv.querySelector(".qv-close").focus();
        const u = new URLSearchParams(location.search);
        u.set("p", q.p.code);
        history.replaceState(null, "", location.pathname + "?" + u);
    }
    function closeQuick() {
        qv.classList.remove("is-open");
        document.body.classList.remove("sp-lock");
        setTimeout(() => { qv.hidden = true; }, 300);
        const u = new URLSearchParams(location.search);
        u.delete("p");
        history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
        if (lastFocus) lastFocus.focus();
    }
    function price() {
        return q.p.sizes ? q.p.sizes[q.size].price : q.p.price;
    }
    function showPhoto() {
        const list = q.p.options[q.opt].photos;
        q.photo = (q.photo + list.length) % list.length;
        $("qvImg").src = list[q.photo];
        $("qvImg").alt = `${q.p.name} — ${q.p.options[q.opt].name}, photo ${q.photo + 1}`;
        $("qvCounter").textContent = `${q.photo + 1} / ${list.length}`;
        qv.querySelectorAll(".qv-nav").forEach((b) => { b.hidden = list.length < 2; });
        $("qvThumbs").querySelectorAll("button").forEach((b, n) => b.setAttribute("aria-current", n === q.photo));
    }
    function fillQuick() {
        const p = q.p, o = p.options[q.opt];
        $("qvCat").textContent = p.cat;
        $("qvName").textContent = p.name;
        $("qvPrice").innerHTML = `${money(price())} <small>CAD</small>`;
        $("qvDesc").textContent = p.desc || "";
        $("qvMeta").innerHTML = `<i class="fa-solid fa-ruler-combined" aria-hidden="true"></i> ${esc(p.sizes ? p.sizes[q.size].label : p.meta)} · Code ${esc(p.sizes ? p.sizes[q.size].code : p.code)}`;
        $("qvColour").textContent = o.name;
        $("qvSwatches").innerHTML = p.options.map((op, n) =>
            `<button type="button" class="qv-swatch" role="radio" aria-checked="${n === q.opt}" aria-label="${op.name}" title="${op.name}" data-k="${n}" style="--c:${op.color}"></button>`).join("");
        $("qvSizeField").hidden = !p.sizes;
        $("qvSizes").innerHTML = (p.sizes || []).map((s, n) =>
            `<button type="button" class="qv-size" role="radio" aria-checked="${n === q.size}" data-s="${n}">${s.label}<small>${money(s.price)}</small></button>`).join("");
        $("qvThumbs").innerHTML = o.photos.map((src, n) =>
            `<button type="button" data-ph="${n}" aria-label="Photo ${n + 1}"><img src="${src}" alt=""></button>`).join("");
        $("qvThumbs").hidden = o.photos.length < 2;
        $("qvQty").textContent = q.qty;
        const saved = window.hcgWish.has(p.code);
        $("qvWish").classList.toggle("is-on", saved);
        $("qvWish").setAttribute("aria-pressed", saved);
        $("qvWish").querySelector("i").className = `fa-${saved ? "solid" : "regular"} fa-heart`;
        showPhoto();
    }

    qv.addEventListener("click", (e) => {
        if (e.target.closest("[data-qv-close]")) { closeQuick(); return; }
        if (e.target.closest(".qv-prev")) { q.photo--; showPhoto(); return; }
        if (e.target.closest(".qv-next")) { q.photo++; showPhoto(); return; }
        const th = e.target.closest("[data-ph]");
        if (th) { q.photo = Number(th.dataset.ph); showPhoto(); return; }
        const sw = e.target.closest(".qv-swatch");
        if (sw) { q.opt = Number(sw.dataset.k); q.photo = 0; fillQuick(); return; }
        const sz = e.target.closest(".qv-size");
        if (sz) { q.size = Number(sz.dataset.s); fillQuick(); return; }
        const step = e.target.closest("[data-qty]");
        if (step) { q.qty = Math.min(20, Math.max(1, q.qty + Number(step.dataset.qty))); $("qvQty").textContent = q.qty; return; }
        if (e.target.closest("#qvWish")) {
            const on = window.hcgWish.toggle(q.p.code);
            $("qvWish").classList.toggle("is-on", on);
            $("qvWish").setAttribute("aria-pressed", on);
            $("qvWish").querySelector("i").className = `fa-${on ? "solid" : "regular"} fa-heart`;
            render();
            return;
        }
        if (e.target.closest("#qvAdd")) {
            const p = q.p;
            window.hcgAddToCart([{
                code: p.sizes ? p.sizes[q.size].code : p.code,
                name: p.name + (p.sizes ? ` (${p.sizes[q.size].label})` : ""),
                option: p.options[q.opt].name, price: price(), qty: q.qty,
            }], $("qvAdd"));
        }
    });
    document.addEventListener("keydown", (e) => {
        if (qv.hidden) return;
        if (e.key === "Escape") closeQuick();
        if (e.key === "ArrowRight") { q.photo++; showPhoto(); }
        if (e.key === "ArrowLeft") { q.photo--; showPhoto(); }
        if (e.key === "Tab") { /* keep focus inside the dialog */
            const f = [...qv.querySelectorAll("button:not([hidden]), [href]")].filter((el) => el.offsetParent);
            if (!f.length) return;
            if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
            else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
    });
    /* swipe between photos on touch screens */
    let sx = null;
    $("qvImg").parentElement.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    $("qvImg").parentElement.addEventListener("touchend", (e) => {
        if (sx === null) return;
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) { q.photo += dx < 0 ? 1 : -1; showPhoto(); }
        sx = null;
    });

    render();
    const start = params.get("p");
    if (start) {
        const i = PRODUCTS.findIndex((p) => p.code === start);
        if (i >= 0) openQuick(i);
    }
})();
