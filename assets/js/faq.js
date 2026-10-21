/* ---------- FAQ (demo) ----------
   `cat` picks the icon beside each question (see ICONS).
   Temporary content: edit the answers or load them from the backend later. */
(function () {
    /* Font Awesome icon shown beside each question, by topic */
    const ICONS = {
        delivery: "fa-truck-fast",
        assembly: "fa-screwdriver-wrench",
        payment: "fa-credit-card",
        products: "fa-couch",
        warranty: "fa-shield-halved",
    };

    const FAQS = [
        { cat: "delivery", q: "Do you deliver?",
          a: "Yes. We deliver across Hamilton and nearby areas in Ontario. Delivery is free on orders over our minimum order amount, and we confirm the cost for anything else before you pay." },
        { cat: "delivery", q: "How long does delivery take?",
          a: "Pieces that are in stock are usually delivered within a few days. We call you to agree on a day and time that suits you." },
        { cat: "assembly", q: "Do you assemble the furniture?",
          a: "Yes. Our team assembles beds, sofa sets and TV units in your home and takes the packaging away with them." },
        { cat: "payment", q: "How can I pay?",
          a: "You can pay by credit or debit card. Prices on the website are in Canadian dollars (CAD)." },
        { cat: "payment", q: "Can I pay in instalments?",
          a: "Yes, we offer flexible payment options on larger orders. Contact us and we will explain the plans available for your order." },
        { cat: "products", q: "Where is your furniture made?",
          a: "Our sofa sets, beds, TV units and carpets are made in Turkey." },
        { cat: "products", q: "Do the beds have storage?",
          a: "Yes. Our queen beds and upholstered single beds come with built-in storage underneath." },
        { cat: "products", q: "What sizes do the carpets come in?",
          a: "The Turkish embroidered carpets come in three sizes: 300 × 200 cm, 350 × 250 cm and 500 × 400 cm." },
        { cat: "products", q: "Can I choose a different colour?",
          a: "Many pieces come in more than one colour. The sofa set comes in grey, rust, taupe and mocha, and the upholstered single bed in grey, cream and pink. Pick a colour on the product to see it." },
        { cat: "warranty", q: "Is there a warranty?",
          a: "Yes, our furniture comes with a warranty. If anything goes wrong, contact us with your order details and we will take care of it." },
    ];

    const list = document.querySelector("#faq .fq-list");
    if (!list) return;
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    list.innerHTML = FAQS.map((f, i) => `
        <div class="fq-item${i === 0 ? " is-open" : ""}">
            <h3>
                <button type="button" class="fq-q" id="fq-q${i}" aria-expanded="${i === 0}" aria-controls="fq-a${i}">
                    <span class="fq-ic" aria-hidden="true"><i class="fa-solid ${ICONS[f.cat]}"></i></span>
                    <span class="fq-text">${esc(f.q)}</span>
                    <span class="fq-toggle" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
                </button>
            </h3>
            <div class="fq-a" id="fq-a${i}" role="region" aria-labelledby="fq-q${i}">
                <div><p>${esc(f.a)}</p></div>
            </div>
        </div>`).join("");

    /* one answer open at a time */
    const items = [...list.querySelectorAll(".fq-item")];
    list.addEventListener("click", (e) => {
        const btn = e.target.closest(".fq-q");
        if (!btn) return;
        const item = btn.closest(".fq-item");
        const open = !item.classList.contains("is-open");
        items.forEach((it) => {
            const on = it === item && open;
            it.classList.toggle("is-open", on);
            it.querySelector(".fq-q").setAttribute("aria-expanded", on);
        });
    });
})();
