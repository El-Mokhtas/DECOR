/* ---------- Cart page ----------
   Reads and edits the demo cart saved in localStorage by catalog.js.
   Totals are estimates (HST 13% for Ontario); the backend will confirm them. */
(function () {
    const FREE_DELIVERY_MIN = 1000; // TODO: real minimum order for free delivery (CAD)
    const HST = 0.13;
    const PROMOS = {}; // e.g. { WELCOME10: 0.10 } — none are live yet

    const PRODUCTS = window.HCG_PRODUCTS || [];
    const $ = (id) => document.getElementById(id);
    const money = (n) => "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    const read = () => { try { return JSON.parse(localStorage.getItem("ssdesign_cart")) || []; } catch (e) { return []; } };
    const write = (c) => { try { localStorage.setItem("ssdesign_cart", JSON.stringify(c)); } catch (e) { } };
    let cart = read();
    let promo = null;

    /* find the product (sized items use the size's code) and the chosen colour's photo */
    function lookup(item) {
        const p = PRODUCTS.find((x) => x.code === item.code || (x.sizes || []).some((s) => s.code === item.code));
        if (!p) return { p: null, img: "assets/imgs/fav.png" };
        const o = p.options.find((x) => x.name === item.option) || p.options[0];
        return { p, img: o.photos[0], cat: p.cat, url: `product.html?p=${p.code}${o.name && p.options.length > 1 ? "&colour=" + encodeURIComponent(o.name) : ""}` };
    }

    function headerCount() {
        const n = cart.reduce((s, it) => s + (it.qty || 1), 0);
        const el = $("cartCount");
        if (el) el.textContent = n || "";
        return n;
    }

    /* ---------- render ---------- */
    function render() {
        const n = headerCount();
        $("ctCount").textContent = n ? `(${n})` : "";
        $("ctFull").hidden = !cart.length;
        $("ctEmpty").hidden = !!cart.length;
        $("ctBar").hidden = !cart.length;

        $("ctList").innerHTML = cart.map((it, i) => {
            const { p, img, cat, url } = lookup(it);
            const qty = it.qty || 1;
            return `
            <li class="ct-item" data-i="${i}">
                <a class="ct-img" href="${url || "shop.html"}"><img src="${img}" alt=""></a>
                <div class="ct-info">
                    <span class="ct-cat">${esc(cat || "")}</span>
                    <h3><a href="${url || "shop.html"}">${esc(it.name)}</a></h3>
                    <p class="ct-opts">${it.option ? `<span><i style="background:${(p && (p.options.find((o) => o.name === it.option) || {}).color) || "#ccc"}"></i>${esc(it.option)}</span>` : ""}<span>Code ${esc(it.code)}</span></p>
                    <p class="ct-unit">${money(it.price)} each</p>
                    <div class="ct-item-actions">
                        <button type="button" data-act="save"><i class="fa-regular fa-heart" aria-hidden="true"></i> Save for later</button>
                        <button type="button" data-act="remove"><i class="fa-regular fa-trash-can" aria-hidden="true"></i> Remove</button>
                    </div>
                </div>
                <div class="ct-right">
                    <div class="qv-qty ct-qty" aria-label="Quantity">
                        <button type="button" data-act="dec" aria-label="Decrease quantity" ${qty <= 1 ? "disabled" : ""}><i class="fa-solid fa-minus" aria-hidden="true"></i></button>
                        <output>${qty}</output>
                        <button type="button" data-act="inc" aria-label="Increase quantity"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
                    </div>
                    <strong class="ct-line">${money(it.price * qty)}</strong>
                </div>
            </li>`;
        }).join("");

        /* totals */
        const sub = cart.reduce((s, it) => s + it.price * (it.qty || 1), 0);
        const disc = promo ? sub * PROMOS[promo] : 0;
        const tax = (sub - disc) * HST;
        const free = sub >= FREE_DELIVERY_MIN;
        $("ctSub").textContent = money(sub);
        $("ctShip").innerHTML = free ? '<span class="ct-free-tag">Free</span>' : "Calculated at checkout";
        $("ctTax").textContent = money(tax);
        $("ctDiscRow").hidden = !promo;
        if (promo) { $("ctDiscLabel").textContent = `Promo ${promo}`; $("ctDisc").textContent = "−" + money(disc); }
        $("ctTotal").textContent = money(sub - disc + tax);
        $("ctBarTotal").textContent = money(sub - disc + tax);

        /* free delivery progress */
        const left = FREE_DELIVERY_MIN - sub;
        $("ctFree").classList.toggle("is-done", free);
        $("ctFreeText").innerHTML = free
            ? "<b>You've unlocked free delivery</b> in Hamilton."
            : `You're <b>${money(left)}</b> away from free delivery.`;
        $("ctFreeBar").style.width = Math.min(100, (sub / FREE_DELIVERY_MIN) * 100) + "%";

        /* suggestions: products not already in the cart */
        const inCart = new Set(cart.map((it) => (lookup(it).p || {}).code));
        const sugg = PRODUCTS.filter((p) => !inCart.has(p.code)).slice(0, 4);
        $("ctSuggest").innerHTML = sugg.map(window.hcgCard).join("");
        $("ctSuggest").closest("section").hidden = !sugg.length;
    }

    /* ---------- toast with undo ---------- */
    let undo = null;
    function toast(msg, onUndo) {
        const t = $("ctToast");
        $("ctToastText").textContent = msg;
        undo = onUndo || null;
        $("ctUndo").hidden = !onUndo;
        t.classList.add("is-show");
        clearTimeout(t._t);
        t._t = setTimeout(() => { t.classList.remove("is-show"); undo = null; }, 4000);
    }
    $("ctUndo").addEventListener("click", () => {
        if (undo) undo();
        $("ctToast").classList.remove("is-show");
        undo = null;
    });

    /* ---------- item actions ---------- */
    $("ctList").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const li = btn.closest(".ct-item");
        const i = Number(li.dataset.i);
        const it = cart[i];
        const act = btn.dataset.act;
        if (act === "inc") it.qty = Math.min(20, (it.qty || 1) + 1);
        if (act === "dec") it.qty = Math.max(1, (it.qty || 1) - 1);
        if (act === "remove" || act === "save") {
            const removed = cart.splice(i, 1)[0];
            if (act === "save") {
                const p = lookup(removed).p;
                if (p && !window.hcgWish.has(p.code)) window.hcgWish.toggle(p.code);
            }
            li.classList.add("is-leaving");
            setTimeout(() => { write(cart); render(); }, 280);
            toast(act === "save" ? `${removed.name} saved to your wishlist` : `${removed.name} removed`, () => {
                cart.splice(i, 0, removed);
                write(cart);
                render();
            });
            return;
        }
        write(cart);
        render();
    });

    $("ctClear").addEventListener("click", () => {
        const old = cart.slice();
        cart = [];
        write(cart);
        render();
        toast("Your cart is empty", () => { cart = old; write(cart); render(); });
    });

    /* ---------- promo code ---------- */
    $("ctPromo").addEventListener("submit", (e) => {
        e.preventDefault();
        const code = $("ctCode").value.trim().toUpperCase();
        const msg = $("ctPromoMsg");
        if (!code) return;
        if (PROMOS[code]) {
            promo = code;
            msg.textContent = `Code ${code} applied.`;
            msg.className = "ct-promo-msg is-ok";
        } else {
            promo = null;
            msg.textContent = "This code isn't valid.";
            msg.className = "ct-promo-msg is-bad";
        }
        render();
    });

    /* ---------- checkout ---------- */
    document.querySelectorAll("#ctCheckout, [data-checkout]").forEach((b) =>
        b.addEventListener("click", () => { location.href = "checkout.html"; }));

    window.hcgBindCards($("ctSuggest"));
    /* adding a suggestion updates the cart list */
    $("ctSuggest").addEventListener("click", (e) => {
        if (!e.target.closest(".pc-add")) return;
        setTimeout(() => { cart = read(); render(); }, 0);
    });

    render();
})();
