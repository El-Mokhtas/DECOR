/* ---------- Product page (product.html?p=CODE) ----------
   Gallery with hover zoom and full-screen view, colour/size options,
   details tabs, related + recently viewed products and a sticky buy bar. */
(function () {
    const PRODUCTS = window.HCG_PRODUCTS || [];
    const $ = (id) => document.getElementById(id);
    const money = (n) => "$" + n.toLocaleString("en-CA");
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    const params = new URLSearchParams(location.search);
    const p = PRODUCTS.find((x) => x.code === params.get("p"));
    if (!p) {
        document.querySelectorAll(".pd-crumbs, .pd-top, .pd-band, .pd-details, .pd-more").forEach((el) => { el.hidden = true; });
        $("pdMissing").hidden = false;
        return;
    }

    /* the colour from the link (?colour=Rust) or the first one */
    const s = {
        opt: Math.max(0, p.options.findIndex((o) => o.name === params.get("colour"))),
        size: 0,
        photo: 0,
        qty: 1,
    };
    const opt = () => p.options[s.opt];
    const price = () => (p.sizes ? p.sizes[s.size].price : p.price);
    const code = () => (p.sizes ? p.sizes[s.size].code : p.code);

    /* ---------- static content ---------- */
    document.title = `${p.name} | Home Centre Green Hamilton`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = p.desc;
    const roomKey = p.cat === "Carpets" ? "carpets" : p.cat.toLowerCase();
    $("pdCrumbCat").textContent = p.cat;
    $("pdCrumbCat").href = `shop.html?cat=${roomKey}`;
    $("pdCrumbName").textContent = p.name;
    $("pdCat").textContent = p.cat;
    $("pdName").textContent = p.name;
    $("pdDesc").textContent = p.desc;
    $("pdBandTitle").textContent = `The ${p.name}, made for everyday living`;
    $("pdSizeField").hidden = !p.sizes;
    $("pdColourField").hidden = p.options.length < 2 && !p.options[0].name;

    /* description + dimensions tabs */
    $("pdPanel0").innerHTML = `<h3>About this piece</h3><p>${esc(p.desc)}</p>
        <ul class="pd-facts">
            <li><span>Room</span><b>${esc(p.cat)}</b></li>
            <li><span>Colours</span><b>${p.options.map((o) => esc(o.name)).join(", ")}</b></li>
            <li><span>Made in</span><b>Turkey</b></li>
            <li><span>Product code</span><b>${esc(p.code)}</b></li>
        </ul>`;
    function dimsPanel() {
        const d = p.dims;
        const sizes = p.sizes
            ? `<ul class="pd-facts">${p.sizes.map((z) => `<li><span>${esc(z.label)}</span><b>${money(z.price)} CAD</b></li>`).join("")}</ul>`
            : "";
        if (!d) return `<h3>Size</h3><p>${esc(p.meta)}</p>${sizes}`;
        /* simple drawing of the piece's footprint with width, depth and height */
        return `<h3>Dimensions</h3>
            <div class="pd-dims">
                <svg viewBox="0 0 360 220" role="img" aria-label="Width ${d.w} cm, depth ${d.d} cm, height ${d.h} cm">
                    <path class="pd-box" d="M70 80 L230 80 L290 40 L130 40 Z" />
                    <path class="pd-box pd-box-side" d="M230 80 L290 40 L290 120 L230 160 Z" />
                    <path class="pd-box pd-box-front" d="M70 80 L230 80 L230 160 L70 160 Z" />
                    <path class="pd-dim" d="M70 182 L230 182 M70 176 L70 188 M230 176 L230 188" />
                    <text x="150" y="204" text-anchor="middle">W ${d.w} cm</text>
                    <path class="pd-dim" d="M248 172 L308 132 M244 166 L252 178 M304 126 L312 138" />
                    <text x="302" y="170">D ${d.d} cm</text>
                    <path class="pd-dim" d="M48 80 L48 160 M42 80 L54 80 M42 160 L54 160" />
                    <text x="40" y="124" text-anchor="end">H ${d.h}</text>
                </svg>
                <ul class="pd-facts">
                    <li><span>Width</span><b>${d.w} cm</b></li>
                    <li><span>Depth</span><b>${d.d} cm</b></li>
                    <li><span>Height</span><b>${d.h} cm</b></li>
                </ul>
            </div>${sizes}`;
    }
    $("pdPanel1").innerHTML = dimsPanel();

    /* ---------- options + gallery ---------- */
    function renderOptions() {
        const o = opt();
        $("pdColour").textContent = o.name || "";
        $("pdSwatches").innerHTML = p.options.map((op, n) =>
            `<button type="button" class="pd-swatch" role="radio" aria-checked="${n === s.opt}" data-k="${n}" title="${op.name}" aria-label="${op.name}"><span style="--c:${op.color}"></span></button>`).join("");
        $("pdSizes").innerHTML = (p.sizes || []).map((z, n) =>
            `<button type="button" class="qv-size" role="radio" aria-checked="${n === s.size}" data-s="${n}">${z.label}<small>${money(z.price)}</small></button>`).join("");
        $("pdPrice").innerHTML = `${money(price())} <small>CAD</small>`;
        $("pdCode").textContent = `Code ${code()}`;
        $("pdThumbs").innerHTML = o.photos.map((src, n) =>
            `<button type="button" data-ph="${n}" aria-label="Photo ${n + 1}"><img src="${src}" alt=""></button>`).join("");
        $("pdThumbs").hidden = o.photos.length < 2;
        $("pdBandImg").src = o.photos[1] || o.photos[0];
        $("pdStickyImg").src = o.photos[0];
        $("pdStickyName").textContent = p.name + (o.name && p.options.length > 1 ? ` · ${o.name}` : "");
        $("pdStickyPrice").textContent = `${money(price())} CAD`;
        showPhoto();
    }
    function showPhoto() {
        const list = opt().photos;
        s.photo = (s.photo + list.length) % list.length;
        const img = $("pdImg");
        img.classList.remove("is-in");
        void img.offsetWidth;
        img.src = list[s.photo];
        img.alt = `${p.name}${opt().name ? " — " + opt().name : ""}, photo ${s.photo + 1}`;
        img.classList.add("is-in");
        $("pdCounter").textContent = `${s.photo + 1} / ${list.length}`;
        document.querySelectorAll(".pd-stage .pd-nav").forEach((b) => { b.hidden = list.length < 2; });
        $("pdThumbs").querySelectorAll("button").forEach((b, n) => b.setAttribute("aria-current", n === s.photo));
        if (!$("pdLightbox").hidden) showLightbox();
    }

    document.querySelector(".pd-info").addEventListener("click", (e) => {
        const sw = e.target.closest(".pd-swatch");
        if (sw) {
            s.opt = Number(sw.dataset.k); s.photo = 0;
            const u = new URLSearchParams(location.search);
            u.set("colour", opt().name);
            history.replaceState(null, "", "?" + u);
            renderOptions();
            return;
        }
        const sz = e.target.closest(".qv-size");
        if (sz) { s.size = Number(sz.dataset.s); renderOptions(); return; }
        const step = e.target.closest("[data-qty]");
        if (step) { s.qty = Math.min(20, Math.max(1, s.qty + Number(step.dataset.qty))); $("pdQty").textContent = s.qty; }
    });
    $("pdThumbs").addEventListener("click", (e) => {
        const b = e.target.closest("[data-ph]");
        if (b) { s.photo = Number(b.dataset.ph); showPhoto(); }
    });
    document.querySelector(".pd-stage .pd-prev").addEventListener("click", () => { s.photo--; showPhoto(); });
    document.querySelector(".pd-stage .pd-next").addEventListener("click", () => { s.photo++; showPhoto(); });

    /* hover zoom on desktop: the photo follows the cursor */
    const stage = $("pdStage");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    stage.addEventListener("mousemove", (e) => {
        if (!fine.matches || e.target.closest("button")) { stage.classList.remove("is-zoom"); return; }
        const r = stage.getBoundingClientRect();
        $("pdImg").style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
        stage.classList.add("is-zoom");
    });
    stage.addEventListener("mouseleave", () => stage.classList.remove("is-zoom"));

    /* swipe between photos */
    let sx = null;
    stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
        if (sx === null) return;
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) { s.photo += dx < 0 ? 1 : -1; showPhoto(); }
        sx = null;
    });

    /* ---------- full-screen photos ---------- */
    const lb = $("pdLightbox");
    function showLightbox() {
        const list = opt().photos;
        $("pdLbImg").src = list[s.photo];
        $("pdLbImg").alt = $("pdImg").alt;
        $("pdLbCounter").textContent = `${s.photo + 1} / ${list.length}`;
        lb.querySelectorAll(".pd-nav").forEach((b) => { b.hidden = list.length < 2; });
    }
    const openLb = () => { lb.hidden = false; document.body.classList.add("sp-lock"); showLightbox(); lb.querySelector(".pd-lb-close").focus(); };
    const closeLb = () => { lb.hidden = true; document.body.classList.remove("sp-lock"); $("pdZoom").focus(); };
    $("pdZoom").addEventListener("click", openLb);
    $("pdImg").addEventListener("click", openLb);
    lb.querySelector(".pd-lb-close").addEventListener("click", closeLb);
    lb.querySelector(".pd-lb-prev").addEventListener("click", () => { s.photo--; showPhoto(); });
    lb.querySelector(".pd-lb-next").addEventListener("click", () => { s.photo++; showPhoto(); });
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", (e) => {
        if (lb.hidden) return;
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowRight") { s.photo++; showPhoto(); }
        if (e.key === "ArrowLeft") { s.photo--; showPhoto(); }
    });

    /* ---------- cart, wishlist, share ---------- */
    const toast = (msg) => {
        const t = $("pdToast");
        t.textContent = msg;
        t.classList.add("is-show");
        clearTimeout(t._t);
        t._t = setTimeout(() => t.classList.remove("is-show"), 2400);
    };
    function add(btn) {
        window.hcgAddToCart([{
            code: code(),
            name: p.name + (p.sizes ? ` (${p.sizes[s.size].label})` : ""),
            option: opt().name, price: price(), qty: s.qty,
        }], btn);
        toast(`${s.qty} × ${p.name} added to your cart`);
    }
    $("pdAdd").addEventListener("click", () => add($("pdAdd")));
    $("pdStickyAdd").addEventListener("click", () => add($("pdStickyAdd")));

    function paintWish() {
        const on = window.hcgWish.has(p.code);
        $("pdWish").classList.toggle("is-on", on);
        $("pdWish").setAttribute("aria-pressed", on);
        $("pdWish").querySelector("i").className = `fa-${on ? "solid" : "regular"} fa-heart`;
    }
    $("pdWish").addEventListener("click", () => {
        const on = window.hcgWish.toggle(p.code);
        paintWish();
        toast(on ? "Saved to your wishlist" : "Removed from your wishlist");
    });

    $("pdShare").addEventListener("click", async () => {
        const data = { title: p.name, text: `${p.name} — Home Centre Green`, url: location.href };
        try {
            if (navigator.share) { await navigator.share(data); return; }
            await navigator.clipboard.writeText(location.href);
            toast("Link copied");
        } catch (err) { /* share sheet dismissed */ }
    });

    /* sticky buy bar once the main button scrolls out of view */
    const sticky = $("pdSticky");
    new IntersectionObserver(([entry]) => {
        const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        sticky.classList.toggle("is-show", show);
        sticky.setAttribute("aria-hidden", !show);
        $("pdStickyAdd").tabIndex = show ? 0 : -1;
    }).observe($("pdBuy"));

    /* ---------- tabs ---------- */
    const tabs = [...document.querySelectorAll(".pd-tabs [role=tab]")];
    function selectTab(tab) {
        tabs.forEach((t, n) => {
            const on = t === tab;
            t.setAttribute("aria-selected", on);
            t.tabIndex = on ? 0 : -1;
            $("pdPanel" + n).hidden = !on;
        });
    }
    tabs.forEach((t, n) => {
        t.tabIndex = n === 0 ? 0 : -1;
        t.addEventListener("click", () => selectTab(t));
        t.addEventListener("keydown", (e) => {
            const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            if (!d) return;
            const next = tabs[(n + d + tabs.length) % tabs.length];
            selectTab(next);
            next.focus();
        });
    });

    /* ---------- related + recently viewed ---------- */
    const others = PRODUCTS.filter((x) => x !== p);
    /* same room first, then the rest */
    const related = others.filter((x) => x.cat === p.cat).concat(others.filter((x) => x.cat !== p.cat)).slice(0, 4);
    $("pdRelatedGrid").innerHTML = related.map(window.hcgCard).join("");
    window.hcgBindCards($("pdRelatedGrid"));

    let recent = [];
    try { recent = JSON.parse(localStorage.getItem("hcg_recent")) || []; } catch (err) { }
    const recentProducts = recent.filter((c) => c !== p.code).map((c) => PRODUCTS.find((x) => x.code === c)).filter(Boolean).slice(0, 4);
    if (recentProducts.length) {
        $("pdRecent").hidden = false;
        $("pdRecentGrid").innerHTML = recentProducts.map(window.hcgCard).join("");
        window.hcgBindCards($("pdRecentGrid"));
    }
    recent = [p.code].concat(recent.filter((c) => c !== p.code)).slice(0, 8);
    try { localStorage.setItem("hcg_recent", JSON.stringify(recent)); } catch (err) { }

    renderOptions();
    paintWish();
})();
