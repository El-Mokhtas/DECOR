/* ---------- Checkout (demo) ----------
   Validates the form and shows a confirmation. Nothing typed here is stored
   or sent anywhere: real card payments must go through a payment provider's
   secure fields (e.g. Stripe or Moneris) once the backend exists. */
(function () {
    const FREE_DELIVERY_MIN = 1000; // TODO: keep in sync with cart.js
    const DELIVERY_FEE = 99;        // TODO: real delivery price below the minimum
    const HST = 0.13;

    const PRODUCTS = window.HCG_PRODUCTS || [];
    const $ = (id) => document.getElementById(id);
    const money = (n) => "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem("ssdesign_cart")) || []; } catch (e) { }

    if (!cart.length) {
        $("coForm").hidden = true;
        $("coEmpty").hidden = false;
        document.querySelector(".co-demo").hidden = true;
        return;
    }

    const photo = (it) => {
        const p = PRODUCTS.find((x) => x.code === it.code || (x.sizes || []).some((s) => s.code === it.code));
        if (!p) return "assets/imgs/fav.png";
        return (p.options.find((o) => o.name === it.option) || p.options[0]).photos[0];
    };

    /* ---------- summary ---------- */
    const sub = cart.reduce((s, it) => s + it.price * (it.qty || 1), 0);
    const method = () => document.querySelector('input[name="method"]:checked').value;
    function totals() {
        const ship = method() === "pickup" || sub >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
        const tax = (sub + ship) * HST;
        $("coSub").textContent = money(sub);
        $("coShip").innerHTML = ship ? money(ship) : '<span class="ct-free-tag">Free</span>';
        $("coAssembly").textContent = method() === "pickup" ? "Not included" : "Included";
        $("coAssembly").className = method() === "pickup" ? "" : "ct-free-tag";
        $("coTax").textContent = money(tax);
        $("coTotal").textContent = money(sub + ship + tax);
        $("coSumTotalTop").textContent = money(sub + ship + tax);
        $("coShipLabel").textContent = sub >= FREE_DELIVERY_MIN ? "Free" : money(DELIVERY_FEE);
        $("coPlace").querySelector("span").textContent = `Place order · ${money(sub + ship + tax)}`;
    }
    $("coItems").innerHTML = cart.map((it) => `
        <li>
            <span class="co-item-img"><img src="${photo(it)}" alt=""><b>${it.qty || 1}</b></span>
            <span class="co-item-text"><strong>${esc(it.name)}</strong><small>${esc(it.option || "")}</small></span>
            <span class="co-item-price">${money(it.price * (it.qty || 1))}</span>
        </li>`).join("");
    totals();

    /* mobile: summary collapses into a bar */
    $("coSumToggle").addEventListener("click", () => {
        const open = document.querySelector(".co-summary").classList.toggle("is-open");
        $("coSumToggle").setAttribute("aria-expanded", open);
        $("coSumLabel").textContent = open ? "Hide order summary" : "Show order summary";
    });

    /* delivery vs pickup */
    document.querySelectorAll('input[name="method"]').forEach((r) => r.addEventListener("change", () => {
        $("coAddress").hidden = method() === "pickup";
        totals();
    }));

    /* next 8 delivery days (no Sundays) */
    const days = [];
    for (let d = new Date(), n = 0; days.length < 8 && n < 14; n++) {
        d = new Date(Date.now() + (n + 2) * 864e5);
        if (d.getDay() !== 0) days.push(d);
    }
    $("coDays").innerHTML = days.map((d, i) => `
        <label class="co-day">
            <input type="radio" name="day" value="${d.toISOString().slice(0, 10)}" ${i === 0 ? "checked" : ""}>
            <span><small>${d.toLocaleDateString("en-CA", { weekday: "short" })}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString("en-CA", { month: "short" })}</small></span>
        </label>`).join("");

    /* ---------- payment tabs ---------- */
    let pay = "card";
    document.querySelectorAll(".co-tabs [data-pay]").forEach((t) => t.addEventListener("click", () => {
        pay = t.dataset.pay;
        document.querySelectorAll(".co-tabs [data-pay]").forEach((x) => x.setAttribute("aria-selected", x === t));
        document.querySelectorAll(".co-pay").forEach((p) => { p.hidden = p.dataset.panel !== pay; });
    }));

    /* ---------- live card preview + formatting ---------- */
    const num = $("coCardNum"), exp = $("coExp"), cvc = $("coCvc"), cname = $("coCardName"), cc = $("coCC");
    const brandOf = (d) => /^4/.test(d) ? "visa" : /^(5[1-5]|2[2-7])/.test(d) ? "mastercard" : /^3[47]/.test(d) ? "amex" : "";
    num.addEventListener("input", () => {
        const d = num.value.replace(/\D/g, "").slice(0, 19);
        num.value = d.replace(/(.{4})/g, "$1 ").trim();
        const shown = (d + "•".repeat(Math.max(0, 16 - d.length))).replace(/(.{4})/g, "$1 ").trim();
        $("coCCNum").textContent = shown;
        const b = brandOf(d);
        $("coBrand").className = b ? `fa-brands fa-cc-${b}` : "fa-solid fa-credit-card";
        cc.dataset.brand = b;
    });
    cname.addEventListener("input", () => { $("coCCName").textContent = cname.value.trim().toUpperCase() || "YOUR NAME"; });
    exp.addEventListener("input", (e) => {
        let d = exp.value.replace(/\D/g, "").slice(0, 4);
        if (d.length >= 3 || (d.length === 2 && e.inputType !== "deleteContentBackward")) d = d.slice(0, 2) + "/" + d.slice(2);
        exp.value = d;
        $("coCCExp").textContent = exp.value || "MM/YY";
    });
    cvc.addEventListener("input", () => { cvc.value = cvc.value.replace(/\D/g, "").slice(0, 4); $("coCCCvc").textContent = cvc.value ? "•".repeat(cvc.value.length) : "•••"; });
    cvc.addEventListener("focus", () => cc.classList.add("is-flipped"));
    cvc.addEventListener("blur", () => cc.classList.remove("is-flipped"));

    const postal = $("coPostal");
    postal.addEventListener("input", () => {
        const v = postal.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
        postal.value = v.length > 3 ? v.slice(0, 3) + " " + v.slice(3) : v;
    });

    /* ---------- validation ---------- */
    const luhn = (d) => {
        let s = 0;
        for (let i = 0; i < d.length; i++) {
            let n = Number(d[d.length - 1 - i]);
            if (i % 2) { n *= 2; if (n > 9) n -= 9; }
            s += n;
        }
        return d.length >= 13 && s % 10 === 0;
    };
    const rules = {
        coEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address.",
        coPhone: (v) => v.replace(/\D/g, "").length >= 10 || "Enter a 10-digit phone number.",
        coFirst: (v) => !!v || "Enter your first name.",
        coLast: (v) => !!v || "Enter your last name.",
        coStreet: (v) => !!v || "Enter your street address.",
        coCity: (v) => !!v || "Enter your city.",
        coPostal: (v) => /^[ABCEGHJ-NPRSTVXY]\d[A-Z] ?\d[A-Z]\d$/.test(v) || "Enter a valid Canadian postal code, e.g. L8P 1A1.",
        coCardNum: (v) => luhn(v.replace(/\D/g, "")) || "Check your card number.",
        coCardName: (v) => !!v || "Enter the name on the card.",
        coExp: (v) => {
            const m = /^(\d{2})\/(\d{2})$/.exec(v);
            if (!m || +m[1] < 1 || +m[1] > 12) return "Use MM/YY.";
            const end = new Date(2000 + +m[2], +m[1], 1);
            return end > new Date() || "This card has expired.";
        },
        coCvc: (v) => /^\d{3,4}$/.test(v) || "Enter the 3 or 4 digit code.",
    };
    function active(id) {
        if (["coFirst", "coLast", "coStreet", "coCity", "coPostal"].includes(id)) return method() === "delivery";
        if (["coCardNum", "coCardName", "coExp", "coCvc"].includes(id)) return pay === "card";
        return true;
    }
    function check(id) {
        const el = $(id);
        const res = active(id) ? rules[id](el.value.trim()) : true;
        const field = el.closest(".co-field");
        field.classList.toggle("is-bad", res !== true);
        field.classList.toggle("is-ok", res === true && !!el.value.trim() && active(id));
        el.setAttribute("aria-invalid", res !== true);
        field.querySelector(".co-err").textContent = res === true ? "" : res;
        return res === true;
    }
    Object.keys(rules).forEach((id) => {
        $(id).addEventListener("blur", () => { if ($(id).value) check(id); });
        $(id).addEventListener("input", () => { if ($(id).closest(".co-field").classList.contains("is-bad")) check(id); });
    });

    /* step indicator follows the section in view */
    const stepSpy = new IntersectionObserver(([e]) => {
        const onPay = e.isIntersecting || e.boundingClientRect.top < 0;
        $("coStepPay").classList.toggle("is-current", onPay);
        $("coStepDetails").classList.toggle("is-current", !onPay);
        $("coStepDetails").classList.toggle("is-done", onPay);
    }, { rootMargin: "0px 0px -60% 0px" });
    stepSpy.observe($("coPaySection"));

    /* ---------- place order ---------- */
    $("coCheckout").addEventListener("submit", (e) => {
        e.preventDefault();
        const bad = Object.keys(rules).filter((id) => !check(id));
        const terms = $("coTerms").checked;
        $("coTermsErr").textContent = terms ? "" : "Please accept the terms to continue.";
        if (bad.length || !terms) {
            const first = bad.length ? $(bad[0]) : $("coTerms");
            first.scrollIntoView({ behavior: "smooth", block: "center" });
            first.focus({ preventScroll: true });
            return;
        }
        const btn = $("coPlace");
        btn.disabled = true;
        btn.classList.add("is-loading");
        btn.querySelector("span").textContent = "Placing order…";
        setTimeout(() => {
            const pickup = method() === "pickup";
            const day = document.querySelector('input[name="day"]:checked');
            if (pickup) $("coDoneTitle").textContent = "Thank you!";
            else $("coDoneName").textContent = $("coFirst").value.trim();
            $("coDoneNum").textContent = "#HCG-" + String(Date.now()).slice(-6);
            $("coDoneEmail").textContent = $("coEmail").value.trim();
            $("coDoneWhen").textContent = pickup
                ? "a pickup time at the showroom"
                : `delivery on ${new Date(day.value + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}`;
            try { localStorage.removeItem("ssdesign_cart"); } catch (err) { }
            stepSpy.disconnect();
            const back = document.querySelector(".co-back");
            back.href = "index.html";
            back.querySelector("span").textContent = "Back to home";
            $("coForm").hidden = true;
            document.querySelector(".co-demo").hidden = true;
            document.querySelectorAll(".co-steps li").forEach((li) => {
                li.classList.remove("is-current");
                li.classList.add("is-done");
                const n = li.querySelector("span");
                if (n) n.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';
            });
            $("coDone").hidden = false;
            scrollTo({ top: 0 });
            $("coDone").focus();
        }, 900);
    });
})();
