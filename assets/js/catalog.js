/* ---------- Catalogue + cart + wishlist, shared by every page ----------
   Prices are CAD, from the Home Centre Green inventory list.
   Each option is a colour: `photos[0]` is the main photo, `photos[1]` shows on hover.
   `sizes` (optional) lets the customer pick a size that sets the price. */
(function () {
    const P = "assets/imgs/products/";
    const set = (dir, order) => order.map((n) => `${P}${dir}/${n}.jpg`);

    const PRODUCTS = [
        {
            code: "D0-0002", name: "Turkish Sofa Set", cat: "Living", price: 4000,
            meta: "220 × 90 × 80 cm",
            desc: "A generous tufted sofa set with matching armchairs, finished with brushed gold legs and accent cushions. Made in Turkey.",
            options: [
                { name: "Grey", color: "#C9C6BE", photos: set("sofa-set/grey", [1, 5, 2, 3, 4]) },
                { name: "Rust", color: "#B5653A", photos: set("sofa-set/rust", [1, 2, 3, 4, 5, 6]) },
                { name: "Taupe", color: "#8E8178", photos: set("sofa-set/taupe", [1, 2, 3, 4, 5]) },
                { name: "Mocha", color: "#7A6458", photos: set("sofa-set/mocha", [1, 3, 2]) },
            ],
        },
        {
            code: "DB-0001", name: "Turkish Embroidered Carpet", cat: "Carpets", price: 100, from: true,
            meta: "3 sizes, up to 500 × 400 cm",
            desc: "A richly embroidered Turkish carpet with a classic medallion pattern and a soft, low pile that is easy to live with.",
            sizes: [
                { label: "300 × 200 cm", price: 100, code: "DB-0001" },
                { label: "350 × 250 cm", price: 200, code: "DB-0002" },
                { label: "500 × 400 cm", price: 300, code: "DB-0003" },
            ],
            options: [
                { name: "Navy", color: "#1F2A44", photos: set("carpet/navy", [1, 2, 3]) },
                { name: "Red", color: "#8E1F24", photos: set("carpet/red", [1, 2, 3]) },
                { name: "Sage", color: "#7F8B7A", photos: set("carpet/sage", [1, 2, 3]) },
            ],
        },
        {
            code: "BR-0002", name: "White Queen Bed", cat: "Bedroom", price: 2500,
            meta: "Queen size, with storage",
            desc: "A channel-tufted queen bed trimmed in gold, with generous built-in storage underneath.",
            options: [{ name: "White", color: "#F2EEE6", photos: set("queen-bed-white", [1, 2, 3, 4, 5]) }],
        },
        {
            code: "BR-0003", name: "Yellow Queen Bed", cat: "Bedroom", price: 3000,
            meta: "Queen size, with storage",
            desc: "A sculpted wave headboard and a matching upholstered bench, with built-in storage underneath.",
            options: [{ name: "Cream", color: "#EADFC8", photos: set("queen-bed-yellow", [1, 2, 3, 4]) }],
        },
        {
            code: "BR-0001", name: "Brown Queen Bed", cat: "Bedroom", price: 3000,
            meta: "Queen size, with storage",
            desc: "A warm brown queen bed with a panelled headboard, a matching bench and built-in storage.",
            options: [{ name: "Brown", color: "#8A7060", photos: set("queen-bed-brown", [1]) }],
        },
        {
            code: "BR-0006", name: "Upholstered Single Bed", cat: "Bedroom", price: 700, from: true,
            meta: "90 or 120 cm wide, with storage",
            desc: "A soft upholstered single bed with a statement headboard and built-in storage — ideal for kids' and teens' rooms.",
            sizes: [
                { label: "90 × 200 cm", price: 750, code: "BR-0005" },
                { label: "120 × 200 cm", price: 700, code: "BR-0006" },
            ],
            options: [
                { name: "Grey", color: "#A9A7A2", photos: set("single-bed/grey", [1, 3, 2]) },
                { name: "Cream", color: "#EDE3D3", photos: set("single-bed/cream", [2, 1, 3]) },
                { name: "Pink", color: "#D4878F", photos: set("single-bed/pink", [1]) },
            ],
        },
        {
            code: "D0-0004", name: "Fireplace & TV Unit", cat: "Living", price: 500,
            meta: "180 × 40 × 50 cm",
            desc: "A curved TV unit with a built-in electric fireplace and gold details, for a warm focal point in the living room.",
            options: [{ name: "Cream", color: "#EFE6D6", photos: set("tv-fireplace", [1, 2]) }],
        },
    ];
    /* older code reads `img` / `alt` */
    PRODUCTS.forEach((p) => p.options.forEach((o) => { o.img = o.photos[0]; o.alt = o.photos[1]; }));
    window.HCG_PRODUCTS = PRODUCTS;

    /* ---- demo cart in localStorage + header count ---- */
    function readCart() {
        try { return JSON.parse(localStorage.getItem("ssdesign_cart")) || []; } catch (err) { return []; }
    }
    function addToCart(items, btn) {
        const cart = readCart();
        items.forEach((item) => {
            const qty = item.qty || 1;
            const line = cart.find((it) => it.code === item.code && it.option === item.option);
            if (line) line.qty = (line.qty || 1) + qty;
            else cart.push(Object.assign({}, item, { qty }));
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
    window.hcgAddToCart = addToCart;

    /* any button with data-add='[{code,name,option,price}, ...]' adds those items */
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-add]");
        if (btn) addToCart(JSON.parse(btn.dataset.add), btn);
    });

    /* ---- wishlist kept in this browser (demo) ---- */
    let wish = [];
    try { wish = JSON.parse(localStorage.getItem("hcg_wishlist")) || []; } catch (err) { }
    window.hcgWish = {
        has: (code) => wish.includes(code),
        toggle(code) {
            const on = !wish.includes(code);
            wish = on ? wish.concat(code) : wish.filter((c) => c !== code);
            try { localStorage.setItem("hcg_wishlist", JSON.stringify(wish)); } catch (err) { }
            return on;
        },
    };
})();
